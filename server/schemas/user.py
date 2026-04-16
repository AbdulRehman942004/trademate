from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from models.user import TradeRole


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    phone_number: str


class RegisterResponse(BaseModel):
    id: int
    message: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class OnboardingRequest(BaseModel):
    trade_role: TradeRole
    user_type: str
    company_name: Optional[str] = None
    target_region: Optional[str] = None
    language_preference: Optional[str] = None


class OnboardingResponse(BaseModel):
    message: str
    is_onboarded: bool


# ── Forgot password / OTP / Reset ─────────────────────────────────────────────


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

    @field_validator("otp")
    @classmethod
    def otp_must_be_six_digits(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 6:
            raise ValueError("OTP must be exactly 6 digits")
        return v


class VerifyOtpResponse(BaseModel):
    reset_token: str
    message: str


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class ResetPasswordResponse(BaseModel):
    message: str
