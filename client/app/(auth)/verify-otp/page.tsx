"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { useVerifyOtp, useVerifyRegistration } from "@/hooks/useAuth";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { cn } from "@/lib/cn";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const email        = searchParams.get("email") ?? "";
  const mode         = searchParams.get("mode") ?? "reset"; // "registration" | "reset"

  const verifyOtpHook         = useVerifyOtp();
  const verifyRegistrationHook = useVerifyRegistration();

  const { isLoading, error } = mode === "registration" ? verifyRegistrationHook : verifyOtpHook;

  const verify = mode === "registration"
    ? verifyRegistrationHook.verifyRegistration
    : verifyOtpHook.verifyOtp;

  // One state slot per digit
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs            = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    // Accept only single digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next  = [...digits];
    next[index] = digit;
    setDigits(next);

    // Auto-advance on input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        // Clear current cell
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        // Move back to previous cell
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0)            inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next   = [...digits];
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setDigits(next);
    // Focus the cell after the last pasted digit
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) return;
    await verify(email, otp);
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    try {
      const { default: AuthService } = await import("@/services/auth.service");
      await AuthService.forgotPassword({ email });
      setCooldown(RESEND_COOLDOWN);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      // silently ignore — same anti-enumeration UX as backend
    }
  };

  const otpComplete = digits.every((d) => d !== "");

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Enter verification code
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300 break-all">
              {email || "your email"}
            </span>
          </p>
        </div>

        {error && <AlertMessage type="error" message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} noValidate>
          {/* OTP digit boxes */}
          <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={cn(
                  "w-11 h-14 rounded-lg border text-center text-xl font-bold",
                  "bg-white dark:bg-zinc-800/60",
                  "text-zinc-900 dark:text-zinc-100",
                  "transition-all duration-150",
                  digit
                    ? "border-violet-500 dark:border-violet-400 ring-2 ring-violet-400/30"
                    : "border-zinc-200 dark:border-zinc-700",
                  "focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400"
                )}
                autoComplete="one-time-code"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || !otpComplete}
            className={cn(
              "w-full h-10 rounded-lg text-sm font-semibold transition-all",
              "bg-gradient-to-r from-violet-600 to-indigo-600",
              "text-white hover:from-violet-500 hover:to-indigo-500",
              "focus:outline-none focus:ring-2 focus:ring-violet-400/60 focus:ring-offset-2",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2"
            )}
          >
            {isLoading && <Loader2 size={15} className="animate-spin" />}
            {isLoading ? "Verifying…" : "Verify code"}
          </button>
        </form>

        {/* Resend */}
        <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Didn't receive a code?{" "}
          {cooldown > 0 ? (
            <span className="text-zinc-400 dark:text-zinc-500">
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              Resend
            </button>
          )}
        </p>
      </div>

      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 font-medium text-violet-600 dark:text-violet-400 hover:underline"
        >
          <ArrowLeft size={13} />
          Change email
        </Link>
      </p>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  );
}
