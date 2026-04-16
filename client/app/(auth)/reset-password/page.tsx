"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { useResetPassword } from "@/hooks/useAuth";
import { InputField } from "@/components/ui/FormField";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { cn } from "@/lib/cn";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const resetToken   = searchParams.get("token") ?? "";

  const { resetPassword, isLoading, error } = useResetPassword();

  const [newPassword,    setNewPassword]    = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors]        = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!newPassword)           errors.newPassword = "Password is required.";
    else if (newPassword.length < 8) errors.newPassword = "Must be at least 8 characters.";
    if (!confirmPassword)            errors.confirmPassword = "Please confirm your password.";
    else if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !resetToken) return;
    await resetPassword(resetToken, newPassword);
  };

  if (!resetToken) {
    return (
      <div className="w-full max-w-sm text-center">
        <AlertMessage
          type="error"
          message="Invalid or missing reset token. Please restart the forgot password flow."
        />
        <Link
          href="/forgot-password"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
        >
          <ArrowLeft size={13} />
          Request a new code
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Set new password
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Choose a strong password for your account.
          </p>
        </div>

        {error && <AlertMessage type="error" message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <InputField
            label="New password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={fieldErrors.newPassword}
          />
          <InputField
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
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
            {isLoading ? "Updating password…" : "Update password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
