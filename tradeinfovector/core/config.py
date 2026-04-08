import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "tipp_db")
REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
