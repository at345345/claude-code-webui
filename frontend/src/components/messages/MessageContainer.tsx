import React from "react";
import { CopyButton } from "../CopyButton";

interface MessageContainerProps {
  alignment: "left" | "right" | "center";
  colorScheme: string;
  children: React.ReactNode;
  copyText?: string | (() => string);
}

export function MessageContainer({
  alignment,
  colorScheme,
  children,
  copyText,
}: MessageContainerProps) {
  const justifyClass =
    alignment === "right"
      ? "justify-end"
      : alignment === "center"
        ? "justify-center"
        : "justify-start";

  return (
    <div className={`mb-4 flex ${justifyClass} relative group/msg`}>
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-lg px-4 py-3 relative ${colorScheme}`}
      >
        {copyText && (
          <div className="absolute right-2 top-2 opacity-0 group-hover/msg:opacity-100 focus-within:opacity-100 transition-opacity duration-200 z-10">
            <CopyButton
              text={copyText}
              className="p-1 scale-90 bg-white/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm"
              iconClassName="w-3.5 h-3.5"
            />
          </div>
        )}
        <div className={copyText ? "pr-6" : ""}>{children}</div>
      </div>
    </div>
  );
}
