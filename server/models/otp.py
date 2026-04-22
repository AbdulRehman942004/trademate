from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Index, Integer, String
from sqlmodel import Field, SQLModel


class OtpCode(SQLModel, table=True):
    """
    Stores one-time password codes for the forgot-password flow.

    Lifecycle:
      1. Row is created when POST /v1/auth/forgot-password is called.
      2. Row is marked used=True when POST /v1/auth/verify-otp succeeds.
      3. Expired / used rows can be pruned by a background job (not required for MVP).

    Security properties:
      - 6-digit numeric code → 1-in-1,000,000 brute-force probability per attempt.
      - expires_at enforced at the application layer (10-minute window).
      - attempts counter: after 3 wrong guesses the row is invalidated.
      - Only one active (unused, unexpired) OTP per email at a time.
    """

    __tablename__ = "otp_codes"

    id: Optional[int] = Field(default=None, primary_key=True)

    email: str = Field(
        sa_column=Column(String(255), nullable=False, index=True)
    )
    code: str = Field(
        sa_column=Column(String(6), nullable=False)
    )
    expires_at: datetime = Field(
        sa_column=Column(DateTime, nullable=False)
    )
    attempts: int = Field(
        default=0,
        sa_column=Column(Integer, nullable=False, default=0),
    )
    used: bool = Field(
        default=False,
        sa_column=Column(Boolean, nullable=False, default=False),
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime, default=datetime.utcnow, nullable=False),
    )

    __table_args__ = (
        Index("ix_otp_codes_email_used_expires", "email", "used", "expires_at"),
    )
