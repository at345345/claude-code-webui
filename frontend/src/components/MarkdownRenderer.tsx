import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { useState, useMemo, useEffect } from "react";

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
 * Renders markdown content using react-markdown with rehype-sanitize.
 * Falls back to plain text rendering when content is empty or plain mode is enabled.
 *
 * Uses useMemo to avoid re-parsing unchanged content during streaming.
 */
export function MarkdownRenderer({
  content,
  plain = false,
  className = "",
}: MarkdownRendererProps) {
  const [isReady, setIsReady] = useState(false);

  // Mark component as ready after first render (enables client-side rendering)
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Memoize the rendered content to avoid re-parsing on every render
  const rendered = useMemo(() => {
    if (!content || plain || !isReady) {
      return null;
    }
    return (
      <div
        className={`prose prose-sm dark:prose-invert max-w-none break-words ${className}`}
      >
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }, [content, plain, isReady, className]);

  // Show placeholder while client-side hydration completes
  if (!isReady) {
    return (
      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
        {content}
      </pre>
    );
  }

  // Fallback to plain text for empty content, plain mode, or non-client render
  if (!rendered) {
    return (
      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
        {content}
      </pre>
    );
  }

  return <>{rendered}</>;
}
