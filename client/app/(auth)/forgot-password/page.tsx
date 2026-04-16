"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { useForgotPassword } from "@/hooks/useAuth";
import { InputField } from "@/components/ui/FormField";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { cn } from "@/lib/cn";

export default function ForgotPasswordPage() {
  const { requestOtp, isLoading, error } = useForgotPassword();
  const [email, setEmail]               = useState("");
  const [emailError, setEmailError]     = useState("");

  const validate = () => {
    if (!email.trim()) {
      setEmailError("Email is required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await requestOtp(email.trim().toLowerCase());
  };

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Forgot your password?
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Enter your email and we'll send you a reset code.
          </p>
        </div>

        {error && <AlertMessage type="error" message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <InputField
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
          />

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
            {isLoading ? "Sending code…" : "Send reset code"}
          </button>
        </form>
      </div>

      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-violet-600 dark:text-violet-400 hover:underline"
        >
          <ArrowLeft size={13} />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
