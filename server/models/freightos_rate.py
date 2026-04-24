from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, Float, Index, Integer, Text
from sqlmodel import Field, SQLModel


class FreightosRateRecord(SQLModel, table=True):
    __tablename__ = "freightos_rates"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Route
    origin_name: str = Field(max_length=100)
    origin_code: str = Field(max_length=10)   # UNLOCODE
    dest_name: str = Field(max_length=100)
    dest_code: str = Field(max_length=10)     # UNLOCODE

    # Cargo
    cargo_type: str = Field(max_length=20)    # FCL_20 | FCL_40 | FCL_40HC | LCL | AIR
    loadtype: str = Field(max_length=30)      # Freightos loadtype param value
    weight_kg: float = Field(sa_column=Column(Float, nullable=False))

    # API response metadata
    http_status: Optional[int] = Field(default=None, sa_column=Column(Integer, nullable=True))
    num_quotes: int = Field(default=0)

    # Parsed prices (null if API returned 0 quotes or errored)
    min_usd: Optional[float] = Field(default=None, sa_column=Column(Float, nullable=True))
    max_usd: Optional[float] = Field(default=None, sa_column=Column(Float, nullable=True))
    currency: str = Field(default="USD", max_length=10)

    # Full raw response — nothing from Freightos is discarded
    raw_response: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))

    fetched_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, default=datetime.utcnow, nullable=False),
    )

    __table_args__ = (
        Index("ix_freightos_route_type", "origin_code", "dest_code", "cargo_type"),
        Index("ix_freightos_fetched_at", "fetched_at"),
    )
