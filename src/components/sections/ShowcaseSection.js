"use client";

import { useGsapAnimation, gsapPresets } from "../../lib/motion/gsapAnimations.js";
import { HoverCard } from "../motion/MotionReveal.js";
import { ArrowUpRight, MapPin, Utensils, Home, BookOpen, Clock, BarChart3 } from "lucide-react";

export default function ShowcaseSection({ content, theme, motionPreset = "cinematic" }) {
  const containerRef = useGsapAnimation((ctx, isReduced) => {
    if (containerRef.current) {
      gsapPresets.staggerCards(containerRef.current, "[data-gsap='card']", { isReduced, motionPreset });
    }
  }, [content, motionPreset]);

  if (!content) return null;

  const { sectionTitle, subtitle, tag, items = [], layoutVariant = "cards" } = content;

  // Defensive Guard: Never render empty section headings without content
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  // 1. EDUCATION CURRICULUM SHOWCASE (Ideal for Coding Platforms & Online Courses)
  if (layoutVariant === "curriculum" || layoutVariant === "syllabus") {
    return (
      <section
        ref={containerRef}
        className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t"
        style={{ borderColor: theme?.border || "#232825" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20">
            <div className="max-w-2xl">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest mb-3"
                style={{ color: theme?.accent || "#C5FF65" }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{tag || "Interactive Curriculum"}</span>
              </span>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight headline-editorial leading-tight"
                style={{ color: theme?.text || "#F5F5F0" }}
              >
                {sectionTitle}
              </h2>
            </div>
            {subtitle && (
              <p className="mt-4 md:mt-0 text-sm sm:text-base leading-relaxed max-w-md" style={{ color: theme?.muted || "#8E928F" }}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((mod, idx) => (
              <div
                key={idx}
                data-gsap="card"
                className="rounded-3xl p-8 border flex flex-col justify-between"
                style={{
                  backgroundColor: theme?.surface || "#121514",
                  borderColor: theme?.border || "#232825",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono text-muted uppercase">MODULE 0{idx + 1}</span>
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-white/5 border border-white/10"
                      style={{ color: theme?.accent || "#C5FF65" }}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{mod.badge || mod.category || "4 Weeks"}</span>
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: theme?.text || "#F5F5F0" }}>
                    {mod.title}
                  </h3>

                  <p className="text-sm leading-relaxed mb-6" style={{ color: theme?.muted || "#8E928F" }}>
                    {mod.description}
                  </p>
                </div>

                <div
                  className="pt-6 border-t flex items-center justify-between text-xs font-mono"
                  style={{ borderColor: theme?.border || "#232825" }}
                >
                  <span className="text-muted">{mod.price || "Live Mentorship"}</span>
                  <a href="#enroll" className="text-accent flex items-center gap-1 hover:underline font-semibold">
                    <span>Syllabus</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 2. B2B / ENTERPRISE OUTCOMES SHOWCASE
  if (layoutVariant === "metrics" || layoutVariant === "outcomes") {
    return (
      <section
        ref={containerRef}
        className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t"
        style={{ borderColor: theme?.border || "#232825" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest mb-3"
              style={{ color: theme?.accent || "#C5FF65" }}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{tag || "Quantified Enterprise Impact"}</span>
            </span>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight headline-editorial mb-4"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((item, idx) => (
              <div
                key={idx}
                data-gsap="card"
                className="p-8 rounded-3xl border flex flex-col justify-between"
                style={{
                  backgroundColor: theme?.surface || "#121514",
                  borderColor: theme?.border || "#232825",
                }}
              >
                <div>
                  <span
                    className="text-4xl sm:text-5xl font-mono font-bold block mb-4"
                    style={{ color: theme?.accent || "#C5FF65" }}
                  >
                    {item.price || item.badge || `9${idx} %`}
                  </span>
                  <h3 className="text-xl font-bold mb-3" style={{ color: theme?.text || "#F5F5F0" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: theme?.muted || "#8E928F" }}>
                    {item.description}
                  </p>
                </div>
                <div
                  className="pt-6 mt-8 border-t flex items-center justify-between text-xs font-mono text-muted"
                  style={{ borderColor: theme?.border || "#232825" }}
                >
                  <span>{item.category || "Verified Client Case"}</span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme?.accent || "#C5FF65" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 3. CULINARY MENU SHOWCASE (Restaurants & Hospitality)
  if (layoutVariant === "menu") {
    return (
      <section
        ref={containerRef}
        className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t"
        style={{ borderColor: theme?.border || "#232825" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <span
              className="text-xs font-mono uppercase tracking-widest mb-3 flex items-center justify-center gap-1.5"
              style={{ color: theme?.accent || "#C5FF65" }}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>{tag || "Seasonal Tasting Menu"}</span>
            </span>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {items.map((item, idx) => (
              <div
                key={idx}
                data-gsap="card"
                className="p-6 rounded-2xl border flex flex-col justify-between"
                style={{
                  backgroundColor: theme?.surface || "#121514",
                  borderColor: theme?.border || "#232825",
                }}
              >
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-xl font-bold" style={{ color: theme?.text || "#F5F5F0" }}>
                      {item.title}
                    </h3>
                    {item.price && (
                      <span className="text-lg font-mono font-bold text-accent">
                        {item.price}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: theme?.muted || "#8E928F" }}>
                    {item.description}
                  </p>
                </div>

                <div
                  className="pt-4 border-t flex items-center justify-between text-xs font-mono text-muted"
                  style={{ borderColor: theme?.border || "#232825" }}
                >
                  <span>{item.category || "Signature Dish"}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-accent/10 text-accent font-semibold">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 4. LUXURY REAL ESTATE PROPERTIES SHOWCASE
  if (layoutVariant === "properties") {
    return (
      <section
        ref={containerRef}
        className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t"
        style={{ borderColor: theme?.border || "#232825" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div className="max-w-2xl">
              <span
                className="text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-1.5"
                style={{ color: theme?.accent || "#C5FF65" }}
              >
                <Home className="w-3.5 h-3.5" />
                <span>{tag || "Exclusive Residences"}</span>
              </span>
              <h2
                className="text-3xl sm:text-5xl font-bold tracking-tight headline-editorial leading-tight"
                style={{ color: theme?.text || "#F5F5F0" }}
              >
                {sectionTitle}
              </h2>
            </div>
            {subtitle && (
              <p className="mt-4 md:mt-0 text-sm sm:text-base leading-relaxed max-w-md" style={{ color: theme?.muted || "#8E928F" }}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, idx) => (
              <div
                key={idx}
                data-gsap="card"
                className="rounded-3xl overflow-hidden border flex flex-col justify-between"
                style={{
                  backgroundColor: theme?.surface || "#121514",
                  borderColor: theme?.border || "#232825",
                }}
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  {item.price && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-black/70 backdrop-blur-md text-white border border-white/10">
                      {item.price}
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-mono text-white/90 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full">
                    <MapPin className="w-3 h-3 text-accent" />
                    <span>{item.category || "Prime Location"}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: theme?.text || "#F5F5F0" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: theme?.muted || "#8E928F" }}>
                    {item.description}
                  </p>

                  <div
                    className="pt-4 border-t flex items-center justify-between text-xs font-mono"
                    style={{ borderColor: theme?.border || "#232825" }}
                  >
                    <span className="text-muted">{item.badge || "Private Tour Available"}</span>
                    <a href="#form" className="text-accent flex items-center gap-1 hover:underline">
                      <span>Inquire</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 5. STANDARD / PORTFOLIO VISUAL CARDS (Default)
  return (
    <section
      ref={containerRef}
      className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t"
      style={{ borderColor: theme?.border || "#232825" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20">
          <div className="max-w-2xl">
            <span
              className="inline-block text-xs font-mono uppercase tracking-widest mb-4"
              style={{ color: theme?.accent || "#C5FF65" }}
            >
              {tag || "Visual Archives"}
            </span>

            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight headline-editorial leading-tight"
              style={{ color: theme?.text || "#F5F5F0" }}
            >
              {sectionTitle}
            </h2>
          </div>

          {subtitle && (
            <p
              className="mt-4 md:mt-0 max-w-md text-sm sm:text-base leading-relaxed"
              style={{ color: theme?.muted || "#8E928F" }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {items.map((item, index) => (
            <div
              key={index}
              data-gsap="card"
              className="group relative rounded-2xl overflow-hidden p-2.5 transition-all duration-300 border"
              style={{
                backgroundColor: theme?.surface || "#121514",
                borderColor: theme?.border || "#232825",
              }}
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="text-xs font-mono px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md bg-black/50 text-white border border-white/10">
                    {item.category || "Exhibition"}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <h3
                  className="text-xl font-bold mb-2 tracking-tight"
                  style={{ color: theme?.text || "#F5F5F0" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: theme?.muted || "#8E928F" }}
                >
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
