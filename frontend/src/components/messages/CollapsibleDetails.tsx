import React, { useState } from "react";
import {
  createContentPreview,
  createMoreLinesIndicator,
} from "../../utils/contentUtils";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { CopyButton } from "../CopyButton";

interface CollapsibleDetailsProps {
  label: string;
  details: string;
  colorScheme: {
    header: string;
    content: string;
    border: string;
    bg: string;
  };
  icon?: React.ReactNode;
  badge?: string;
  defaultExpanded?: boolean;
  maxPreviewLines?: number;
  showPreview?: boolean;
  previewContent?: string;
  previewSummary?: string;
  /** Whether to render `details` as markdown. When false (default), renders as plain text. */
  renderMarkdown?: boolean;
}

export function CollapsibleDetails({
  label,
  details,
  colorScheme,
  icon,
  badge,
  defaultExpanded = false,
  maxPreviewLines = 5,
  showPreview = true,
  previewContent,
  previewSummary,
  renderMarkdown = false,
}: CollapsibleDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasDetails = details.trim().length > 0;
  const isCollapsible = hasDetails && !defaultExpanded;

  const contentPreview = React.useMemo(() => {
    const computedTotalLines = details.split("\n").length;
    if (previewContent !== undefined) {
      return {
        preview: previewContent,
        hasMore: true,
        totalLines: computedTotalLines,
        previewLines: previewContent.split("\n").length,
      };
    }
    // Only create preview if showPreview is enabled
    if (showPreview) {
      return createContentPreview(details, maxPreviewLines);
    }
    // Return no preview
    return {
      preview: "",
      hasMore: false,
      totalLines: computedTotalLines,
      previewLines: 0,
    };
  }, [details, maxPreviewLines, previewContent, showPreview]);

  const shouldShowPreview =
    showPreview && !isExpanded && hasDetails && contentPreview.hasMore;

  return (
    <div
      className={`mb-3 p-3 rounded-lg ${colorScheme.bg} border ${colorScheme.border} group/details`}
    >
      <div className="flex items-center justify-between gap-4 mb-1">
        <div
          className={`${colorScheme.header} text-xs font-medium flex items-center gap-2 flex-1 min-w-0 ${isCollapsible ? "cursor-pointer hover:opacity-80" : ""}`}
          role={isCollapsible ? "button" : undefined}
          tabIndex={isCollapsible ? 0 : undefined}
          aria-expanded={isCollapsible ? isExpanded : undefined}
          onClick={isCollapsible ? () => setIsExpanded(!isExpanded) : undefined}
          onKeyDown={
            isCollapsible
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                  }
                }
              : undefined
          }
        >
          {icon && (
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">
              {icon}
            </div>
          )}
          <span className="truncate">{label}</span>
          {badge && <span className="opacity-80 flex-shrink-0">({badge})</span>}
          {previewSummary && (
            <span className="opacity-60 text-xs ml-2 truncate">
              {previewSummary}
            </span>
          )}
          {isCollapsible && (
            <span className="ml-1 opacity-80 flex-shrink-0">
              {isExpanded ? "▼" : "▶"}
            </span>
          )}
        </div>
        {hasDetails && (
          <div className="opacity-0 group-hover/details:opacity-100 focus-within:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <CopyButton
              text={details}
              className="p-1 scale-75 bg-transparent border-none shadow-none text-current opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
              iconClassName="w-3.5 h-3.5"
            />
          </div>
        )}
      </div>
      {shouldShowPreview && (
        <div
          className="mt-2 pl-6 border-l-2 border-dashed opacity-80"
          style={{ borderColor: "inherit" }}
        >
          <pre
            className={`whitespace-pre-wrap ${colorScheme.content} text-xs font-mono leading-relaxed`}
          >
            {contentPreview.preview}
          </pre>
          <div
            className={`${colorScheme.content} text-xs opacity-60 mt-1 italic`}
          >
            {createMoreLinesIndicator(
              contentPreview.totalLines,
              contentPreview.previewLines,
            )}
          </div>
        </div>
      )}
      {hasDetails && isExpanded && (
        <div className={`mt-2 pl-6 border-l-2 ${colorScheme.border}`}>
          {renderMarkdown ? (
            <MarkdownRenderer content={details} className="text-xs" />
          ) : (
            <pre
              className={`whitespace-pre-wrap ${colorScheme.content} text-xs font-mono leading-relaxed`}
            >
              {details}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
