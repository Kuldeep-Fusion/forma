"use client";

export default function FooterSection({ content, theme }) {
  if (!content) return null;

  const { brand, tagline, copyright, links = [] } = content;

  return (
    <footer
      className="w-full py-12 md:py-16 px-6 md:px-12 lg:px-20 border-t"
      style={{
        backgroundColor: theme?.bg || "#0B0D0C",
        borderColor: theme?.border || "#232825",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme?.accent || "#C5FF65" }} />
            <span className="font-bold tracking-tight text-lg" style={{ color: theme?.text || "#F5F5F0" }}>
              {brand}
            </span>
          </div>
          {tagline && (
            <p className="text-xs font-mono" style={{ color: theme?.muted || "#8E928F" }}>
              {tagline}
            </p>
          )}
        </div>

        {links.length > 0 && (
          <div className="flex flex-wrap items-center gap-6 text-sm">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="transition-colors duration-200 hover:text-foreground"
                style={{ color: theme?.muted || "#8E928F" }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="text-xs font-mono" style={{ color: theme?.muted || "#8E928F" }}>
          {copyright}
        </div>
      </div>
    </footer>
  );
}
