"use client";

import { useGsapAnimation, gsapPresets } from "../../lib/motion/gsapAnimations.js";

export default function StatsSection({ content, theme, motionPreset = "cinematic" }) {
  const containerRef = useGsapAnimation((ctx, isReduced) => {
    if (containerRef.current) {
      gsapPresets.staggerCards(containerRef.current, "[data-gsap='card']", { isReduced, motionPreset });
    }
  }, [content, motionPreset]);

  if (!content) return null;
  const { sectionTitle, subtitle, stats = [], layoutVariant = "cards" } = content;

  if (!Array.isArray(stats) || stats.length === 0) {
    return null;
  }

  // 1. MINIMAL BAR / TICKER DIVIDER (Ideal for luxury, minimal, and typography-first brands)
  if (layoutVariant === "minimal_bar" || layoutVariant === "ticker") {
    return (
      <section
        ref={containerRef}
        className="w-full py-12 md:py-16 px-6 md:px-12 border-y"
        style={{
          backgroundColor: theme?.surface || "#121514",
          borderColor: theme?.border || "#232825",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              data-gsap="card"
              className="flex items-baseline gap-4 py-2"
            >
              <span
                className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-tight"
                style={{ color: theme?.accent || "#FF5A1F" }}
              >
                {stat.metric}
              </span>
              <div>
                <div className="text-sm font-semibold tracking-wide" style={{ color: theme?.text || "#F5F5F0" }}>
                  {stat.label}
                </div>
                {stat.description && (
                  <div className="text-xs font-mono" style={{ color: theme?.muted || "#8E928F" }}>
                    {stat.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 2. GIANT NUMBERS EDITORIAL GRID (Ideal for high-impact editorial & agency showcases)
  if (layoutVariant === "giant_numbers" || layoutVariant === "editorial") {
    return (
      <section
        ref={containerRef}
        className="w-full py-24 md:py-36 px-6 md:px-12 lg:px-20 border-b"
        style={{
          backgroundColor: theme?.bg || "#0B0D0C",
          borderColor: theme?.border || "#232825",
        }}
      >
        <div className="max-w-7xl mx-auto">
          {(sectionTitle || subtitle) && (
            <div className="max-w-3xl mb-16 md:mb-20">
              {sectionTitle && (
                <h2
                  className="text-3xl sm:text-5xl font-bold tracking-tight headline-editorial mb-4"
                  style={{ color: theme?.text || "#F5F5F0" }}
                >
                  {sectionTitle}
                </h2>
              )}
              {subtitle && (
                <p className="text-base sm:text-lg" style={{ color: theme?.muted || "#8E928F" }}>
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                data-gsap="card"
                className="pt-6 border-t"
                style={{ borderColor: theme?.border || "#232825" }}
              >
                <div
                  className="text-6xl sm:text-7xl lg:text-8xl font-mono font-bold tracking-tighter mb-4"
                  style={{ color: theme?.accent || "#FF5A1F" }}
                >
                  {stat.metric}
                </div>
                <h4 className="text-xl font-bold mb-2 tracking-tight" style={{ color: theme?.text || "#F5F5F0" }}>
                  {stat.label}
                </h4>
                {stat.description && (
                  <p className="text-sm leading-relaxed" style={{ color: theme?.muted || "#8E928F" }}>
                    {stat.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 3. STANDARD CARDS GRID (Default)
  return (
    <section
      ref={containerRef}
      className="w-full py-20 md:py-28 px-6 md:px-12 border-b"
      style={{
        backgroundColor: theme?.bg || "#0B0D0C",
        borderColor: theme?.border || "#232825",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {(sectionTitle || subtitle) && (
          <div className="max-w-2xl mb-16">
            {sectionTitle && (
              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight headline-editorial mb-4"
                style={{ color: theme?.text || "#F5F5F0" }}
              >
                {sectionTitle}
              </h2>
            )}
            {subtitle && (
              <p className="text-base" style={{ color: theme?.muted || "#8E928F" }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              data-gsap="card"
              className="p-8 rounded-2xl border"
              style={{
                backgroundColor: theme?.surface || "#121514",
                borderColor: theme?.border || "#232825",
              }}
            >
              <div
                className="text-4xl sm:text-5xl font-mono font-bold tracking-tight mb-2"
                style={{ color: theme?.accent || "#C5FF65" }}
              >
                {stat.metric}
              </div>
              <h4 className="text-base font-semibold mb-1" style={{ color: theme?.text || "#F5F5F0" }}>
                {stat.label}
              </h4>
              {stat.description && (
                <p className="text-xs leading-relaxed" style={{ color: theme?.muted || "#8E928F" }}>
                  {stat.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
