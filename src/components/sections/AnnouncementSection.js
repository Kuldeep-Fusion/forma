"use client";

import { ArrowRight, Sparkles } from "lucide-react";

export default function AnnouncementSection({ content, theme }) {
  if (!content) return null;
  const { badge, message, linkText, linkHref = "#" } = content;

  return (
    <div
      className="w-full py-2.5 px-4 text-xs font-mono border-b flex items-center justify-center gap-2.5 transition-colors"
      style={{
        backgroundColor: theme?.surface || "#121514",
        borderColor: theme?.border || "#232825",
        color: theme?.text || "#F5F5F0",
      }}
    >
      {badge && (
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 uppercase tracking-wider"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            color: theme?.accent || "#C5FF65",
          }}
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>{badge}</span>
        </span>
      )}

      <span>{message}</span>

      {linkText && (
        <a
          href={linkHref}
          className="inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-80 transition-opacity"
          style={{ color: theme?.accent || "#C5FF65" }}
        >
          <span>{linkText}</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
