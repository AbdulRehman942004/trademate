from fastapi import APIRouter, HTTPException, status

from core.database import get_collection
from models.commodity import CommodityResponse
from worker.tasks import crawl_all_hs_codes, scrape_tipp_data

router = APIRouter(prefix="/v1", tags=["commodity"])


@router.post("/scrape/all", status_code=status.HTTP_202_ACCEPTED)
async def trigger_full_crawl():
    """
    Kick off the full TIPP crawl.
    Paginates through every listing page, queues one scrape task per item.
    Returns a task_id you can use to check progress.
    """
    task = crawl_all_hs_codes.delay()
    return {
        "status": "Full crawl queued",
        "task_id": task.id,
        "note": "25 000+ items will be scraped. Monitor the Celery worker logs for progress.",
    }


@router.get("/task/{task_id}")
async def get_task_status(task_id: str):
    """Poll the status of any queued Celery task by its task_id."""
    from celery.result import AsyncResult
    from worker.celery_app import celery_app

    result = AsyncResult(task_id, app=celery_app)
    response = {"task_id": task_id, "status": result.status}
    if result.ready():
        response["result"] = result.result
    return response


@router.post("/scrape/{tipp_id}", status_code=status.HTTP_202_ACCEPTED)
async def trigger_scrape(tipp_id: int):
    """Queue a scrape job for a single item by its internal TIPP ID."""
    scrape_tipp_data.delay(tipp_id)
    return {"status": "Task queued", "tipp_id": tipp_id}


@router.get("/commodity/{hs_code}", response_model=CommodityResponse)
async def get_commodity(hs_code: str):
    """Fetch a scraped commodity from MongoDB by its HS code."""
    collection = get_collection("commodities")
    doc = await collection.find_one({"hs_code": hs_code})

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No commodity found for HS code '{hs_code}'",
        )

    doc["_id"] = str(doc["_id"])
    return CommodityResponse(**doc)
