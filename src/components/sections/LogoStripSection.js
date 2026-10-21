"use client";

export default function LogoStripSection({ content, theme }) {
  if (!content) return null;
  const { title, logos = [] } = content;

  if (!Array.isArray(logos) || logos.length === 0) {
    return null;
  }

  return (
    <section
      className="w-full py-12 px-6 border-b"
      style={{
        backgroundColor: theme?.surface || "#121514",
        borderColor: theme?.border || "#232825",
      }}
    >
      <div className="max-w-7xl mx-auto text-center">
        {title && (
          <p
            className="text-xs font-mono uppercase tracking-widest mb-8"
            style={{ color: theme?.muted || "#8E928F" }}
          >
            {title}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {logos.map((logo, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity font-mono text-sm tracking-wider uppercase"
              style={{ color: theme?.text || "#F5F5F0" }}
            >
              <span
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: theme?.accent || "#C5FF65" }}
              />
              <span>{logo.name || logo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
