"use client";

import { useGsapAnimation, gsapPresets } from "../../lib/motion/gsapAnimations.js";
import {
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Terminal,
} from "lucide-react";

export default function HeroSection({ content, theme, motionPreset = "cinematic" }) {
  const containerRef = useGsapAnimation((ctx, isReduced) => {
    if (containerRef.current) {
      gsapPresets.heroEntrance(containerRef.current, { isReduced, motionPreset });
    }
  }, [content, motionPreset]);

  if (!content) return null;

  const {
    badge,
    headline,
    subheadline,
    primaryCta,
    secondaryCta,
    media,
    layoutVariant = "editorial",
    statsPills = [],
    mockup = null,
    ticker = [],
  } = content;

  // 1. SAAS / PRODUCT INTERFACE MOCKUP HERO (Ideal for AI Startups, SaaS, Developer Platforms)
  if (
    layoutVariant === "saas_mockup" ||
    layoutVariant === "mockup" ||
    layoutVariant === "product_screenshot" ||
    layoutVariant === "terminal"
  ) {
    const chip1 = statsPills?.[0] || {
      label: mockup?.metrics?.[0]?.label || "Operational Status",
      value: mockup?.metrics?.[0]?.value || "100% Active",
    };
    const chip2 = statsPills?.[1] || {
      label: mockup?.metrics?.[1]?.label || "Performance SLA",
      value: mockup?.metrics?.[1]?.value || "P99 < 12ms",
    };
    const browserPath =
      mockup?.path ||
      (headline
        ? headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) + ".app/live"
        : "app.workspace.io/telemetry");

    return (
      <section
        ref={containerRef}
        className="relative w-full pt-16 pb-28 md:pt-28 md:pb-40 px-6 md:px-12 lg:px-20 overflow-hidden text-center"
      >
        {/* Ambient Underglow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-25"
          style={{ backgroundColor: theme?.accent || "#FF5A1F" }}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          {badge && (
            <div data-gsap="hero-badge" className="mb-6 flex justify-center">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider shadow-sm"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: `1px solid ${theme?.border || "#232825"}`,
                  color: theme?.accent || "#FF5A1F",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badge}</span>
              </div>
            </div>
          )}

          <h1
            data-gsap="hero-headline"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight headline-editorial leading-[1.04] mb-8"
            style={{ color: theme?.text || "#F5F5F0" }}
          >
            {headline}
          </h1>

          <p
            data-gsap="hero-subheadline"
            className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ color: theme?.muted || "#8E928F" }}
          >
            {subheadline}
          </p>

          <div
            data-gsap="hero-cta"
            className="flex flex-wrap items-center justify-center gap-4 mb-16 md:mb-20"
          >
            {primaryCta && (
              <a
                href={primaryCta.href || "#"}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-[1.03] shadow-xl"
                style={{
                  backgroundColor: theme?.accent || "#FF5A1F",
                  color: theme?.bg || "#0B0D0C",
                }}
              >
                <span>{primaryCta.label}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href || "#"}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-medium text-sm transition-all duration-300 hover:bg-white/5 border backdrop-blur-sm"
                style={{
                  borderColor: theme?.border || "#232825",
                  color: theme?.text || "#F5F5F0",
                }}
              >
                <span>{secondaryCta.label}</span>
              </a>
            )}
          </div>

          {/* Interactive Floating Product Mockup Window */}
          <div data-gsap="hero-media" className="relative max-w-4xl mx-auto">
            {/* Left Floating Stat Chip */}
            <div
              className="hidden lg:flex absolute -left-10 top-1/4 -translate-y-1/2 z-20 items-center gap-3 p-3.5 rounded-2xl backdrop-blur-xl border shadow-2xl animate-bounce duration-[4000ms]"
              style={{
                backgroundColor: "rgba(18, 21, 20, 0.85)",
                borderColor: `${theme?.accent || "#FF5A1F"}50`,
              }}
            >
              <div
                className="p-2 rounded-xl"
                style={{
                  backgroundColor: `${theme?.accent || "#FF5A1F"}20`,
                  color: theme?.accent || "#FF5A1F",
                }}
              >
                <Activity className="w-4 h-4" />
              </div>
              <div className="text-left font-mono">
                <span className="text-[10px] text-muted block uppercase">{chip1.label}</span>
                <span
                  className="text-xs font-bold"
                  style={{ color: theme?.accent || "#FF5A1F" }}
                >
                  {chip1.value}
                </span>
              </div>
            </div>

            {/* Right Floating Stat Chip */}
            <div
              className="hidden lg:flex absolute -right-10 bottom-1/4 z-20 items-center gap-3 p-3.5 rounded-2xl backdrop-blur-xl border shadow-2xl animate-pulse"
              style={{
                backgroundColor: "rgba(18, 21, 20, 0.85)",
                borderColor: `${theme?.accent || "#FF5A1F"}50`,
              }}
            >
              <div
                className="p-2 rounded-xl"
                style={{
                  backgroundColor: `${theme?.accent || "#FF5A1F"}20`,
                  color: theme?.accent || "#FF5A1F",
                }}
              >
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left font-mono">
                <span className="text-[10px] text-muted block uppercase">{chip2.label}</span>
                <span className="text-xs font-bold text-white">{chip2.value}</span>
              </div>
            </div>

            {/* Browser Frame */}
            <div
              className="rounded-3xl overflow-hidden border shadow-2xl text-left"
              style={{
                backgroundColor: theme?.surface || "#121514",
                borderColor: theme?.border || "#232825",
              }}
            >
              {/* Browser Header Bar */}
              <div
                className="h-11 px-4 flex items-center justify-between border-b"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  borderColor: theme?.border || "#232825",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="px-4 py-1 rounded-md text-[11px] font-mono text-muted flex items-center gap-2 bg-black/40 border border-white/5">
                  <Terminal className="w-3 h-3 text-accent" />
                  <span>{browserPath}</span>
                </div>
                <div className="w-12" />
              </div>

              {/* Mockup Canvas */}
              {media?.url ? (
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={media.url}
                    alt={media.alt || "Product Interface"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="p-6 md:p-8 space-y-6">
                  {/* Dashboard Header Preview */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div>
                      <h4 className="text-sm font-mono font-bold text-white">
                        {mockup?.title || "Production Runtime Engine"}
                      </h4>
                      <p className="text-xs text-muted font-mono">
                        {mockup?.status || "Zero-Trust Active // Region: Multi-Cloud Verified"}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
                      LIVE ACTIVE
                    </span>
                  </div>

                  {/* Dashboard Grid Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
                    <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-muted uppercase block">
                        {mockup?.metrics?.[0]?.label || "Invocations"}
                      </span>
                      <span className="text-xl font-bold text-white">
                        {mockup?.metrics?.[0]?.value || "48,291 / sec"}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-muted uppercase block">
                        {mockup?.metrics?.[1]?.label || "Latency"}
                      </span>
                      <span className="text-xl font-bold" style={{ color: theme?.accent || "#FF5A1F" }}>
                        {mockup?.metrics?.[1]?.value || "0.84 ms"}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-muted uppercase block">
                        {mockup?.metrics?.[2]?.label || "Mitigation"}
                      </span>
                      <span className="text-xl font-bold text-white">
                        {mockup?.metrics?.[2]?.value || "100% Sealed"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 2. LARGE MONUMENTAL TYPOGRAPHY HERO (Ideal for Creative Studios, Fashion Drops, Avant-Garde Agencies)
  if (
    layoutVariant === "large_typography" ||
    layoutVariant === "typography_led" ||
    layoutVariant === "statement"
  ) {
    const tickerItems = ticker?.length > 0 ? ticker : [
      badge || "ORIGINAL SYNTHESIS",
      "BESPOKE ARCHITECTURE",
      "DIRECT-TO-CONSUMER",
      "EDITORIAL REFINEMENT",
    ];

    return (
      <section
        ref={containerRef}
        className="relative w-full pt-16 pb-24 md:pt-28 md:pb-36 px-6 md:px-12 lg:px-20 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          {badge && (
            <div data-gsap="hero-badge" className="mb-6">
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border"
                style={{
                  borderColor: theme?.border || "#232825",
                  color: theme?.accent || "#FF5A1F",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badge}</span>
              </span>
            </div>
          )}

          <h1
            data-gsap="hero-headline"
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight headline-editorial leading-[0.94] mb-8 uppercase"
            style={{ color: theme?.text || "#F5F5F0" }}
          >
            {headline}
          </h1>

          <div
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end pb-12 border-b"
            style={{ borderColor: theme?.border || "#232825" }}
          >
            <div className="md:col-span-8">
              <p
                data-gsap="hero-subheadline"
                className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed max-w-2xl"
                style={{ color: theme?.muted || "#8E928F" }}
              >
                {subheadline}
              </p>
            </div>
            <div
              className="md:col-span-4 flex items-center justify-start md:justify-end gap-4"
              data-gsap="hero-cta"
            >
              {primaryCta && (
                <a
                  href={primaryCta.href || "#"}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-[1.03] shadow-xl"
                  style={{
                    backgroundColor: theme?.accent || "#FF5A1F",
                    color: theme?.bg || "#0B0D0C",
                  }}
                >
                  <span>{primaryCta.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Marquee Ticker Strip */}
          <div
            className="pt-6 flex flex-wrap items-center gap-6 text-xs font-mono tracking-wider opacity-85"
            style={{ color: theme?.muted || "#8E928F" }}
          >
            {tickerItems.map((item, i) => (
              <span key={i} className="flex items-center gap-3">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: theme?.accent || "#FF5A1F" }}
                />
                <span>{item}</span>
              </span>
            ))}
          </div>

          {media?.url && (
            <div
              data-gsap="hero-media"
              className="mt-12 rounded-3xl overflow-hidden border shadow-2xl"
              style={{ borderColor: theme?.border || "#232825" }}
            >
              <img
                src={media.url}
                alt={media.alt || "Hero visual"}
                className="w-full h-80 sm:h-[480px] object-cover"
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  // 3. MINIMAL LUXURY HERO (Ideal for High-End Skincare, Fine Jewelry, Haute Horlogerie, Private Estates)
  if (
    layoutVariant === "minimal_luxury" ||
    layoutVariant === "luxury" ||
    layoutVariant === "quiet_luxury"
  ) {
    return (
      <section
        ref={containerRef}
        className="relative w-full pt-20 pb-28 md:pt-36 md:pb-48 px-6 md:px-12 lg:px-24 overflow-hidden text-center"
      >
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          {badge && (
            <div data-gsap="hero-badge">
              <span
                className="text-[11px] font-mono tracking-[0.25em] uppercase pb-1 border-b"
                style={{
                  borderColor: theme?.accent || "#FF5A1F",
                  color: theme?.accent || "#FF5A1F",
                }}
              >
                {badge}
              </span>
            </div>
          )}

          <h1
            data-gsap="hero-headline"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight font-serif leading-[1.08]"
            style={{ color: theme?.text || "#F5F5F0" }}
          >
            {headline}
          </h1>

          <div
            className="w-12 h-px mx-auto"
            style={{ backgroundColor: theme?.border || "#232825" }}
          />

          <p
            data-gsap="hero-subheadline"
            className="text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto"
            style={{ color: theme?.muted || "#8E928F" }}
          >
            {subheadline}
          </p>

          <div
            data-gsap="hero-cta"
            className="flex flex-wrap items-center justify-center gap-5 pt-4"
          >
            {primaryCta && (
              <a
                href={primaryCta.href || "#"}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300 hover:scale-[1.02] shadow-sm"
                style={{
                  backgroundColor: theme?.accent || "#FF5A1F",
                  color: theme?.bg || "#0B0D0C",
                }}
              >
                <span>{primaryCta.label}</span>
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href || "#"}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-mono uppercase tracking-widest border transition-all duration-300 hover:bg-white/5"
                style={{
                  borderColor: theme?.border || "#232825",
                  color: theme?.text || "#F5F5F0",
                }}
              >
                <span>{secondaryCta.label}</span>
              </a>
            )}
          </div>

          {media?.url && (
            <div
              data-gsap="hero-media"
              className="mt-16 md:mt-24 max-w-3xl mx-auto rounded-3xl overflow-hidden p-2 border"
              style={{
                borderColor: theme?.border || "#232825",
                backgroundColor: theme?.surface || "#121514",
              }}
            >
              <img
                src={media.url}
                alt={media.alt || "Luxury showcase"}
                className="w-full h-80 sm:h-[460px] object-cover rounded-2xl"
              />
              {media.caption && (
                <p
                  className="text-xs font-mono text-center py-3"
                  style={{ color: theme?.muted || "#8E928F" }}
                >
                  {media.caption}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // 4. OVERLAPPING VISUAL / BENTO HERO (Ideal for Fitness Startups, Creative Tech, Dynamic Consumer Apps)
  if (
    layoutVariant === "overlapping" ||
    layoutVariant === "overlapping_cards" ||
    layoutVariant === "bento_hero"
  ) {
    return (
      <section
        ref={containerRef}
        className="relative w-full pt-16 pb-28 md:pt-28 md:pb-40 px-6 md:px-12 lg:px-20 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            {badge && (
              <div data-gsap="hero-badge">
                <span
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold"
                  style={{
                    backgroundColor: `${theme?.accent || "#FF5A1F"}20`,
                    color: theme?.accent || "#FF5A1F",
                    border: `1px solid ${theme?.accent || "#FF5A1F"}40`,
                  }}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>{badge}</span>
                </span>
              </div>
            )}

            <h1
              data-gsap="hero-headline"
              className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight headline-editorial leading-[1.04]"
              style={{ color: theme?.text || "#F5F5F0" }}
            >
              {headline}
            </h1>

            <p
              data-gsap="hero-subheadline"
              className="text-lg sm:text-xl font-normal leading-relaxed max-w-xl"
              style={{ color: theme?.muted || "#8E928F" }}
            >
              {subheadline}
            </p>

            <div data-gsap="hero-cta" className="flex flex-wrap items-center gap-4 pt-2">
              {primaryCta && (
                <a
                  href={primaryCta.href || "#"}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-[1.03] shadow-xl"
                  style={{
                    backgroundColor: theme?.accent || "#FF5A1F",
                    color: theme?.bg || "#0B0D0C",
                  }}
                >
                  <span>{primaryCta.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
              {secondaryCta && (
                <a
                  href={secondaryCta.href || "#"}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-medium text-sm border transition-all hover:bg-white/5"
                  style={{
                    borderColor: theme?.border || "#232825",
                    color: theme?.text || "#F5F5F0",
                  }}
                >
                  <span>{secondaryCta.label}</span>
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative" data-gsap="hero-media">
            {media?.url ? (
              <div className="relative">
                <div
                  className="rounded-3xl overflow-hidden p-2.5 border shadow-2xl relative z-10"
                  style={{
                    backgroundColor: theme?.surface || "#121514",
                    borderColor: theme?.border || "#232825",
                  }}
                >
                  <img
                    src={media.url}
                    alt={media.alt || "Product Action"}
                    className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                  />
                </div>

                <div
                  className="absolute -bottom-6 -left-6 z-20 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-pulse"
                  style={{
                    backgroundColor: `${theme?.surface || "#121514"}EE`,
                    borderColor: `${theme?.accent || "#FF5A1F"}60`,
                  }}
                >
                  <div
                    className="p-2.5 rounded-xl"
                    style={{
                      backgroundColor: `${theme?.accent || "#FF5A1F"}25`,
                      color: theme?.accent || "#FF5A1F",
                    }}
                  >
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-muted block uppercase">Validated Standard</span>
                    <span className="text-sm font-bold" style={{ color: theme?.accent || "#FF5A1F" }}>
                      Peak Performance
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  // 5. IMMERSIVE FULL-BLEED HERO (Ideal for Fine Dining, High-End Real Estate, Luxury Skincare)
  if (layoutVariant === "immersive" || layoutVariant === "fullbleed_immersive") {
    return (
      <section
        ref={containerRef}
        className="relative w-full min-h-[90vh] flex items-center justify-center px-6 md:px-12 py-24 overflow-hidden"
      >
        {media?.url && (
          <div data-gsap="hero-media" className="absolute inset-0 z-0">
            <img
              src={media.url}
              alt={media.alt || "Hero visual"}
              className="w-full h-full object-cover scale-105 filter brightness-[0.45] contrast-[1.05]"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at center, transparent 30%, ${theme?.bg || "#0B0D0C"} 95%)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-bg)] via-black/40 to-black/60" />
          </div>
        )}

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {badge && (
            <div data-gsap="hero-badge">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest backdrop-blur-md"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  border: `1px solid ${theme?.accent || "#FF5A1F"}40`,
                  color: theme?.accent || "#FF5A1F",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{badge}</span>
              </div>
            </div>
          )}

          <h1
            data-gsap="hero-headline"
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight headline-editorial leading-[1.04]"
            style={{ color: "#FFFFFF" }}
          >
            {headline}
          </h1>

          <p
            data-gsap="hero-subheadline"
            className="text-lg sm:text-xl md:text-2xl font-light leading-relaxed max-w-2xl mx-auto text-white/90"
          >
            {subheadline}
          </p>

          <div data-gsap="hero-cta" className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {primaryCta && (
              <a
                href={primaryCta.href || "#"}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium text-sm transition-all duration-300 hover:scale-[1.03] shadow-2xl"
                style={{
                  backgroundColor: theme?.accent || "#FF5A1F",
                  color: theme?.bg || "#0B0D0C",
                }}
              >
                <span className="font-semibold">{primaryCta.label}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href || "#"}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-medium text-sm backdrop-blur-md bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20 text-white"
              >
                <span>{secondaryCta.label}</span>
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 6. ASYMMETRIC / BRUTALIST HERO (Ideal for Cybersecurity, AI Startups, Creative Tech)
  if (layoutVariant === "asymmetric" || layoutVariant === "asymmetric_split") {
    return (
      <section
        ref={containerRef}
        className="relative w-full pt-16 pb-24 md:pt-28 md:pb-36 px-6 md:px-12 lg:px-20 overflow-hidden"
      >
        <div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-20"
          style={{ backgroundColor: theme?.accent || "#FF5A1F" }}
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            {badge && (
              <div data-gsap="hero-badge">
                <div
                  className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md text-xs font-mono uppercase tracking-wider"
                  style={{
                    backgroundColor: `${theme?.surface || "#121514"}`,
                    border: `1px solid ${theme?.accent || "#FF5A1F"}`,
                    color: theme?.accent || "#FF5A1F",
                  }}
                >
                  <span className="w-2 h-2 bg-current animate-ping rounded-full" />
                  <span>{badge}</span>
                </div>
              </div>
            )}

            <h1
              data-gsap="hero-headline"
              className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight headline-editorial leading-[1.05]"
              style={{ color: theme?.text || "#F5F5F0" }}
            >
              {headline}
            </h1>

            <p
              data-gsap="hero-subheadline"
              className="text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-xl"
              style={{ color: theme?.muted || "#8E928F" }}
            >
              {subheadline}
            </p>

            <div data-gsap="hero-cta" className="flex flex-wrap items-center gap-4 pt-4">
              {primaryCta && (
                <a
                  href={primaryCta.href || "#"}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg font-mono text-xs uppercase tracking-wider font-semibold transition-all hover:scale-[1.02] shadow-lg"
                  style={{
                    backgroundColor: theme?.accent || "#FF5A1F",
                    color: theme?.bg || "#0B0D0C",
                  }}
                >
                  <span>{primaryCta.label}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
              {secondaryCta && (
                <a
                  href={secondaryCta.href || "#"}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all hover:bg-white/5 border"
                  style={{
                    borderColor: theme?.border || "#232825",
                    color: theme?.text || "#F5F5F0",
                  }}
                >
                  <span>{secondaryCta.label}</span>
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            {media?.url && (
              <div
                data-gsap="hero-media"
                className="relative rounded-2xl overflow-hidden p-2 border shadow-2xl"
                style={{
                  backgroundColor: theme?.surface || "#121514",
                  borderColor: `${theme?.accent || "#FF5A1F"}40`,
                }}
              >
                <img
                  src={media.url}
                  alt={media.alt || "Visual"}
                  className="w-full h-80 sm:h-96 object-cover rounded-xl"
                />
                {media.caption && (
                  <div className="p-3 text-xs font-mono text-muted flex items-center justify-between border-t border-border mt-2">
                    <span>{media.caption}</span>
                    <span className="text-[10px] uppercase font-mono text-accent">Selected Showcase</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 7. CENTERED TYPOGRAPHY-LED HERO
  if (layoutVariant === "centered" || layoutVariant === "centered_editorial") {
    return (
      <section
        ref={containerRef}
        className="relative w-full pt-20 pb-28 md:pt-32 md:pb-40 px-6 md:px-12 lg:px-20 overflow-hidden text-center"
      >
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] rounded-full blur-[130px] pointer-events-none opacity-20"
          style={{ backgroundColor: theme?.accent || "#FF5A1F" }}
        />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          {badge && (
            <div data-gsap="hero-badge" className="flex justify-center">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${theme?.border || "#232825"}`,
                  color: theme?.accent || "#FF5A1F",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span>{badge}</span>
              </div>
            </div>
          )}

          <h1
            data-gsap="hero-headline"
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight headline-editorial leading-[1.06]"
            style={{ color: theme?.text || "#F5F5F0" }}
          >
            {headline}
          </h1>

          <p
            data-gsap="hero-subheadline"
            className="text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto"
            style={{ color: theme?.muted || "#8E928F" }}
          >
            {subheadline}
          </p>

          <div data-gsap="hero-cta" className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {primaryCta && (
              <a
                href={primaryCta.href || "#"}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium text-sm transition-all duration-300 hover:scale-[1.03] shadow-xl"
                style={{
                  backgroundColor: theme?.accent || "#FF5A1F",
                  color: theme?.bg || "#0B0D0C",
                }}
              >
                <span>{primaryCta.label}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href || "#"}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-medium text-sm transition-all duration-300 hover:bg-white/5 border backdrop-blur-sm"
                style={{
                  borderColor: theme?.border || "#232825",
                  color: theme?.text || "#F5F5F0",
                }}
              >
                <span>{secondaryCta.label}</span>
              </a>
            )}
          </div>

          {media?.url && (
            <div
              data-gsap="hero-media"
              className="mt-16 md:mt-20 relative rounded-2xl overflow-hidden p-2 shadow-2xl"
              style={{
                backgroundColor: theme?.surface || "#121514",
                border: `1px solid ${theme?.border || "#232825"}`,
              }}
            >
              <img
                src={media.url}
                alt={media.alt || "Hero Media"}
                className="w-full h-[360px] sm:h-[480px] md:h-[620px] object-cover rounded-xl"
              />
              {media.caption && (
                <div className="p-3 text-left text-xs font-mono text-muted">
                  {media.caption}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // 8. EDITORIAL SPLIT HERO (Default)
  return (
    <section
      ref={containerRef}
      className="relative w-full pt-16 pb-24 md:pt-28 md:pb-36 px-6 md:px-12 lg:px-20 overflow-hidden"
    >
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ backgroundColor: theme?.accent || "#FF5A1F" }}
      />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          {badge && (
            <div data-gsap="hero-badge">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${theme?.border || "#232825"}`,
                  color: theme?.accent || "#FF5A1F",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span>{badge}</span>
              </div>
            </div>
          )}

          <h1
            data-gsap="hero-headline"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight headline-editorial leading-[1.08]"
            style={{ color: theme?.text || "#F5F5F0" }}
          >
            {headline}
          </h1>

          <p
            data-gsap="hero-subheadline"
            className="text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-xl"
            style={{ color: theme?.muted || "#8E928F" }}
          >
            {subheadline}
          </p>

          <div data-gsap="hero-cta" className="flex flex-wrap items-center gap-4 pt-4">
            {primaryCta && (
              <a
                href={primaryCta.href || "#"}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-medium text-sm transition-all duration-300 hover:scale-[1.03] shadow-lg"
                style={{
                  backgroundColor: theme?.accent || "#FF5A1F",
                  color: theme?.bg || "#0B0D0C",
                }}
              >
                <span>{primaryCta.label}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
            {secondaryCta && (
              <a
                href={secondaryCta.href || "#"}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-medium text-sm transition-all duration-300 hover:bg-white/5"
                style={{
                  border: `1px solid ${theme?.border || "#232825"}`,
                  color: theme?.text || "#F5F5F0",
                }}
              >
                <span>{secondaryCta.label}</span>
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          {media?.url && (
            <div
              data-gsap="hero-media"
              className="relative group rounded-2xl overflow-hidden p-2"
              style={{
                backgroundColor: theme?.surface || "#121514",
                border: `1px solid ${theme?.border || "#232825"}`,
              }}
            >
              <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-xl">
                <img
                  src={media.url}
                  alt={media.alt || "Visual"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {media.caption && (
                <div className="p-3 text-xs font-mono text-muted flex items-center justify-between border-t border-border mt-2">
                  <span>{media.caption}</span>
                  <span className="text-[10px] font-mono text-accent uppercase">Selected Work</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
