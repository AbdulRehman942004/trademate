"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isOnboarded: boolean;

  // Actions
  setAuth: (token: string, user: AuthUser, isOnboarded: boolean) => void;
  setOnboarded: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isOnboarded: false,

      setAuth: (token, user, isOnboarded) => {
        // Keep localStorage in sync for the axios interceptor
        localStorage.setItem("tm_access_token", token);
        // Set a cookie flag so Next.js proxy can protect routes
        document.cookie = `tm_auth=1; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        set({ token, user, isOnboarded });
      },

      setOnboarded: () => set({ isOnboarded: true }),

      logout: () => {
        localStorage.removeItem("tm_access_token");
        document.cookie = "tm_auth=; path=/; max-age=0";
        set({ token: null, user: null, isOnboarded: false });
      },

      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: "trademate-auth",
      // Only persist these fields — never the derived helpers
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isOnboarded: state.isOnboarded,
      }),
      // Re-sync localStorage token after hydration
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem("tm_access_token", state.token);
        }
      },
    }
  )
);
