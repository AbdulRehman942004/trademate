import axiosInstance from "@/lib/axiosInstance";
import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  OnboardingRequest,
  OnboardingResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@/types/auth";

// ── Auth API service ────────────────────────────────────────────────────────
// All methods use the singleton axiosInstance. Never import axios directly
// outside of lib/axiosInstance.ts.

const AuthService = {
  register: async (body: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await axiosInstance.post<RegisterResponse>("/v1/register", body);
    return data;
  },

  login: async (body: LoginRequest): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>("/v1/login", body);
    return data;
  },

  onboarding: async (body: OnboardingRequest): Promise<OnboardingResponse> => {
    const { data } = await axiosInstance.post<OnboardingResponse>("/v1/onboarding", body);
    return data;
  },

  verifyRegistration: async (body: VerifyOtpRequest): Promise<RegisterResponse> => {
    const { data } = await axiosInstance.post<RegisterResponse>("/v1/auth/verify-registration", body);
    return data;
  },

  forgotPassword: async (body: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const { data } = await axiosInstance.post<ForgotPasswordResponse>("/v1/auth/forgot-password", body);
    return data;
  },

  verifyOtp: async (body: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    const { data } = await axiosInstance.post<VerifyOtpResponse>("/v1/auth/verify-otp", body);
    return data;
  },

  resetPassword: async (body: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const { data } = await axiosInstance.post<ResetPasswordResponse>("/v1/auth/reset-password", body);
    return data;
  },
};

export default AuthService;
