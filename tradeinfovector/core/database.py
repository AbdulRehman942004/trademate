import motor.motor_asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection, AsyncIOMotorDatabase

from core.config import MONGO_DB_NAME, MONGODB_URL

_client: AsyncIOMotorClient = None
_db: AsyncIOMotorDatabase = None


async def connect() -> None:
    global _client, _db
    _client = AsyncIOMotorClient(MONGODB_URL)
    _db = _client[MONGO_DB_NAME]
    # Verify the connection is reachable on startup
    await _client.admin.command("ping")


async def disconnect() -> None:
    global _client
    if _client:
        _client.close()
        _client = None


def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("Database not connected. Ensure lifespan startup ran.")
    return _db


def get_collection(name: str) -> AsyncIOMotorCollection:
    return get_db()[name]
