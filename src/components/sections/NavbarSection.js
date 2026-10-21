"use client";

import { ArrowUpRight } from "lucide-react";

export default function NavbarSection({ content, theme }) {
  if (!content) return null;
  const { brandName, links = [], cta } = content;

  return (
    <nav
      className="w-full px-6 md:px-12 py-4 border-b flex items-center justify-between transition-colors sticky top-0 z-30 backdrop-blur-md"
      style={{
        backgroundColor: `${theme?.bg || "#0B0D0C"}ee`,
        borderColor: theme?.border || "#232825",
        color: theme?.text || "#F5F5F0",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: theme?.accent || "#C5FF65" }}
        />
        <span className="font-bold tracking-tight text-lg font-display">
          {brandName}
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.href}
            className="transition-colors hover:text-foreground"
            style={{ color: theme?.muted || "#8E928F" }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {cta && (
        <a
          href={cta.href || "#"}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-medium transition-all duration-200 hover:scale-[1.02]"
          style={{
            backgroundColor: theme?.accent || "#C5FF65",
            color: theme?.bg || "#0B0D0C",
          }}
        >
          <span>{cta.label}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      )}
    </nav>
  );
}
