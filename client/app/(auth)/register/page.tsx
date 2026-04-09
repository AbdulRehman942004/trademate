"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRegister } from "@/hooks/useAuth";
import { InputField } from "@/components/ui/FormField";
import { AlertMessage } from "@/components/ui/AlertMessage";
import { cn } from "@/lib/cn";

interface FormState {
  username: string;
  email: string;
  password: string;
  phone_number: string;
}

const INITIAL: FormState = {
  username: "",
  email: "",
  password: "",
  phone_number: "",
};

export default function RegisterPage() {
  const { register, isLoading, error } = useRegister();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [fieldErrors, setFieldErrors] = useState<Partial<FormState>>({});

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = (): boolean => {
    const errors: Partial<FormState> = {};
    if (!form.username.trim()) errors.username = "Username is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Enter a valid email.";
    if (!form.password) errors.password = "Password is required.";
    else if (form.password.length < 8) errors.password = "Must be at least 8 characters.";
    if (!form.phone_number.trim()) errors.phone_number = "Phone number is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await register(form);
  };

  return (
    <div className="w-full max-w-sm">
      {/* Card */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-8">
        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Start your TradeMate journey
          </p>
        </div>

        {error && <AlertMessage type="error" message={error} className="mb-4" />}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <InputField
            label="Username"
            type="text"
            placeholder="johndoe"
            autoComplete="username"
            value={form.username}
            onChange={set("username")}
            error={fieldErrors.username}
          />
          <InputField
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            error={fieldErrors.email}
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            error={fieldErrors.password}
          />
          <InputField
            label="Phone Number"
            type="tel"
            placeholder="+1 555 000 0000"
            autoComplete="tel"
            value={form.phone_number}
            onChange={set("phone_number")}
            error={fieldErrors.phone_number}
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
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
