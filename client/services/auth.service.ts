import axiosInstance from "@/lib/axiosInstance";
import type {
  LoginRequest,
  LoginResponse,
  OnboardingRequest,
  OnboardingResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/types/auth";

// ── Auth API service ────────────────────────────────────────────────────────
// All methods use the singleton axiosInstance. Never import axios directly
// outside of lib/axiosInstance.ts.

const AuthService = {
  register: async (body: RegisterRequest): Promise<RegisterResponse> => {
    const { data } = await axiosInstance.post<RegisterResponse>(
      "/v1/register",
      body
    );
    return data;
  },

  login: async (body: LoginRequest): Promise<LoginResponse> => {
    const { data } = await axiosInstance.post<LoginResponse>("/v1/login", body);
    return data;
  },

  onboarding: async (body: OnboardingRequest): Promise<OnboardingResponse> => {
    // Token is automatically attached by the request interceptor
    const { data } = await axiosInstance.post<OnboardingResponse>(
      "/v1/onboarding",
      body
    );
    return data;
  },
};

export default AuthService;
