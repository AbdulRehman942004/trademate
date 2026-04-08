import asyncio
import random

from motor.motor_asyncio import AsyncIOMotorClient

from core.config import MONGO_DB_NAME, MONGODB_URL
from models.commodity import CommodityModel
from services.crawler import (
    crawl_all_tipp_ids,
    extract_commodity_data,
    fetch_detail_page,
    make_client,
)
from worker.celery_app import celery_app

# Polite delay between listing-page fetches during the full crawl
_CRAWL_DELAY_SECONDS = 0.5


# ---------------------------------------------------------------------------
# MongoDB helper
# ---------------------------------------------------------------------------

async def _upsert_commodity(doc: dict) -> None:
    client = AsyncIOMotorClient(MONGODB_URL)
    try:
        collection = client[MONGO_DB_NAME]["commodities"]
        await collection.update_one(
            {"hs_code": doc["hs_code"]},
            {"$set": doc},
            upsert=True,
        )
    finally:
        client.close()


# ---------------------------------------------------------------------------
# Task 1 — scrape a single item by internal TIPP ID
# ---------------------------------------------------------------------------

@celery_app.task(name="worker.tasks.scrape_tipp_data", bind=True)
def scrape_tipp_data(self, tipp_id: int) -> dict:
    """
    Fetch the TIPP detail page for one item, extract hs_code + commodity_name,
    and upsert the result into MongoDB.
    """
    print(f"[scrape_tipp_data] Fetching tipp_id={tipp_id}")

    with make_client() as client:
        soup = fetch_detail_page(client, tipp_id)

    data = extract_commodity_data(soup)

    # Fall back to tipp_id string if the HS code couldn't be parsed from the page
    hs_code = data["hs_code"] or str(tipp_id)
    commodity_name = data["commodity_name"] or "Unknown"

    print(f"[scrape_tipp_data] hs_code='{hs_code}'  commodity='{commodity_name}'")

    doc = CommodityModel(
        hs_code=hs_code,
        commodity_name=commodity_name,
        description_vector=[random.random() for _ in range(5)],
    ).to_mongo()

    asyncio.run(_upsert_commodity(doc))
    print(f"[scrape_tipp_data] Upserted tipp_id={tipp_id} → hs_code='{hs_code}'")

    return {"tipp_id": tipp_id, "hs_code": hs_code, "commodity_name": commodity_name, "status": "scraped"}


# ---------------------------------------------------------------------------
# Task 2 — crawl all listing pages and queue a scrape task per item
# ---------------------------------------------------------------------------

@celery_app.task(name="worker.tasks.crawl_all_hs_codes", bind=True)
def crawl_all_hs_codes(self) -> dict:
    """
    Use Playwright to paginate through every TIPP listing page (JS-rendered),
    collect all internal TIPP IDs, then queue a scrape_tipp_data task per ID.
    """
    print("[crawl_all_hs_codes] Launching Playwright browser for full TIPP crawl …")

    all_ids = crawl_all_tipp_ids()

    print(f"[crawl_all_hs_codes] Crawl done — {len(all_ids)} IDs found. Queuing scrape tasks …")

    for tipp_id in all_ids:
        scrape_tipp_data.delay(tipp_id)

    print(f"[crawl_all_hs_codes] {len(all_ids)} scrape tasks queued.")
    return {
        "status": "crawl complete",
        "tasks_queued": len(all_ids),
    }
