"""
ingest_us.py — Idempotent US HTS knowledge-graph ingestion pipeline for TradeMate.

Execution order (memory-first — no Neo4j writes until everything is ready):
  1. Parse ALL CSV files in data/US-HTS/ → build nodes_list + relationships_list
  2. Load checkpoint → filter nodes_list to new UIDs only
  3. Generate OpenAI embeddings in memory (new nodes only)
  4. Create Neo4j constraint (idempotent)
  5. Batch-write new nodes  (UNWIND, 1 000 rows/tx)
  6. Batch-write ALL relationships (UNWIND, 1 000 rows/tx)
     ↑ relationships are always re-merged so a crash between step 5 and 6
       on a prior run does not leave nodes without their HAS_CHILD edges.

Run:
    cd knowledge_graph
    python ingest_us.py

Checkpointer (crash-resume)
───────────────────────────
On startup the script queries the live DB for every existing HSCode:US uid and
builds an O(1) lookup set.  Any node whose uid is already present is skipped
before embeddings are generated or DB writes are attempted.  Relationships are
always written in full — MERGE makes them idempotent and this guarantees that
nodes saved in a previous partial run are correctly linked even if the run
crashed before the relationship phase.
"""

import glob
import hashlib
import logging
import math
import sys
from pathlib import Path
from typing import Any

import pandas as pd
from tqdm import tqdm

from db_utils import get_driver, get_embeddings

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
HTS_DIR = Path(__file__).parent / "data/US-HTS"

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
EMBED_BATCH = 50    # rows per OpenAI API call
NEO4J_BATCH = 1000  # rows per Neo4j UNWIND transaction

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def clean(val: Any) -> str | None:
    """Return None for NaN / blank / sentinel values; strip whitespace otherwise."""
    if val is None:
        return None
    if isinstance(val, float):
        return None if math.isnan(val) else str(val).strip()
    s = str(val).strip()
    return None if s in ("", "nan", "NaN", "None", "#NAME?", "N/A") else s


def normalize_hts(raw: Any) -> str | None:
    """
    Return a clean HTS string or None.

    Handles two common CSV artefacts:
      • Pandas read the code as a float  → "101.0"   should be "0101"
      • Leading zero was stripped in CSV → "101.21"  should be "0101.21"

    HTS codes always begin with a 4-digit chapter code (0001-9999).
    If the first dot-segment is fewer than 4 characters we left-zero-pad it.
    """
    s = clean(raw)
    if s is None:
        return None

    if s.endswith(".0") and s.count(".") == 1:
        s = s[:-2]

    parts = s.split(".")
    if len(parts[0]) < 4:
        parts[0] = parts[0].zfill(4)

    return ".".join(parts)


def make_uid(*parts: Any) -> str:
    """Stable SHA-256 uid — guarantees MERGE idempotency across reruns."""
    combined = "|".join(str(p) for p in parts if p is not None)
    return hashlib.sha256(combined.encode()).hexdigest()


def load_csv(path: Path) -> pd.DataFrame:
    """Load a CSV trying UTF-8 → cp1252 → latin-1 (handles Excel exports)."""
    for enc in ("utf-8", "cp1252", "latin-1"):
        try:
            df = pd.read_csv(path, dtype=str, encoding=enc)
            df.columns = [c.strip() for c in df.columns]
            df = df.loc[:, ~df.columns.str.fullmatch(r"Unnamed.*")]
            return df
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Cannot decode {path.name} with utf-8 / cp1252 / latin-1")


# ---------------------------------------------------------------------------
# Checkpointer
# ---------------------------------------------------------------------------

def load_checkpoint(driver, label: str, id_field: str) -> set[str]:
    """
    Query the DB and return the set of all existing ``id_field`` values for
    nodes with the given label.  Returns an empty set on any error so the
    pipeline degrades to a full re-run rather than crashing.
    """
    try:
        with driver.session() as session:
            result = session.run(
                f"MATCH (n:{label}) WHERE n.{id_field} IS NOT NULL "
                f"RETURN n.{id_field} AS id"
            )
            ids: set[str] = {record["id"] for record in result}
        logger.info(
            "  Checkpointer [%s.%s]: %d existing record(s) found in DB.",
            label, id_field, len(ids),
        )
        return ids
    except Exception as exc:
        logger.warning(
            "  Checkpointer query failed for [%s.%s] — proceeding without "
            "checkpoint (full re-run). Error: %s",
            label, id_field, exc,
        )
        return set()


# ---------------------------------------------------------------------------
# Step 1 — Parse all CSVs into memory
# ---------------------------------------------------------------------------

def parse_all_csvs() -> tuple[list[dict], list[dict]]:
    """
    Read every CSV in HTS_DIR sequentially and build:
      • nodes_list        – one dict per HTS row
      • relationships_list – one dict per parent→child edge

    The indent-based stack is reset at each file boundary because every file
    is an independent chapter that starts at indent 0.
    """
    csv_files = sorted(glob.glob(str(HTS_DIR / "*.csv")))
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {HTS_DIR}")

    logger.info("Found %d CSV files in %s", len(csv_files), HTS_DIR)

    nodes_list: list[dict] = []
    relationships_list: list[dict] = []

    for csv_path in tqdm(csv_files, desc="  Parsing CSV files", unit="file"):
        df = load_csv(Path(csv_path))

        for col in ("HTS Number", "Indent", "Description", "Unit of Quantity",
                    "General Rate of Duty", "Special Rate of Duty",
                    "Column 2 Rate of Duty"):
            if col not in df.columns:
                df[col] = None

        stack: dict[int, str] = {}
        path_descs: dict[int, str] = {}

        for _, row in df.iterrows():
            raw_indent = clean(row.get("Indent"))
            try:
                indent = int(float(raw_indent)) if raw_indent is not None else 0
            except (ValueError, TypeError):
                indent = 0

            description = clean(row.get("Description")) or ""
            hts_code    = normalize_hts(row.get("HTS Number"))

            parent_uid: str | None = stack.get(indent - 1) if indent > 0 else None

            if hts_code:
                uid = make_uid("US", hts_code)
            else:
                uid = make_uid("US", str(parent_uid) if parent_uid else "ROOT", description)

            path_descs[indent] = description
            for k in list(path_descs.keys()):
                if k > indent:
                    del path_descs[k]
            full_path = ": ".join(
                path_descs[i] for i in range(indent + 1) if i in path_descs
            )

            stack[indent] = uid
            for k in list(stack.keys()):
                if k > indent:
                    del stack[k]

            nodes_list.append({
                "uid":                   uid,
                "hts_code":              hts_code,
                "indent":                indent,
                "description":           description,
                "full_path_description": full_path,
                "unit":                  clean(row.get("Unit of Quantity")),
                "general_rate":          clean(row.get("General Rate of Duty")),
                "special_rate":          clean(row.get("Special Rate of Duty")),
                "column_2_rate":         clean(row.get("Column 2 Rate of Duty")),
                "embedding":             None,  # filled in Step 3
            })

            if parent_uid is not None:
                relationships_list.append({
                    "parent_uid": parent_uid,
                    "child_uid":  uid,
                })

    logger.info(
        "  Parsed %d nodes and %d relationships from %d files (before dedup).",
        len(nodes_list), len(relationships_list), len(csv_files),
    )

    # Deduplicate nodes
    seen_uids: dict[str, dict] = {}
    for node in nodes_list:
        seen_uids[node["uid"]] = node
    nodes_list = list(seen_uids.values())

    # Deduplicate relationships
    seen_rels: set[tuple[str, str]] = set()
    unique_rels: list[dict] = []
    for rel in relationships_list:
        key = (rel["parent_uid"], rel["child_uid"])
        if key not in seen_rels:
            seen_rels.add(key)
            unique_rels.append(rel)
    relationships_list = unique_rels

    logger.info(
        "  After dedup: %d unique nodes, %d unique relationships.",
        len(nodes_list), len(relationships_list),
    )
    return nodes_list, relationships_list


# ---------------------------------------------------------------------------
# Step 2 — Apply checkpointer to filter new nodes
# ---------------------------------------------------------------------------

def apply_checkpoint(nodes_list: list[dict], existing_uids: set[str]) -> list[dict]:
    """
    Return only nodes whose uid is NOT already in the DB.
    Logs a clear summary of how many are being skipped vs processed.
    """
    new_nodes = [n for n in nodes_list if n["uid"] not in existing_uids]
    skipped   = len(nodes_list) - len(new_nodes)

    if skipped:
        logger.info(
            "  Checkpointer: %d node(s) already in DB — skipped. "
            "%d new node(s) to embed and write.",
            skipped, len(new_nodes),
        )
    else:
        logger.info(
            "  Checkpointer: no existing nodes found. "
            "Processing all %d node(s).",
            len(new_nodes),
        )

    return new_nodes


# ---------------------------------------------------------------------------
# Step 3 — Generate embeddings (new nodes only, entirely in memory)
# ---------------------------------------------------------------------------

def generate_embeddings(nodes_list: list[dict], embeddings_model) -> None:
    """
    Compute text-embedding-3-small vectors for every node in *nodes_list* and
    store them back in-place under nodes_list[i]["embedding"].
    Only called for new (un-checkpointed) nodes.
    """
    texts = [n["full_path_description"] or n["description"] or "" for n in nodes_list]
    total = len(texts)
    logger.info("  Generating embeddings for %d node(s) (batch=%d) …", total, EMBED_BATCH)

    all_embeddings: list[list[float]] = []
    for start in tqdm(range(0, total, EMBED_BATCH), desc="  Embedding batches", unit="batch"):
        all_embeddings.extend(
            embeddings_model.embed_documents(texts[start : start + EMBED_BATCH])
        )

    for node, emb in zip(nodes_list, all_embeddings):
        node["embedding"] = emb

    logger.info("  Embeddings complete.")


# ---------------------------------------------------------------------------
# Step 4-6 — Neo4j: constraint + node insertion + relationship insertion
# ---------------------------------------------------------------------------

_US_CONSTRAINT = "CREATE CONSTRAINT ON (n:US) ASSERT n.uid IS UNIQUE;"

_NODE_CYPHER = """
UNWIND $batch AS row
MERGE (n:HSCode:US {uid: row.uid})
ON CREATE SET n.hts_code              = row.hts_code,
              n.indent                = row.indent,
              n.description           = row.description,
              n.full_path_description = row.full_path_description,
              n.unit                  = row.unit,
              n.general_rate          = row.general_rate,
              n.special_rate          = row.special_rate,
              n.column_2_rate         = row.column_2_rate,
              n.embedding             = row.embedding
ON MATCH  SET n.hts_code              = row.hts_code,
              n.description           = row.description,
              n.full_path_description = row.full_path_description,
              n.unit                  = row.unit,
              n.general_rate          = row.general_rate,
              n.special_rate          = row.special_rate,
              n.column_2_rate         = row.column_2_rate,
              n.embedding             = row.embedding
"""

_REL_CYPHER = """
UNWIND $batch AS row
MATCH (p:HSCode:US {uid: row.parent_uid})
MATCH (c:HSCode:US {uid: row.child_uid})
MERGE (p)-[:HAS_CHILD]->(c)
"""


def create_us_constraints(driver) -> None:
    """Create the US-specific uniqueness constraint (idempotent)."""
    with driver.session() as session:
        try:
            session.run(_US_CONSTRAINT)
        except Exception as e:
            if "already exists" not in str(e).lower():
                logger.warning("Constraint issue: %s", e)
    logger.info("  US constraint verified / created.")


def insert_nodes(driver, nodes_list: list[dict]) -> None:
    total = len(nodes_list)
    logger.info("  Writing %d new node(s) to Neo4j (batch=%d) …", total, NEO4J_BATCH)
    with driver.session() as session:
        for start in tqdm(range(0, total, NEO4J_BATCH), desc="  Node batches", unit="batch"):
            session.run(_NODE_CYPHER, batch=nodes_list[start : start + NEO4J_BATCH])
    logger.info("  Node insertion complete.")


def insert_relationships(driver, relationships_list: list[dict]) -> None:
    """
    Always run against the FULL relationships list (not the checkpointed subset).
    This guarantees that HAS_CHILD edges are created even when nodes were written
    in a previous run that crashed before the relationship phase completed.
    MERGE makes every write idempotent.
    """
    total = len(relationships_list)
    logger.info(
        "  Writing %d relationship(s) to Neo4j (batch=%d) — always full set …",
        total, NEO4J_BATCH,
    )
    with driver.session() as session:
        for start in tqdm(range(0, total, NEO4J_BATCH), desc="  Relationship batches", unit="batch"):
            session.run(_REL_CYPHER, batch=relationships_list[start : start + NEO4J_BATCH])
    logger.info("  Relationship insertion complete.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    logger.info("╔══════════════════════════════════════════════════════╗")
    logger.info("║  TradeMate Knowledge Graph — US HTS Ingestion        ║")
    logger.info("╚══════════════════════════════════════════════════════╝")

    # ── Phase 1: Parse (no network calls) ───────────────────────────────────
    logger.info("=== PHASE 1: Parsing CSV files ===")
    nodes_list, relationships_list = parse_all_csvs()

    # ── Phase 2: Checkpoint — connect to DB and find existing nodes ─────────
    logger.info("=== PHASE 2: Loading checkpoint from DB ===")
    driver = get_driver()

    try:
        existing_uids = load_checkpoint(driver, "HSCode:US", "uid")
        new_nodes = apply_checkpoint(nodes_list, existing_uids)

        if not new_nodes:
            logger.info("  All nodes already in DB.")
            logger.info("  Checking relationships (always re-merged for completeness) …")
            insert_relationships(driver, relationships_list)
            return

        # ── Phase 3: Embed new nodes only (OpenAI — no Neo4j yet) ───────────
        logger.info("=== PHASE 3: Generating embeddings (new nodes only) ===")
        embeddings_model = get_embeddings()
        generate_embeddings(new_nodes, embeddings_model)

        # ── Phase 4-6: Neo4j writes ──────────────────────────────────────────
        logger.info("=== PHASE 4: Writing to Neo4j ===")
        create_us_constraints(driver)
        insert_nodes(driver, new_nodes)

        # Always insert full relationship set — covers the crash-between-steps edge case
        insert_relationships(driver, relationships_list)

    finally:
        driver.close()
        logger.info("Neo4j driver closed.")

    logger.info("╔══════════════════════════════════════════════════════╗")
    logger.info("║  US HTS ingestion complete!                          ║")
    logger.info("╚══════════════════════════════════════════════════════╝")


if __name__ == "__main__":
    main()
