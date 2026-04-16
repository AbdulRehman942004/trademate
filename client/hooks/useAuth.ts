"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { decodeJwt } from "@/lib/jwt";
import type {
  LoginRequest,
  OnboardingRequest,
  RegisterRequest,
} from "@/types/auth";

// ── useRegister ─────────────────────────────────────────────────────────────
export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const register = async (body: RegisterRequest) => {
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.register(body);
      router.push(`/verify-otp?email=${encodeURIComponent(body.email)}&mode=registration`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
}

// ── useLogin ────────────────────────────────────────────────────────────────
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const login = async (body: LoginRequest) => {
    setError(null);
    setIsLoading(true);
    try {
      const { access_token } = await AuthService.login(body);

      // Decode the JWT to extract id, status, and is_onboarded
      const payload = decodeJwt(access_token);

      setAuth(
        access_token,
        {
          id: payload.id,
          email: body.email,
          username: body.email.split("@")[0],
          status: payload.status,
        },
        payload.is_onboarded
      );

      router.push(payload.is_onboarded ? "/chat" : "/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}

// ── useOnboarding ───────────────────────────────────────────────────────────
export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setOnboarded } = useAuthStore();
  const router = useRouter();

  const submitOnboarding = async (body: OnboardingRequest) => {
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.onboarding(body);
      setOnboarded();
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { submitOnboarding, isLoading, error };
}

// ── useLogout ───────────────────────────────────────────────────────────────
export function useLogout() {
  const { logout } = useAuthStore();
  const { clearAll } = useChatStore();
  const router = useRouter();

  return () => {
    logout();
    clearAll();
    router.push("/login");
  };
}

// ── useVerifyRegistration ───────────────────────────────────────────────────
export function useVerifyRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const router = useRouter();

  const verifyRegistration = async (email: string, otp: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.verifyRegistration({ email, otp });
      router.push("/login?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyRegistration, isLoading, error };
}

// ── useForgotPassword ───────────────────────────────────────────────────────
export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const router = useRouter();

  const requestOtp = async (email: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.forgotPassword({ email });
      setSuccess(true);
      // Pass email via query param so verify-otp page can pre-fill it
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  return { requestOtp, isLoading, error, success };
}

// ── useVerifyOtp ────────────────────────────────────────────────────────────
export function useVerifyOtp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const router = useRouter();

  const verifyOtp = async (email: string, otp: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const { reset_token } = await AuthService.verifyOtp({ email, otp });
      router.push(`/reset-password?token=${encodeURIComponent(reset_token)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyOtp, isLoading, error };
}

// ── useResetPassword ────────────────────────────────────────────────────────
export function useResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const router = useRouter();

  const resetPassword = async (resetToken: string, newPassword: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.resetPassword({ reset_token: resetToken, new_password: newPassword });
      router.push("/login?reset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { resetPassword, isLoading, error };
}
