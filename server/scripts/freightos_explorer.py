#!/usr/bin/env python3
"""
scripts/freightos_explorer.py

Hits every route × cargo-type × weight combination available via the
Freightos shipping calculator API, saves the full raw JSON response to
the `freightos_rates` PostgreSQL table, and also writes a local JSON
file (scripts/freightos_data.json) as a backup.

Usage (run from server/ directory):
    python scripts/freightos_explorer.py
    # FREIGHTOS_API_KEY is read from server/.env automatically
"""

import json
import logging
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv

# ── Bootstrap path so server modules are importable ────────────────────────────
SERVER_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(SERVER_DIR))
load_dotenv(SERVER_DIR / ".env")

from database.database import create_db_tables, engine  # noqa: E402
from models.freightos_rate import FreightosRateRecord    # noqa: E402
from sqlmodel import Session                             # noqa: E402

# ── Logging ────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Config ─────────────────────────────────────────────────────────────────────

API_KEY  = os.environ.get("FREIGHTOS_API_KEY", "")
BASE_URL = "https://ship.freightos.com/api/shippingCalculator"
TIMEOUT  = 15
DELAY    = 0.5  # seconds between requests

# ── Route matrix ───────────────────────────────────────────────────────────────

SEA_ORIGINS = {
    "Karachi (PKKHI)": "PKKHI",
}

SEA_DESTINATIONS = {
    "Los Angeles (USLAX)": "USLAX",
    "Long Beach (USLGB)":  "USLGB",
    "New York (USNYC)":    "USNYC",
    "Savannah (USSAV)":    "USSAV",
    "Miami (USMIA)":       "USMIA",
    "Seattle (USSEA)":     "USSEA",
}

AIR_ORIGINS = {
    "Karachi Intl (KHI)": "PKKHI",
}

AIR_DESTINATIONS = {
    "New York JFK (JFK)":   "USNYC",
    "Chicago O'Hare (ORD)": "USCHI",
    "Los Angeles (LAX)":    "USLAX",
    "Miami (MIA)":          "USMIA",
}

CARGO_CONFIGS = [
    {
        "cargo_type": "FCL_20",
        "loadtype":   "container20",
        "mode":       "sea",
        "weights_kg": [5_000, 10_000, 15_000, 20_000],
    },
    {
        "cargo_type": "FCL_40",
        "loadtype":   "container40",
        "mode":       "sea",
        "weights_kg": [10_000, 20_000, 25_000, 28_000],
    },
    {
        "cargo_type": "FCL_40HC",
        "loadtype":   "container40HC",
        "mode":       "sea",
        "weights_kg": [10_000, 20_000, 25_000, 28_000],
    },
    {
        "cargo_type": "LCL",
        "loadtype":   "boxes",
        "mode":       "sea",
        "weights_kg": [200, 500, 1_000, 2_000, 5_000],
    },
    {
        "cargo_type": "AIR",
        "loadtype":   "air",
        "mode":       "air",
        "weights_kg": [50, 100, 250, 500, 1_000],
    },
]

# ── API helpers ────────────────────────────────────────────────────────────────

def _fetch(origin_code: str, dest_code: str, loadtype: str, weight: int) -> dict:
    params = {
        "key":         API_KEY,
        "origin":      origin_code,
        "destination": dest_code,
        "loadtype":    loadtype,
        "weight":      weight,
        "format":      "json",
    }
    try:
        resp = requests.get(BASE_URL, params=params, timeout=TIMEOUT)
        return {
            "http_status": resp.status_code,
            "ok":          resp.ok,
            "body":        resp.json() if resp.ok else resp.text[:2000],
        }
    except requests.RequestException as exc:
        return {"http_status": None, "ok": False, "body": str(exc)}


def _parse_prices(body: dict) -> tuple[float | None, float | None, int]:
    """Return (min_usd, max_usd, num_quotes) from a successful response body."""
    try:
        root = body["response"]["estimatedFreightRates"]
        num_quotes = int(root.get("numQuotes", 0))
        if num_quotes == 0:
            return None, None, 0

        mode_data = root.get("mode")
        modes = mode_data if isinstance(mode_data, list) else [mode_data]

        mins, maxs = [], []
        for m in modes:
            if not m:
                continue
            price = m.get("price", {})
            mn = price.get("min", {}).get("moneyAmount", {}).get("amount")
            mx = price.get("max", {}).get("moneyAmount", {}).get("amount")
            if mn is not None:
                mins.append(float(mn))
            if mx is not None:
                maxs.append(float(mx))

        if mins and maxs:
            return min(mins), max(maxs), num_quotes
    except (KeyError, TypeError, ValueError):
        pass
    return None, None, 0

# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    if not API_KEY:
        logger.error("FREIGHTOS_API_KEY is not set. Add it to server/.env or export it.")
        sys.exit(1)

    logger.info("Creating DB tables if they don't exist …")
    create_db_tables()

    logger.info("Starting Freightos data collection …")

    all_records: list[dict] = []
    total = success = 0
    fetched_at = datetime.now(timezone.utc)

    with Session(engine) as session:
        for cfg in CARGO_CONFIGS:
            origins      = AIR_ORIGINS      if cfg["mode"] == "air" else SEA_ORIGINS
            destinations = AIR_DESTINATIONS if cfg["mode"] == "air" else SEA_DESTINATIONS

            for origin_name, origin_code in origins.items():
                for dest_name, dest_code in destinations.items():
                    for weight in cfg["weights_kg"]:
                        total += 1
                        logger.info(
                            "[%s] %s → %s  weight=%d kg",
                            cfg["cargo_type"], origin_code, dest_code, weight,
                        )

                        result = _fetch(origin_code, dest_code, cfg["loadtype"], weight)

                        min_usd = max_usd = None
                        num_quotes = 0
                        if result["ok"] and isinstance(result["body"], dict):
                            min_usd, max_usd, num_quotes = _parse_prices(result["body"])
                            if min_usd is not None:
                                success += 1

                        raw_json = (
                            json.dumps(result["body"], ensure_ascii=False)
                            if isinstance(result["body"], dict)
                            else str(result["body"])
                        )

                        record = FreightosRateRecord(
                            origin_name=origin_name,
                            origin_code=origin_code,
                            dest_name=dest_name,
                            dest_code=dest_code,
                            cargo_type=cfg["cargo_type"],
                            loadtype=cfg["loadtype"],
                            weight_kg=float(weight),
                            http_status=result["http_status"],
                            num_quotes=num_quotes,
                            min_usd=min_usd,
                            max_usd=max_usd,
                            raw_response=raw_json,
                            fetched_at=fetched_at,
                        )
                        session.add(record)
                        session.commit()
                        session.refresh(record)

                        all_records.append({
                            "id":           record.id,
                            "cargo_type":   cfg["cargo_type"],
                            "origin_code":  origin_code,
                            "dest_code":    dest_code,
                            "weight_kg":    weight,
                            "http_status":  result["http_status"],
                            "num_quotes":   num_quotes,
                            "min_usd":      min_usd,
                            "max_usd":      max_usd,
                            "raw_response": result["body"],
                        })

                        time.sleep(DELAY)

    # ── Save JSON backup ───────────────────────────────────────────────────────

    out_path = Path(__file__).parent / "freightos_data.json"
    out_path.write_text(
        json.dumps(
            {
                "fetched_at":        fetched_at.isoformat(),
                "total_requests":    total,
                "successful_quotes": success,
                "failed_requests":   total - success,
                "results":           all_records,
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    logger.info("JSON backup saved → %s", out_path)

    # ── Summary table ──────────────────────────────────────────────────────────

    quoted = [r for r in all_records if r["min_usd"] is not None]
    failed = [r for r in all_records if r["min_usd"] is None]

    print(f"\n{'─' * 86}")
    print(f"  Freightos Rates  |  {success}/{total} quotes  |  DB ids saved")
    print(f"{'─' * 86}")
    print(f"  {'Route':<30} {'Type':<10} {'Weight':>8}  {'Min USD':>9}  {'Max USD':>9}  {'DB id':>6}")
    print(f"  {'─' * 80}")
    for r in sorted(quoted, key=lambda x: (x["cargo_type"], x["dest_code"], x["weight_kg"])):
        route = f"{r['origin_code']} → {r['dest_code']}"
        print(
            f"  {route:<30} {r['cargo_type']:<10} {r['weight_kg']:>8.0f}  "
            f"{r['min_usd']:>9,.0f}  {r['max_usd']:>9,.0f}  {r['id']:>6}"
        )

    if failed:
        print(f"\n  Failed ({len(failed)}):")
        for r in failed:
            route = f"{r['origin_code']} → {r['dest_code']}"
            print(f"  {route:<30} {r['cargo_type']:<10} {r['weight_kg']:>8.0f}  HTTP {r['http_status']}")

    print(f"{'─' * 86}\n")
    logger.info("Done. %d records saved to freightos_rates table.", total)


if __name__ == "__main__":
    main()
