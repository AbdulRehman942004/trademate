"""
app/routes/ingest.py — Job status endpoint.

GET /ingest/{job_id} — Poll the status of an ingestion job.

Ingestion is now handled by Lambda (triggered automatically when a file is
uploaded to S3). This endpoint reads the status record that Lambda writes to
pipeline-status/{job_id}.json and returns it to the caller.
"""

import json

from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException, Request, status

from app.config import settings
from app.dependencies import get_s3
from app.limiter import limiter
from app.models import JobStatus, JobStatusResponse

router = APIRouter(prefix="/ingest", tags=["Ingestion"])

STATUS_PREFIX = "pipeline-status"


@router.get(
    "/{job_id}",
    response_model=JobStatusResponse,
    summary="Poll ingestion job status",
)
@limiter.limit("120/minute")
def get_job_status(request: Request, job_id: str):
    """
    Returns the current status of an ingestion job.
    Lambda writes a status file to S3 when it starts and when it finishes.
    If the file doesn't exist yet, the job is still queued.
    """
    s3_key = f"{STATUS_PREFIX}/{job_id}.json"
    try:
        obj = get_s3().get_object(Bucket=settings.aws_s3_bucket_name, Key=s3_key)
        data = json.loads(obj["Body"].read())
        return JobStatusResponse(**data)
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "NoSuchKey":
            return JobStatusResponse(
                job_id=job_id,
                s3_key="",
                status=JobStatus.PENDING,
                message="Job is queued — Lambda has not started processing yet.",
                chunks_upserted=0,
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not read job status from S3: {exc}",
        )
