"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthService from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";
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
      // After registration the user needs to log in to get a token,
      // then complete onboarding. Redirect to login.
      router.push("/login?registered=1");
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
  const router = useRouter();

  return () => {
    logout();
    router.push("/login");
  };
}
