"""
app/models.py — Shared Pydantic models and enums.

Keeping schemas in one place prevents circular imports between
routes and services.
"""

from enum import Enum

from pydantic import BaseModel


class JobStatus(str, Enum):
    PENDING   = "pending"
    RUNNING   = "running"
    COMPLETED = "completed"
    FAILED    = "failed"


class JobRecord(BaseModel):
    job_id: str
    s3_key: str
    status: JobStatus = JobStatus.PENDING
    message: str = ""
    chunks_upserted: int = 0


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class UploadResponse(BaseModel):
    s3_key: str
    job_id: str
    filename: str
    size_bytes: int


class JobStatusResponse(BaseModel):
    job_id: str
    s3_key: str
    status: JobStatus
    message: str
    chunks_upserted: int
    updated_at: str | None = None


class HealthResponse(BaseModel):
    status: str
    services: dict[str, str]
