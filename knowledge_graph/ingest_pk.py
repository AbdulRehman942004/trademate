"""
ingest_pk.py — Idempotent knowledge-graph ingestion pipeline for TradeMate.
             Every node is created with an additional :PK label.

Run:
    cd knowledge_graph
    python ingest_pk.py

All leaf-node steps use UNWIND batching (500 rows per transaction) to minimise
network round-trips.  Re-running is safe — every write uses MERGE.

Checkpointer (crash-resume)
───────────────────────────
On startup each step queries the live DB for its node type's existing IDs and
builds an O(1) lookup set.  Any row whose UID / HS code is already present is
skipped before embeddings are generated or any DB writes are attempted.
"""

import hashlib
import logging
import math
import sys
from pathlib import Path
from typing import Any

import pandas as pd
from tqdm import tqdm

from db_utils import create_constraints, get_driver, get_embeddings

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
CSV_DIR = Path(__file__).parent / "data/PK-PCT"

PCT_CSV        = CSV_DIR / "pct codes with hierarchy.csv"
TARIFFS_CSV    = CSV_DIR / "tariffs.csv"
CESS_CSV       = CSV_DIR / "cess_collection.csv"
EXEMPTIONS_CSV = CSV_DIR / "exemptions_concessions.csv"
ANTIDUMP_CSV   = CSV_DIR / "anti_dump_tariffs.csv"
PROCEDURES_CSV = CSV_DIR / "procedures.csv"
MEASURES_CSV   = CSV_DIR / "measures.csv"

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
EMBED_BATCH   = 50   # rows sent to OpenAI per API call
NEO4J_BATCH   = 500  # rows sent to Neo4j per UNWIND transaction

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def clean(val: Any) -> Any:
    """Convert NaN / '#NAME?' / 'N/A' to None; strip whitespace from strings."""
    if val is None:
        return None
    if isinstance(val, float):
        return None if math.isnan(val) else val
    s = str(val).strip()
    return None if s in ("", "nan", "NaN", "None", "#NAME?", "N/A") else s


def make_uid(*parts: Any) -> str:
    """Stable SHA-256 uid from arbitrary parts — guarantees MERGE idempotency."""
    combined = "|".join(str(p) for p in parts if p is not None)
    return hashlib.sha256(combined.encode()).hexdigest()


def normalize_hs(code: Any) -> str | None:
    """Zero-pad HS Code to 12 digits (tariffs.csv strips the leading zero)."""
    s = clean(code)
    if s is None:
        return None
    digits = "".join(c for c in s if c.isdigit())
    return digits.zfill(12) if digits else None


def load_csv(path: Path, **kwargs) -> pd.DataFrame:
    """Load CSV trying UTF-8 then Windows-1252 (common for Excel exports)."""
    for enc in ("utf-8", "cp1252", "latin-1"):
        try:
            df = pd.read_csv(path, dtype=str, encoding=enc, **kwargs)
            df.columns = [c.strip() for c in df.columns]
            df = df.loc[:, ~df.columns.str.fullmatch(r"Unnamed.*")]
            return df
        except UnicodeDecodeError:
            continue
    raise ValueError(f"Cannot decode {path.name} with utf-8 / cp1252 / latin-1")


def run_batched(session, cypher: str, rows: list[dict], desc: str) -> None:
    """Send rows to Neo4j in chunks of NEO4J_BATCH using UNWIND."""
    total = len(rows)
    for start in tqdm(range(0, total, NEO4J_BATCH), desc=f"  {desc}", unit="batch"):
        session.run(cypher, batch=rows[start : start + NEO4J_BATCH])


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
# Step 1 – Hierarchy + embeddings
# ---------------------------------------------------------------------------

def _build_embedding_text(row: pd.Series) -> str:
    parts = [
        f"Chapter: {clean(row.get('Chapter Description')) or ''}",
        f"Sub-chapter: {clean(row.get('Sub Chapter Description')) or ''}",
        f"Heading: {clean(row.get('Heading Description')) or ''}",
        f"Sub-heading: {clean(row.get('Sub Heading Description')) or ''}",
        f"HS Code: {clean(row.get('Description')) or ''}",
        f"Full Code: {clean(row.get('HS Code')) or ''}",
    ]
    return "\n".join(parts)


_HIERARCHY_CYPHER = """
UNWIND $batch AS row
MERGE (ch:Chapter:PK {code: row.chapter_code})
  ON CREATE SET ch.description = row.chapter_desc
  ON MATCH  SET ch.description = row.chapter_desc

MERGE (sc:SubChapter:PK {code: row.subchapter_code})
  ON CREATE SET sc.description = row.subchapter_desc
  ON MATCH  SET sc.description = row.subchapter_desc

MERGE (hd:Heading:PK {code: row.heading_code})
  ON CREATE SET hd.description = row.heading_desc
  ON MATCH  SET hd.description = row.heading_desc

MERGE (sh:SubHeading:PK {code: row.subheading_code})
  ON CREATE SET sh.description = row.subheading_desc
  ON MATCH  SET sh.description = row.subheading_desc

MERGE (hs:HSCode:PK {code: row.hs_code})
  ON CREATE SET hs.description = row.hs_desc,
                hs.full_label  = row.full_label,
                hs.embedding   = row.embedding
  ON MATCH  SET hs.description = row.hs_desc,
                hs.full_label  = row.full_label,
                hs.embedding   = row.embedding

MERGE (ch)-[:HAS_SUBCHAPTER]->(sc)
MERGE (sc)-[:HAS_HEADING]->(hd)
MERGE (hd)-[:HAS_SUBHEADING]->(sh)
MERGE (sh)-[:HAS_HSCODE]->(hs)
"""


def ingest_hierarchy(driver, embeddings_model) -> None:
    logger.info("═══ STEP 1: Ingesting PCT hierarchy + embeddings ═══")
    df = load_csv(PCT_CSV)
    logger.info("  Loaded %d rows from %s", len(df), PCT_CSV.name)

    # ── Checkpointer ────────────────────────────────────────────────────────
    existing_codes = load_checkpoint(driver, "HSCode:PK", "code")

    # Build a filtered list of (row, hs_code) for new entries only.
    # We must filter before building embedding texts so OpenAI is never called
    # for rows that are already in the DB.
    new_items: list[tuple[pd.Series, str]] = []
    skipped_ckpt = 0
    skipped_no_code = 0

    for _, row in df.iterrows():
        hs_code = normalize_hs(row.get("HS Code"))
        if not hs_code:
            skipped_no_code += 1
            continue
        if hs_code in existing_codes:
            skipped_ckpt += 1
            continue
        new_items.append((row, hs_code))

    logger.info(
        "  Checkpointer: %d already in DB (skipped), %d missing HS code, "
        "%d new rows to embed and write.",
        skipped_ckpt, skipped_no_code, len(new_items),
    )

    if not new_items:
        logger.info("  All hierarchy rows already ingested — skipping step.")
        return

    # ── Embeddings (only for new rows) ──────────────────────────────────────
    texts = [_build_embedding_text(row) for row, _ in new_items]
    logger.info("  Generating embeddings for %d new rows (batch=%d) …", len(texts), EMBED_BATCH)

    all_embeddings: list[list[float]] = []
    for start in tqdm(range(0, len(texts), EMBED_BATCH), desc="  Embedding batches"):
        all_embeddings.extend(
            embeddings_model.embed_documents(texts[start : start + EMBED_BATCH])
        )

    # ── Build DB rows ────────────────────────────────────────────────────────
    rows: list[dict] = []
    for (row, hs_code), emb in zip(new_items, all_embeddings):
        rows.append({
            "chapter_code":    clean(row.get("Chapter Code"))            or "UNKNOWN",
            "chapter_desc":    clean(row.get("Chapter Description"))     or "",
            "subchapter_code": clean(row.get("Sub Chapter Code"))        or "UNKNOWN",
            "subchapter_desc": clean(row.get("Sub Chapter Description")) or "",
            "heading_code":    clean(row.get("Heading Code"))            or "UNKNOWN",
            "heading_desc":    clean(row.get("Heading Description"))     or "",
            "subheading_code": clean(row.get("Sub Heading Code"))        or "UNKNOWN",
            "subheading_desc": clean(row.get("Sub Heading Description")) or "",
            "hs_code":         hs_code,
            "hs_desc":         clean(row.get("Description"))             or "",
            "full_label":      clean(row.get("Full Code"))               or "",
            "embedding":       emb,
        })

    logger.info("  Writing %d hierarchy rows to Neo4j (batch=%d) …", len(rows), NEO4J_BATCH)
    with driver.session() as session:
        run_batched(session, _HIERARCHY_CYPHER, rows, "Hierarchy batches")

    logger.info("  Hierarchy ingestion complete.")


# ---------------------------------------------------------------------------
# Step 2a – Tariffs  (expand multi-duty rows before batching)
# ---------------------------------------------------------------------------

DUTY_TYPES = {
    "CD":       "Customs Duty",
    "RD":       "Regulatory Duty",
    "ACD":      "Additional Customs Duty",
    "FED":      "Federal Excise Duty",
    "ST (VAT)": "Sales Tax / VAT",
    "IT":       "Income Tax",
    "DS":       "Development Surcharge",
    "EOC":      "Export Obligatory Contribution",
    "ERD":      "Export Regulatory Duty",
}

_TARIFF_CYPHER = """
UNWIND $batch AS row
MATCH (hs:HSCode:PK {code: row.hs_code})
MERGE (t:Tariff:PK {uid: row.uid})
  ON CREATE SET t.hs_code    = row.hs_code,
                t.duty_type  = row.duty_type,
                t.duty_name  = row.duty_name,
                t.rate       = row.rate,
                t.valid_from = row.valid_from,
                t.valid_to   = row.valid_to
  ON MATCH  SET t.rate       = row.rate,
                t.valid_from = row.valid_from,
                t.valid_to   = row.valid_to
MERGE (hs)-[:HAS_TARIFF]->(t)
"""


def ingest_tariffs(driver) -> None:
    logger.info("═══ STEP 2a: Ingesting Tariffs ═══")
    df = load_csv(TARIFFS_CSV)
    logger.info("  Loaded %d rows from %s", len(df), TARIFFS_CSV.name)

    existing_uids = load_checkpoint(driver, "Tariff:PK", "uid")

    rows: list[dict] = []
    skipped_ckpt = 0
    skipped_no_code = 0

    for _, row in df.iterrows():
        hs_code = normalize_hs(row.get("HS Code"))
        if not hs_code:
            skipped_no_code += 1
            continue
        for prefix, duty_name in DUTY_TYPES.items():
            rate = clean(row.get(f"{prefix}_Rate"))
            if rate is None:
                continue
            valid_from = clean(row.get(f"{prefix}_ValidFrom"))
            uid = make_uid(hs_code, prefix, rate, valid_from)
            if uid in existing_uids:
                skipped_ckpt += 1
                continue
            rows.append({
                "uid":        uid,
                "hs_code":    hs_code,
                "duty_type":  prefix,
                "duty_name":  duty_name,
                "rate":       rate,
                "valid_from": valid_from,
                "valid_to":   clean(row.get(f"{prefix}_ValidTo")),
            })

    logger.info(
        "  Checkpointer: %d already in DB (skipped), %d new Tariff records "
        "(skipped %d rows with no HS code).",
        skipped_ckpt, len(rows), skipped_no_code,
    )

    if not rows:
        logger.info("  All tariff records already ingested — skipping step.")
        return

    with driver.session() as session:
        run_batched(session, _TARIFF_CYPHER, rows, "Tariff batches")
    logger.info("  Tariffs ingestion complete.")


# ---------------------------------------------------------------------------
# Step 2b – Cess Collection
# ---------------------------------------------------------------------------

_CESS_CYPHER = """
UNWIND $batch AS row
MATCH (hs:HSCode:PK {code: row.hs_code})
MERGE (c:Cess:PK {uid: row.uid})
  ON CREATE SET c.hs_code          = row.hs_code,
                c.province         = row.province,
                c.cess_description = row.cess_description,
                c.import_rate      = row.import_rate,
                c.export_rate      = row.export_rate,
                c.forward_transit  = row.forward_transit,
                c.reverse_transit  = row.reverse_transit
  ON MATCH  SET c.import_rate      = row.import_rate,
                c.export_rate      = row.export_rate,
                c.forward_transit  = row.forward_transit,
                c.reverse_transit  = row.reverse_transit
MERGE (hs)-[:HAS_CESS]->(c)
"""


def ingest_cess(driver) -> None:
    logger.info("═══ STEP 2b: Ingesting Cess Collection ═══")
    df = load_csv(CESS_CSV)
    logger.info("  Loaded %d rows from %s", len(df), CESS_CSV.name)

    existing_uids = load_checkpoint(driver, "Cess:PK", "uid")

    rows: list[dict] = []
    skipped_ckpt = 0
    skipped_no_code = 0

    for _, row in df.iterrows():
        hs_code = normalize_hs(row.get("HS Code"))
        if not hs_code:
            skipped_no_code += 1
            continue
        province  = clean(row.get("Province"))
        cess_desc = clean(row.get("Cess Description"))
        uid = make_uid(hs_code, province, cess_desc)
        if uid in existing_uids:
            skipped_ckpt += 1
            continue
        rows.append({
            "uid":              uid,
            "hs_code":          hs_code,
            "province":         province,
            "cess_description": cess_desc,
            "import_rate":      clean(row.get("Import")),
            "export_rate":      clean(row.get("Export")),
            "forward_transit":  clean(row.get("Forward Transit")),
            "reverse_transit":  clean(row.get("Reverse Transit")),
        })

    logger.info(
        "  Checkpointer: %d already in DB (skipped), %d new Cess records "
        "(skipped %d rows with no HS code).",
        skipped_ckpt, len(rows), skipped_no_code,
    )

    if not rows:
        logger.info("  All cess records already ingested — skipping step.")
        return

    with driver.session() as session:
        run_batched(session, _CESS_CYPHER, rows, "Cess batches")
    logger.info("  Cess ingestion complete.")


# ---------------------------------------------------------------------------
# Step 2c – Exemptions / Concessions
# ---------------------------------------------------------------------------

_EXEMPTION_CYPHER = """
UNWIND $batch AS row
MATCH (hs:HSCode:PK {code: row.hs_code})
MERGE (e:Exemption:PK {uid: row.uid})
  ON CREATE SET e.hs_code        = row.hs_code,
                e.exemption_type = row.exemption_type,
                e.exemption_desc = row.exemption_desc,
                e.reference      = row.reference,
                e.activity       = row.activity,
                e.rate           = row.rate,
                e.unit           = row.unit,
                e.valid_from     = row.valid_from,
                e.valid_to       = row.valid_to
  ON MATCH  SET e.exemption_desc = row.exemption_desc,
                e.rate           = row.rate,
                e.valid_from     = row.valid_from,
                e.valid_to       = row.valid_to
MERGE (hs)-[:HAS_EXEMPTION]->(e)
"""


def ingest_exemptions(driver) -> None:
    logger.info("═══ STEP 2c: Ingesting Exemptions / Concessions ═══")
    df = load_csv(EXEMPTIONS_CSV)
    logger.info("  Loaded %d rows from %s", len(df), EXEMPTIONS_CSV.name)

    existing_uids = load_checkpoint(driver, "Exemption:PK", "uid")

    rows: list[dict] = []
    skipped_ckpt = 0
    skipped_no_code = 0

    for _, row in df.iterrows():
        hs_code = normalize_hs(row.get("HS Code"))
        if not hs_code:
            skipped_no_code += 1
            continue
        exemption_type = clean(row.get("Exemption/Concession"))
        activity       = clean(row.get("Activity"))
        rate           = clean(row.get("Rate"))
        uid = make_uid(hs_code, exemption_type, activity, rate)
        if uid in existing_uids:
            skipped_ckpt += 1
            continue
        rows.append({
            "uid":             uid,
            "hs_code":         hs_code,
            "exemption_type":  exemption_type,
            "exemption_desc":  clean(row.get("Exemption Description")),
            "reference":       clean(row.get("Reference")),
            "activity":        activity,
            "rate":            rate,
            "unit":            clean(row.get("Unit")),
            "valid_from":      clean(row.get("Valid From")),
            "valid_to":        clean(row.get("Valid To")),
        })

    logger.info(
        "  Checkpointer: %d already in DB (skipped), %d new Exemption records "
        "(skipped %d rows with no HS code).",
        skipped_ckpt, len(rows), skipped_no_code,
    )

    if not rows:
        logger.info("  All exemption records already ingested — skipping step.")
        return

    with driver.session() as session:
        run_batched(session, _EXEMPTION_CYPHER, rows, "Exemption batches")
    logger.info("  Exemptions ingestion complete.")


# ---------------------------------------------------------------------------
# Step 2d – Anti-Dumping Duties
# ---------------------------------------------------------------------------

_ANTIDUMP_CYPHER = """
UNWIND $batch AS row
MATCH (hs:HSCode:PK {code: row.hs_code})
MERGE (a:AntiDumpingDuty:PK {uid: row.uid})
  ON CREATE SET a.hs_code    = row.hs_code,
                a.exporter   = row.exporter,
                a.rate       = row.rate,
                a.valid_from = row.valid_from,
                a.valid_to   = row.valid_to
  ON MATCH  SET a.exporter   = row.exporter,
                a.rate       = row.rate,
                a.valid_from = row.valid_from,
                a.valid_to   = row.valid_to
MERGE (hs)-[:HAS_ANTI_DUMPING]->(a)
"""


def ingest_antidump(driver) -> None:
    logger.info("═══ STEP 2d: Ingesting Anti-Dumping Duties ═══")

    raw = load_csv(ANTIDUMP_CSV)
    cols = list(raw.columns)
    desc_idx = [i for i, c in enumerate(cols) if c == "Description"]
    if len(desc_idx) >= 2:
        cols[desc_idx[0]] = "item_description"
        cols[desc_idx[1]] = "exporter"
    raw.columns = cols

    logger.info("  Loaded %d rows from %s", len(raw), ANTIDUMP_CSV.name)

    existing_uids = load_checkpoint(driver, "AntiDumpingDuty:PK", "uid")

    rows: list[dict] = []
    skipped_ckpt = 0
    skipped_no_code = 0

    for _, row in raw.iterrows():
        hs_code = normalize_hs(row.get("HS Code"))
        if not hs_code:
            skipped_no_code += 1
            continue
        exporter = clean(row.get("exporter"))
        rate     = clean(row.get("Rate"))
        uid = make_uid(hs_code, exporter, rate)
        if uid in existing_uids:
            skipped_ckpt += 1
            continue
        rows.append({
            "uid":        uid,
            "hs_code":    hs_code,
            "exporter":   exporter,
            "rate":       rate,
            "valid_from": clean(row.get("Valid From")),
            "valid_to":   clean(row.get("Valid To")),
        })

    logger.info(
        "  Checkpointer: %d already in DB (skipped), %d new Anti-dumping records "
        "(skipped %d rows with no HS code).",
        skipped_ckpt, len(rows), skipped_no_code,
    )

    if not rows:
        logger.info("  All anti-dumping records already ingested — skipping step.")
        return

    with driver.session() as session:
        run_batched(session, _ANTIDUMP_CYPHER, rows, "Anti-dump batches")
    logger.info("  Anti-dumping ingestion complete.")


# ---------------------------------------------------------------------------
# Step 2e – Procedures
# ---------------------------------------------------------------------------

_PROCEDURE_CYPHER = """
UNWIND $batch AS row
MATCH (hs:HSCode:PK {code: row.hs_code})
MERGE (p:Procedure:PK {uid: row.uid})
  ON CREATE SET p.hs_code     = row.hs_code,
                p.name        = row.name,
                p.description = row.description,
                p.category    = row.category,
                p.url         = row.url
  ON MATCH  SET p.description = row.description,
                p.category    = row.category,
                p.url         = row.url
MERGE (hs)-[:REQUIRES_PROCEDURE]->(p)
"""


def ingest_procedures(driver) -> None:
    logger.info("═══ STEP 2e: Ingesting Procedures ═══")
    df = load_csv(PROCEDURES_CSV)
    logger.info("  Loaded %d rows from %s", len(df), PROCEDURES_CSV.name)

    existing_uids = load_checkpoint(driver, "Procedure:PK", "uid")

    rows: list[dict] = []
    skipped_ckpt = 0
    skipped_no_code = 0

    for _, row in df.iterrows():
        hs_code = normalize_hs(row.get("HS Code"))
        if not hs_code:
            skipped_no_code += 1
            continue
        name     = clean(row.get("Name"))
        category = clean(row.get("Category"))
        uid = make_uid(hs_code, name, category)
        if uid in existing_uids:
            skipped_ckpt += 1
            continue
        rows.append({
            "uid":         uid,
            "hs_code":     hs_code,
            "name":        name,
            "description": clean(row.get("Procedure Description")),
            "category":    category,
            "url":         clean(row.get("Procedure URL")),
        })

    logger.info(
        "  Checkpointer: %d already in DB (skipped), %d new Procedure records "
        "(skipped %d rows with no HS code).",
        skipped_ckpt, len(rows), skipped_no_code,
    )

    if not rows:
        logger.info("  All procedure records already ingested — skipping step.")
        return

    with driver.session() as session:
        run_batched(session, _PROCEDURE_CYPHER, rows, "Procedure batches")
    logger.info("  Procedures ingestion complete.")


# ---------------------------------------------------------------------------
# Step 2f – Measures
# ---------------------------------------------------------------------------

_MEASURE_CYPHER = """
UNWIND $batch AS row
MATCH (hs:HSCode:PK {code: row.hs_code})
MERGE (m:Measure:PK {uid: row.uid})
  ON CREATE SET m.hs_code     = row.hs_code,
                m.name        = row.name,
                m.type        = row.type,
                m.agency      = row.agency,
                m.description = row.description,
                m.comments    = row.comments,
                m.law         = row.law,
                m.validity    = row.validity,
                m.url         = row.url
  ON MATCH  SET m.description = row.description,
                m.comments    = row.comments,
                m.law         = row.law,
                m.validity    = row.validity,
                m.url         = row.url
MERGE (hs)-[:HAS_MEASURE]->(m)
"""


def ingest_measures(driver) -> None:
    logger.info("═══ STEP 2f: Ingesting Measures ═══")
    df = load_csv(MEASURES_CSV)
    logger.info("  Loaded %d rows from %s", len(df), MEASURES_CSV.name)

    existing_uids = load_checkpoint(driver, "Measure:PK", "uid")

    rows: list[dict] = []
    skipped_ckpt = 0
    skipped_no_code = 0

    for _, row in df.iterrows():
        hs_code = normalize_hs(row.get("HS Code"))
        if not hs_code:
            skipped_no_code += 1
            continue
        name   = clean(row.get("Name"))
        m_type = clean(row.get("Type"))
        uid = make_uid(hs_code, name, m_type)
        if uid in existing_uids:
            skipped_ckpt += 1
            continue
        rows.append({
            "uid":         uid,
            "hs_code":     hs_code,
            "name":        name,
            "type":        m_type,
            "agency":      clean(row.get("Agency")),
            "description": clean(row.get("Measure Description")),
            "comments":    clean(row.get("Comments")),
            "law":         clean(row.get("Law")),
            "validity":    clean(row.get("Validity")),
            "url":         clean(row.get("Measure URL")),
        })

    logger.info(
        "  Checkpointer: %d already in DB (skipped), %d new Measure records "
        "(skipped %d rows with no HS code).",
        skipped_ckpt, len(rows), skipped_no_code,
    )

    if not rows:
        logger.info("  All measure records already ingested — skipping step.")
        return

    with driver.session() as session:
        run_batched(session, _MEASURE_CYPHER, rows, "Measure batches")
    logger.info("  Measures ingestion complete.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    logger.info("╔══════════════════════════════════════════════════════╗")
    logger.info("║  TradeMate Knowledge Graph — Ingestion Pipeline (PK) ║")
    logger.info("╚══════════════════════════════════════════════════════╝")

    driver = get_driver()
    embeddings_model = get_embeddings()

    try:
        create_constraints(driver)
        ingest_hierarchy(driver, embeddings_model)
        ingest_tariffs(driver)
        ingest_cess(driver)
        ingest_exemptions(driver)
        ingest_antidump(driver)
        ingest_procedures(driver)
        ingest_measures(driver)
    finally:
        driver.close()
        logger.info("Neo4j driver closed.")

    logger.info("╔══════════════════════════════════════════════════════╗")
    logger.info("║  Ingestion complete!                                 ║")
    logger.info("╚══════════════════════════════════════════════════════╝")


if __name__ == "__main__":
    main()
