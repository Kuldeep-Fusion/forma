"use client";

import { useGsapAnimation, gsapPresets } from "../../lib/motion/gsapAnimations.js";
import { HoverCard } from "../motion/MotionReveal.js";
import { ArrowRight, CheckCircle2, Cpu, Layers, Workflow, Network } from "lucide-react";

export default function FeaturesSection({ content, theme, motionPreset = "cinematic" }) {
  const containerRef = useGsapAnimation((ctx, isReduced) => {
    if (containerRef.current) {
      gsapPresets.staggerCards(containerRef.current, "[data-gsap='card']", { isReduced, motionPreset });
    }
  }, [content, motionPreset]);

  if (!content) return null;

  const { sectionTitle, subtitle, tag, items = [], layoutVariant = "grid" } = content;

  // Defensive Guard: Never render empty section headings without content
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  // 1. WORKFLOW / PROCESS LAYOUT (Ideal for SaaS Workflows, B2B Delivery Process, Education Tracks)
  if (layoutVariant === "workflow" || layoutVariant === "process") {
    return (
      <section
        ref={containerRef}
        className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t"
        style={{ borderColor: theme?.border || "#232825" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16 md:mb-20">
            {tag && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest mb-4 px-3 py-1 rounded-md"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${theme?.border || "#232825"}`,
                  color: theme?.accent || "#C5FF65",
                }}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>{tag}</span>
              </span>
            )}
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight headline-editorial leading-tight mb-4"
              style={{ color: theme?.text || "#F5F5F0" }}
            >
              {sectionTitle}
            </h2>
            {subtitle && (
              <p className="text-base sm:text-lg" style={{ color: theme?.muted || "#8E928F" }}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {items.map((step, idx) => (
              <div
                key={idx}
                data-gsap="card"
                className="relative rounded-3xl p-8 border flex flex-col justify-between"
                style={{
                  backgroundColor: theme?.surface || "#121514",
                  borderColor: theme?.border || "#232825",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span
                      className="text-3xl sm:text-4xl font-mono font-bold"
                      style={{ color: theme?.accent || "#C5FF65" }}
                    >
                      0{idx + 1}
                    </span>
                    {step.tag && (
                      <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted">
                        {step.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: theme?.text || "#F5F5F0" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: theme?.muted || "#8E928F" }}>
                    {step.description}
                  </p>
                </div>

                <div
                  className="pt-6 mt-8 border-t flex items-center justify-between text-xs font-mono text-muted"
                  style={{ borderColor: theme?.border || "#232825" }}
                >
                  <span>PHASE // 0{idx + 1}</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme?.accent || "#C5FF65" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 2. INTEGRATIONS / ECOSYSTEM GRID (Ideal for SaaS Platforms & Cloud Tools)
  if (layoutVariant === "integrations") {
    return (
      <section
        ref={containerRef}
        className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t"
        style={{ borderColor: theme?.border || "#232825" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            {tag && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest mb-4 px-3 py-1 rounded-md"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${theme?.border || "#232825"}`,
                  color: theme?.accent || "#C5FF65",
                }}
              >
                <Network className="w-3.5 h-3.5" />
                <span>{tag}</span>
              </span>
            )}
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight headline-editorial leading-tight mb-4"
              style={{ color: theme?.text || "#F5F5F0" }}
            >
              {sectionTitle}
            </h2>
            {subtitle && (
              <p className="text-base sm:text-lg" style={{ color: theme?.muted || "#8E928F" }}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((integ, idx) => (
              <div
                key={idx}
                data-gsap="card"
                className="p-6 rounded-2xl border flex flex-col justify-between hover:border-accent/40 transition-colors"
                style={{
                  backgroundColor: theme?.surface || "#121514",
                  borderColor: theme?.border || "#232825",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      color: theme?.accent || "#C5FF65",
                    }}
                  >
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-accent bg-accent/10 px-2 py-0.5 rounded">
                    {integ.tag || "Native API"}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: theme?.text || "#F5F5F0" }}>
                  {integ.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed mb-4" style={{ color: theme?.muted || "#8E928F" }}>
                  {integ.description}
                </p>
                <div
                  className="pt-3 border-t flex items-center justify-between text-[11px] font-mono text-muted"
                  style={{ borderColor: theme?.border || "#232825" }}
                >
                  <span>Latency</span>
                  <span className="text-accent font-bold">&lt; 1ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 3. BENTO-STYLE FEATURE LAYOUT (Ideal for SaaS, Tech, Cybersecurity)
  if (layoutVariant === "bento" && items.length >= 2) {
    const mainFeature = items[0];
    const secondaryFeatures = items.slice(1);

    return (
      <section
        ref={containerRef}
        className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t"
        style={{ borderColor: theme?.border || "#232825" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="max-w-3xl mb-16">
            {tag && (
              <span
                className="inline-block text-xs font-mono uppercase tracking-widest mb-4 px-3 py-1 rounded-md"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${theme?.border || "#232825"}`,
                  color: theme?.accent || "#C5FF65",
                }}
              >
                {tag}
              </span>
            )}

            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight headline-editorial leading-tight mb-4"
              style={{ color: theme?.text || "#F5F5F0" }}
            >
              {sectionTitle}
            </h2>

            {subtitle && (
              <p className="text-base sm:text-lg" style={{ color: theme?.muted || "#8E928F" }}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Large Card (Spans 2 columns on desktop) */}
            <div data-gsap="card" className="lg:col-span-2">
              <HoverCard
                className="h-full p-8 md:p-12 rounded-3xl flex flex-col justify-between border"
                style={{
                  backgroundColor: theme?.surface || "#121514",
                  borderColor: `${theme?.accent || "#C5FF65"}50`,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    {mainFeature.metric && (
                      <span
                        className="text-4xl sm:text-6xl font-mono font-bold tracking-tight"
                        style={{ color: theme?.accent || "#C5FF65" }}
                      >
                        {mainFeature.metric}
                      </span>
                    )}
                    {mainFeature.tag && (
                      <span
                        className="text-xs font-mono uppercase px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          border: `1px solid ${theme?.border || "#232825"}`,
                        }}
                      >
                        {mainFeature.tag}
                      </span>
                    )}
                  </div>

                  <h3
                    className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight"
                    style={{ color: theme?.text || "#F5F5F0" }}
                  >
                    {mainFeature.title}
                  </h3>

                  <p
                    className="text-base sm:text-lg leading-relaxed max-w-xl"
                    style={{ color: theme?.muted || "#8E928F" }}
                  >
                    {mainFeature.description}
                  </p>
                </div>

                <div
                  className="pt-8 mt-6 border-t flex items-center justify-between text-xs font-mono text-muted"
                  style={{ borderColor: theme?.border || "#232825" }}
                >
                  <span>CORE CAPABILITY // 01</span>
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: theme?.accent || "#C5FF65" }}
                  />
                </div>
              </HoverCard>
            </div>

            {/* Complementary Tiles */}
            <div className="space-y-6">
              {secondaryFeatures.slice(0, 2).map((feat, idx) => (
                <div key={idx} data-gsap="card">
                  <HoverCard
                    className="p-8 rounded-3xl border flex flex-col justify-between"
                    style={{
                      backgroundColor: theme?.surface || "#121514",
                      borderColor: theme?.border || "#232825",
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className="text-xl font-mono font-bold"
                          style={{ color: theme?.accent || "#C5FF65" }}
                        >
                          {feat.metric || `0${idx + 2}`}
                        </span>
                        {feat.tag && (
                          <span className="text-[10px] font-mono uppercase text-muted">
                            {feat.tag}
                          </span>
                        )}
                      </div>
                      <h4
                        className="text-xl font-semibold mb-2"
                        style={{ color: theme?.text || "#F5F5F0" }}
                      >
                        {feat.title}
                      </h4>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: theme?.muted || "#8E928F" }}
                      >
                        {feat.description}
                      </p>
                    </div>
                  </HoverCard>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 4. ALTERNATING STORYTELLING ROWS (Ideal for Skincare Rituals, Culinary Philosophy)
  if (layoutVariant === "alternating") {
    return (
      <section
        ref={containerRef}
        className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t"
        style={{ borderColor: theme?.border || "#232825" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-20 text-center mx-auto">
            {tag && (
              <span className="text-xs font-mono uppercase tracking-widest text-accent mb-3 block">
                {tag}
              </span>
            )}
            <h2
              className="text-3xl sm:text-5xl font-bold tracking-tight headline-editorial mb-4"
              style={{ color: theme?.text || "#F5F5F0" }}
            >
              {sectionTitle}
            </h2>
            {subtitle && (
              <p className="text-base sm:text-lg" style={{ color: theme?.muted || "#8E928F" }}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="space-y-16">
            {items.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  data-gsap="card"
                  className={`grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 md:p-12 rounded-3xl border ${
                    isEven ? "" : "md:flex-row-reverse"
                  }`}
                  style={{
                    backgroundColor: theme?.surface || "#121514",
                    borderColor: theme?.border || "#232825",
                  }}
                >
                  <div className={`space-y-4 ${isEven ? "md:col-span-7" : "md:col-span-7 md:order-2"}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-mono font-bold text-accent">0{idx + 1}</span>
                      {item.tag && (
                        <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full border border-white/10 text-muted">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold" style={{ color: theme?.text || "#F5F5F0" }}>
                      {item.title}
                    </h3>
                    <p className="text-base leading-relaxed" style={{ color: theme?.muted || "#8E928F" }}>
                      {item.description}
                    </p>
                  </div>

                  <div
                    className={`p-6 rounded-2xl bg-background/50 border border-border flex flex-col items-center justify-center text-center ${
                      isEven ? "md:col-span-5" : "md:col-span-5 md:order-1"
                    }`}
                  >
                    {item.metric ? (
                      <div className="py-4">
                        <span className="text-4xl md:text-5xl font-mono font-bold text-accent block mb-2">
                          {item.metric}
                        </span>
                        <span className="text-xs font-mono text-muted uppercase">Verified Metric</span>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center gap-2">
                        <div className="p-3 rounded-full bg-accent/15 text-accent">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-mono text-muted uppercase">Certified Specification</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // 5. STANDARD ARCHITECTURAL CARDS GRID (Default)
  return (
    <section
      ref={containerRef}
      className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t"
      style={{ borderColor: theme?.border || "#232825" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16 md:mb-24">
          {tag && (
            <span
              className="inline-block text-xs font-mono uppercase tracking-widest mb-4 px-3 py-1 rounded-md"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${theme?.border || "#232825"}`,
                color: theme?.accent || "#C5FF65",
              }}
            >
              {tag}
            </span>
          )}

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight headline-editorial leading-tight mb-6"
            style={{ color: theme?.text || "#F5F5F0" }}
          >
            {sectionTitle}
          </h2>

          {subtitle && (
            <p className="text-base sm:text-lg max-w-xl" style={{ color: theme?.muted || "#8E928F" }}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <div key={idx} data-gsap="card">
              <HoverCard
                className="h-full p-8 rounded-3xl border flex flex-col justify-between"
                style={{
                  backgroundColor: theme?.surface || "#121514",
                  borderColor: theme?.border || "#232825",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-mono text-muted uppercase">0{idx + 1} // CAPABILITY</span>
                    {item.metric && (
                      <span className="text-sm font-mono font-bold text-accent">{item.metric}</span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: theme?.text || "#F5F5F0" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: theme?.muted || "#8E928F" }}>
                    {item.description}
                  </p>
                </div>

                <div
                  className="pt-6 mt-8 border-t flex items-center justify-between text-xs font-mono text-muted"
                  style={{ borderColor: theme?.border || "#232825" }}
                >
                  <span>{item.tag || "Production Feature"}</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme?.accent || "#C5FF65" }} />
                </div>
              </HoverCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
