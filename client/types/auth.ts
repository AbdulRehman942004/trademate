// ── Request bodies ──────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  phone_number: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type TradeRole = "importer" | "exporter" | "both";

export interface OnboardingRequest {
  trade_role: TradeRole;
  user_type: string;
  company_name: string;
  target_region: string;
  language_preference: string;
}

// ── Response shapes ─────────────────────────────────────────────────────────

export interface RegisterResponse {
  id: number;
  message: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
}

export interface OnboardingResponse {
  message: string;
  is_onboarded: boolean;
}

// ── Auth state ──────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  status: string;
}

// ── Forgot password / OTP / Reset ───────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  reset_token: string;
  message: string;
}

export interface ResetPasswordRequest {
  reset_token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}
