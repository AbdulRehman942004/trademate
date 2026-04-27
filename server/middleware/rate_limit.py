"""
middleware/rate_limit.py — Shared SlowAPI limiter and key functions.

Imported by main.py (to wire into the app) and by route files (for decorators).

Key strategy — industry standard:
  - Authenticated routes  → keyed by user ID  (each user gets their own bucket;
                             shared IPs like offices don't penalise each other)
  - Unauthenticated routes → keyed by IP       (no identity available yet)
"""

import os

import jwt
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

_SECRET_KEY = os.getenv("SECRET_KEY")
_ALGORITHM = "HS256"

# Redis DB 2 — isolated from Celery broker (DB 0), result backend (DB 1),
# and the job store (DB 3 in data-pipeline).
_REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0").rsplit("/", 1)[0] + "/2"


def get_user_id_or_ip(request: Request) -> str:
    """
    Returns 'user:{id}' for valid Bearer tokens, falls back to IP otherwise.
    Used as the key function for all authenticated endpoints.
    """
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        try:
            token = auth.split(" ", 1)[1]
            payload = jwt.decode(token, _SECRET_KEY, algorithms=[_ALGORITHM])
            return f"user:{payload['id']}"
        except Exception:
            pass
    return get_remote_address(request)


# Single limiter instance shared across the entire server.
# Default key is IP — authenticated routes override with get_user_id_or_ip.
limiter = Limiter(key_func=get_remote_address, storage_uri=_REDIS_URL)
