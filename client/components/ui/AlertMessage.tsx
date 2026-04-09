import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface AlertMessageProps {
  type: "error" | "success";
  message: string;
  className?: string;
}

export function AlertMessage({ type, message, className }: AlertMessageProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm",
        type === "error"
          ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50"
          : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50",
        className
      )}
    >
      {type === "error" ? (
        <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </div>
  );
}
