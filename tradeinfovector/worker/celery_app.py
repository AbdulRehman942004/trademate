from celery import Celery
from core.config import REDIS_URL

celery_app = Celery(
    "tradeinfovector",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["worker.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,  # task state transitions: PENDING → STARTED → SUCCESS/FAILURE
    # solo pool avoids Windows multiprocessing semaphore permission errors (WinError 5)
    worker_pool="solo",
)
