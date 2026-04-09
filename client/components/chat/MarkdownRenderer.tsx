import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
import { cn } from "@/lib/cn";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose-sm prose-zinc dark:prose-invert max-w-none text-sm leading-7 text-zinc-800 dark:text-zinc-200", className)}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const isBlock = !props.node?.position ||
            (props.node.position.start.line !== props.node.position.end.line);

          if (match || isBlock) {
            return (
              <CodeBlock
                language={match?.[1] ?? ""}
                value={String(children).replace(/\n$/, "")}
              />
            );
          }
          return (
            <code
              className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[0.8125em]"
              {...props}
            >
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-3 last:mb-0 leading-7">{children}</p>;
        },
        ul({ children }) {
          return <ul className="mb-3 pl-5 space-y-1 list-disc">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="mb-3 pl-5 space-y-1 list-decimal">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-7">{children}</li>;
        },
        strong({ children }) {
          return <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{children}</strong>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="pl-4 border-l-2 border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 italic my-3">
              {children}
            </blockquote>
          );
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>;
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="px-3 py-2 text-left font-semibold border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="px-3 py-2 border border-zinc-200 dark:border-zinc-700">
              {children}
            </td>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
