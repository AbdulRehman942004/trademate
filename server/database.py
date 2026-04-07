from sqlmodel import create_engine

DATABASE_URL = "sqlite:///trademate.db"

engine = create_engine(DATABASE_URL, echo=True)
