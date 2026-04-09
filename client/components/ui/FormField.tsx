import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface FormFieldProps {
  label: string;
  error?: string;
  className?: string;
}

// ── Input field ─────────────────────────────────────────────────────────────

type InputProps = FormFieldProps & InputHTMLAttributes<HTMLInputElement>;

export const InputField = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          className={cn(
            "h-10 w-full rounded-lg border px-3 text-sm",
            "bg-white dark:bg-zinc-800/60",
            "text-zinc-900 dark:text-zinc-100",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
            "transition-colors",
            error
              ? "border-red-400 dark:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400/40"
              : "border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 dark:focus:border-violet-500"
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
InputField.displayName = "InputField";

// ── Select field ─────────────────────────────────────────────────────────────

interface SelectFieldOption {
  value: string;
  label: string;
}

type SelectProps = FormFieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    options: SelectFieldOption[];
    placeholder?: string;
  };

export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
        <select
          ref={ref}
          id={fieldId}
          className={cn(
            "h-10 w-full rounded-lg border px-3 text-sm",
            "bg-white dark:bg-zinc-800/60",
            "text-zinc-900 dark:text-zinc-100",
            "transition-colors cursor-pointer",
            error
              ? "border-red-400 dark:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-400/40"
              : "border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 dark:focus:border-violet-500"
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
SelectField.displayName = "SelectField";
