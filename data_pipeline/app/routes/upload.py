"""
app/routes/upload.py — File upload endpoint.

POST /upload  — Accepts a multipart file, saves it to S3 under
                uploads/{job_id}/{filename}, and returns the S3 key plus
                the job_id. The S3 upload automatically triggers the Lambda
                ingestion function — no separate /ingest call needed.
"""

import uuid
from pathlib import Path

from botocore.exceptions import ClientError
from fastapi import APIRouter, HTTPException, Request, UploadFile, status

from app.config import settings
from app.dependencies import get_s3
from app.limiter import limiter
from app.logger import get_logger
from app.models import UploadResponse
from app.services.document_parser import SUPPORTED_EXTENSIONS

router = APIRouter(tags=["Upload"])

logger = get_logger("trademate.upload")

UPLOAD_PREFIX = "uploads"


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a document to S3",
)
@limiter.limit("10/hour")
async def upload_file(request: Request, file: UploadFile):
    """
    Uploads a document to S3 under uploads/{job_id}/{filename}.
    The upload triggers the Lambda ingestion function automatically.
    Use the returned job_id to poll GET /ingest/{job_id} for status.
    """
    ext = Path(file.filename or "").suffix.lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type '{ext}'. Supported: {sorted(SUPPORTED_EXTENSIONS)}",
        )

    job_id = str(uuid.uuid4())
    s3_key = f"{UPLOAD_PREFIX}/{job_id}/{file.filename}"
    contents = await file.read()

    try:
        get_s3().put_object(
            Bucket=settings.aws_s3_bucket_name,
            Key=s3_key,
            Body=contents,
            ContentType=file.content_type or "application/octet-stream",
        )
    except ClientError as exc:
        logger.exception("S3 upload failed for key '%s': %s", s3_key, exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to upload file to S3: {exc}",
        ) from exc

    logger.info(
        "Uploaded '%s' → s3://%s/%s (%d bytes) — job_id=%s",
        file.filename, settings.aws_s3_bucket_name, s3_key, len(contents), job_id,
    )

    return UploadResponse(s3_key=s3_key, job_id=job_id, filename=file.filename or "", size_bytes=len(contents))
