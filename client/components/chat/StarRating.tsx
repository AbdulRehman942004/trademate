"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

interface StarRatingProps {
  value: number | null | undefined;
  onSubmit: (rating: number) => Promise<void> | void;
  disabled?: boolean;
}

const LABELS = ["Worst", "Poor", "Okay", "Good", "Best"];

export function StarRating({ value, onSubmit, disabled }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = value ?? 0;
  const display = hover ?? current;

  const handleClick = async (rating: number) => {
    if (disabled || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(rating);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save rating");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHover(null)}
        role="radiogroup"
        aria-label="Rate this response from 1 to 5 stars"
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= display;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={n === current}
              aria-label={`${n} star${n > 1 ? "s" : ""} — ${LABELS[n - 1]}`}
              disabled={disabled || busy}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(null)}
              onClick={() => handleClick(n)}
              className={cn(
                "p-0.5 rounded transition-colors",
                "hover:bg-zinc-200 dark:hover:bg-zinc-800",
                "disabled:cursor-not-allowed disabled:opacity-60",
                "focus:outline-none focus:ring-1 focus:ring-amber-400"
              )}
            >
              <Star
                size={14}
                className={cn(
                  "transition-colors",
                  active
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-400 dark:text-zinc-500"
                )}
              />
            </button>
          );
        })}
      </div>
      {display > 0 && (
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {LABELS[display - 1]}
        </span>
      )}
      {error && (
        <span className="text-[11px] text-red-500" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
