import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { useMemo } from "react";
import { CopyButton } from "./CopyButton";

interface MarkdownRendererProps {
  /** The markdown content to render */
  content: string;
  /** Whether to render as plain text (no markdown processing).
   * Useful for thinking content or tool output that should stay as-is. */
  plain?: boolean;
  /** Additional Tailwind classes for the container */
  className?: string;
}

/**
 * Renders markdown content using react-markdown with rehype-sanitize and remark-gfm.
 * Falls back to plain text rendering when content is empty or plain mode is enabled.
 *
 * Uses useMemo to avoid re-parsing unchanged content during streaming.
 */
export function MarkdownRenderer({
  content,
  plain = false,
  className = "",
}: MarkdownRendererProps) {
  // Memoize the rendered content to avoid re-parsing on every render
  const rendered = useMemo(() => {
    if (!content || plain) {
      return null;
    }
    return (
      <div
        className={`prose prose-sm dark:prose-invert max-w-none break-words ${className}`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            code({ className, children, node, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match;
              if (isInline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
              const codeString = String(children).replace(/\n$/, "");
              return (
                <div className="relative group/code my-4">
                  <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-10">
                    <CopyButton
                      text={codeString}
                      className="bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200"
                    />
                  </div>
                  <pre className="!bg-slate-950 !text-slate-100 p-4 rounded-xl overflow-x-auto font-mono text-sm border border-slate-900 shadow-inner">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }, [content, plain, className]);

  // Fallback to plain text for empty content, plain mode
  if (!rendered) {
    return (
      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
        {content}
      </pre>
    );
  }

  return <>{rendered}</>;
}
