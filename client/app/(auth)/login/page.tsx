"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import { InputField } from "@/components/ui/FormField";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { cn } from "@/lib/cn";

// ── Inner component uses useSearchParams — must be inside <Suspense> ─────────
function LoginForm() {
  const searchParams = useSearchParams();
  const justRegistered  = searchParams.get("registered") === "1";
  const justReset       = searchParams.get("reset") === "1";

  const { login, isLoading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Enter a valid email.";
    if (!password) errors.password = "Password is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await login({ email, password });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to your TradeMate account
          </p>
        </div>

        {justRegistered && (
          <AlertMessage type="success" message="Account created! Please sign in." className="mb-4" />
        )}
        {justReset && (
          <AlertMessage type="success" message="Password updated! Please sign in with your new password." className="mb-4" />
        )}
        {error && <AlertMessage type="error" message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <InputField
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />
          <div>
            <InputField
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
            />
            <div className="mt-1.5 text-right">
              <Link
                href="/forgot-password"
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "mt-2 w-full h-10 rounded-lg text-sm font-semibold transition-all",
              "bg-gradient-to-r from-violet-600 to-indigo-600",
              "text-white hover:from-violet-500 hover:to-indigo-500",
              "focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:ring-offset-2",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

// ── Page export wraps the form in Suspense for useSearchParams ────────────────
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
