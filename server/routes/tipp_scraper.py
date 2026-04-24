"""
server/routes/tipp_scraper.py — TIPP Scraper Admin API

Proxies requests to the TIPP scraper backend (Port 8003).
"""

import os

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Any, Optional, Dict, List

from routes.admin import _get_current_admin_user_id

router = APIRouter(prefix="/v1/admin/tipp-scraper", tags=["Admin - TIPP Scraper"])

TIPP_SCRAPER_BASE_URL = os.getenv("TIPP_SCRAPER_URL", "http://localhost:8003")

# ── Response Models ───────────────────────────────────────────────────────────

class ScrapeStats(BaseModel):
    master_codes: int
    tariffs: int
    cess: int
    exemptions: int
    antidump: int
    measures: int
    procedures: int
    products: int
    failed: int

class TaskInfo(BaseModel):
    status: str
    last_run: Optional[str] = None
    pid: Optional[int] = None
    error: Optional[str] = None

class TasksStatusResponse(BaseModel):
    full_scrape: TaskInfo
    products_scrape: TaskInfo
    details_scrape: TaskInfo
    combine_data: TaskInfo

class LogsResponse(BaseModel):
    logs: List[str]

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=ScrapeStats)
async def get_tipp_stats(
    admin_id: int = Depends(_get_current_admin_user_id),
):
    """Get statistics from the TIPP scraper CSV files."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{TIPP_SCRAPER_BASE_URL}/stats", timeout=5.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"TIPP scraper service unreachable: {exc}",
            )

@router.get("/tasks", response_model=TasksStatusResponse)
async def get_tipp_tasks(
    admin_id: int = Depends(_get_current_admin_user_id),
):
    """Get status of all scraping tasks."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{TIPP_SCRAPER_BASE_URL}/tasks", timeout=5.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"TIPP scraper service unreachable: {exc}",
            )

@router.post("/tasks/{task_type}")
async def trigger_tipp_task(
    task_type: str,
    admin_id: int = Depends(_get_current_admin_user_id),
):
    """Trigger a specific scraping task."""
    endpoint_map = {
        "full": "full-scrape",
        "products": "products-scrape",
        "details": "details-scrape",
        "combine": "combine"
    }
    
    if task_type not in endpoint_map:
        raise HTTPException(status_code=400, detail="Invalid task type")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{TIPP_SCRAPER_BASE_URL}/tasks/{endpoint_map[task_type]}", timeout=5.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to trigger task: {exc}",
            )

@router.get("/logs", response_model=LogsResponse)
async def get_tipp_logs(
    lines: int = 100,
    admin_id: int = Depends(_get_current_admin_user_id),
):
    """Get latest scraper logs."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{TIPP_SCRAPER_BASE_URL}/logs?lines={lines}", timeout=5.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to fetch logs: {exc}",
            )
