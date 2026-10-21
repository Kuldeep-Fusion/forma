"use client";

import { useGsapAnimation, gsapPresets } from "../../lib/motion/gsapAnimations.js";
import { CheckCircle2 } from "lucide-react";

export default function BenefitsSection({ content, theme, motionPreset = "cinematic" }) {
  const containerRef = useGsapAnimation((ctx, isReduced) => {
    if (containerRef.current) {
      gsapPresets.staggerCards(containerRef.current, "[data-gsap='card']", { isReduced, motionPreset });
    }
  }, [content, motionPreset]);

  if (!content) return null;
  const { sectionTitle, subtitle, items = [], layoutVariant = "cards" } = content;

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  // 1. SPLIT LIST EDITORIAL LAYOUT (Ideal for luxury, boutique agencies, sustainable brands)
  if (layoutVariant === "split_list" || layoutVariant === "editorial" || layoutVariant === "minimal") {
    return (
      <section
        ref={containerRef}
        className="w-full py-24 md:py-36 px-6 md:px-12 lg:px-20 border-b"
        style={{
          backgroundColor: theme?.bg || "#0B0D0C",
          borderColor: theme?.border || "#232825",
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <span
              className="text-xs font-mono uppercase tracking-widest mb-4 block"
              style={{ color: theme?.accent || "#FF5A1F" }}
            >
              The Standard
            </span>
            <h2
              className="text-3xl sm:text-5xl font-bold tracking-tight headline-editorial mb-6 leading-tight"
              style={{ color: theme?.text || "#F5F5F0" }}
            >
              {sectionTitle}
            </h2>
            {subtitle && (
              <p className="text-base sm:text-lg leading-relaxed" style={{ color: theme?.muted || "#8E928F" }}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="lg:col-span-7 divide-y" style={{ borderColor: theme?.border || "#232825" }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                data-gsap="card"
                className="py-8 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline"
              >
                <div className="sm:col-span-3 flex items-center gap-3">
                  <span className="text-sm font-mono font-bold" style={{ color: theme?.accent || "#FF5A1F" }}>
                    0{idx + 1} //
                  </span>
                  {item.badge && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-muted border border-white/10">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="sm:col-span-9 space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: theme?.text || "#F5F5F0" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: theme?.muted || "#8E928F" }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 2. STANDARD CARDS GRID (Default)
  return (
    <section
      ref={containerRef}
      className="w-full py-20 md:py-32 px-6 md:px-12 border-b"
      style={{
        backgroundColor: theme?.surface || "#121514",
        borderColor: theme?.border || "#232825",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <span
            className="text-xs font-mono uppercase tracking-widest mb-3 block"
            style={{ color: theme?.accent || "#C5FF65" }}
          >
            Strategic Advantages
          </span>
          <h2
            className="text-3xl sm:text-5xl font-bold tracking-tight headline-editorial mb-4"
            style={{ color: theme?.text || "#F5F5F0" }}
          >
            {sectionTitle}
          </h2>
          {subtitle && (
            <p className="text-base" style={{ color: theme?.muted || "#8E928F" }}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, idx) => (
            <div
              key={idx}
              data-gsap="card"
              className="p-8 rounded-2xl border flex items-start gap-5 hover:border-accent/40 transition-colors"
              style={{
                backgroundColor: theme?.bg || "#0B0D0C",
                borderColor: theme?.border || "#232825",
              }}
            >
              <div
                className="p-2.5 rounded-xl mt-1 shrink-0"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  color: theme?.accent || "#C5FF65",
                }}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: theme?.text || "#F5F5F0" }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: theme?.muted || "#8E928F" }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
