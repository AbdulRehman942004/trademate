"""
app/limiter.py — Shared SlowAPI limiter for the data-pipeline service.

Defined here (not in main.py) so route modules can import it without
creating a circular import.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings

_redis_base = settings.redis_url.rsplit("/", 1)[0]

limiter = Limiter(key_func=get_remote_address, storage_uri=f"{_redis_base}/2")
