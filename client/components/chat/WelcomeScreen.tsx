import { TrendingUp, BarChart2, Globe, BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";

interface Prompt {
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

const SUGGESTED_PROMPTS: Prompt[] = [
  {
    icon: <TrendingUp size={16} />,
    label: "Market Analysis",
    prompt: "Give me an overview of current stock market trends",
  },
  {
    icon: <BarChart2 size={16} />,
    label: "Portfolio Review",
    prompt: "How should I diversify my investment portfolio?",
  },
  {
    icon: <Globe size={16} />,
    label: "Crypto Insights",
    prompt: "What's the latest on Bitcoin and crypto market sentiment?",
  },
  {
    icon: <BookOpen size={16} />,
    label: "Learn Investing",
    prompt: "Explain dollar-cost averaging for a beginner",
  },
];

interface WelcomeScreenProps {
  onPromptSelect: (prompt: string) => void;
}

export function WelcomeScreen({ onPromptSelect }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      {/* Logo mark */}
      <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
        <TrendingUp size={26} className="text-white" />
      </div>

      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2 text-center">
        What can I help you with?
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-10 text-center max-w-sm">
        Your AI-powered financial assistant. Ask about markets, portfolios,
        crypto, or any trading topic.
      </p>

      {/* Suggested prompts */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        {SUGGESTED_PROMPTS.map((item) => (
          <button
            key={item.label}
            onClick={() => onPromptSelect(item.prompt)}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl text-left",
              "border border-zinc-200 dark:border-zinc-700/60",
              "bg-white dark:bg-zinc-800/50",
              "hover:border-violet-400/60 hover:bg-violet-50/50 dark:hover:bg-zinc-800",
              "transition-all duration-150 group"
            )}
          >
            <span className="mt-0.5 text-zinc-400 group-hover:text-violet-500 transition-colors flex-shrink-0">
              {item.icon}
            </span>
            <div>
              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">
                {item.label}
              </div>
              <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-snug">
                {item.prompt}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
