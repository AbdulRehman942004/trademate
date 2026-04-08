from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.routes.commodity import router as commodity_router
from core.database import connect, disconnect


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect()
    yield
    await disconnect()


app = FastAPI(title="TradeInfoVector", lifespan=lifespan)

app.include_router(commodity_router)


@app.get("/")
async def read_root():
    return {"message": "Welcome to TradeInfoVector API!"}
