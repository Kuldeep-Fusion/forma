"use client";

import { useGsapAnimation, gsapPresets } from "../../lib/motion/gsapAnimations.js";
import { Check, Sparkles } from "lucide-react";

export default function PricingSection({ content, theme, motionPreset = "cinematic" }) {
  const containerRef = useGsapAnimation((ctx, isReduced) => {
    if (containerRef.current) {
      gsapPresets.staggerCards(containerRef.current, "[data-gsap='card']", { isReduced, motionPreset });
    }
  }, [content, motionPreset]);

  if (!content) return null;

  const { sectionTitle, subtitle, billingInterval } = content;
  const plans = Array.isArray(content.plans) && content.plans.length > 0
    ? content.plans
    : Array.isArray(content.tiers) && content.tiers.length > 0
    ? content.tiers
    : Array.isArray(content.items)
    ? content.items
    : [];

  if (plans.length === 0) {
    return null;
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t"
      style={{ borderColor: theme?.border || "#232825" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <span
            className="inline-block text-xs font-mono uppercase tracking-widest mb-4"
            style={{ color: theme?.accent || "#C5FF65" }}
          >
            Investment Tiers
          </span>

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

          {billingInterval && (
            <div className="mt-4">
              <span className="inline-block text-xs font-mono px-3 py-1 rounded-full text-foreground/60 border border-white/10">
                {billingInterval}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              data-gsap="card"
              className={`h-full p-8 sm:p-10 rounded-2xl flex flex-col justify-between relative transition-all duration-300 ${
                plan.isHighlighted ? "shadow-2xl" : ""
              }`}
              style={{
                backgroundColor: theme?.surface || "#121514",
                border: plan.isHighlighted
                  ? `2px solid ${theme?.accent || "#C5FF65"}`
                  : `1px solid ${theme?.border || "#232825"}`,
              }}
            >
              {plan.isHighlighted && (
                <div
                  className="absolute -top-3.5 right-8 px-3 py-1 rounded-full text-[11px] font-mono uppercase font-semibold flex items-center gap-1.5 shadow-md"
                  style={{
                    backgroundColor: theme?.accent || "#C5FF65",
                    color: theme?.bg || "#0B0D0C",
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recommended</span>
                </div>
              )}

              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight" style={{ color: theme?.text || "#F5F5F0" }}>
                  {plan.name}
                </h3>
                <p className="text-sm mb-6" style={{ color: theme?.muted || "#8E928F" }}>
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl sm:text-5xl font-bold font-mono tracking-tight" style={{ color: theme?.text || "#F5F5F0" }}>
                    {plan.price}
                  </span>
                  <span className="text-sm font-mono" style={{ color: theme?.muted || "#8E928F" }}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-sm">
                      <Check
                        className="w-4 h-4 shrink-0 mt-0.5"
                        style={{ color: theme?.accent || "#C5FF65" }}
                      />
                      <span style={{ color: theme?.text || "#F5F5F0" }}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="#form"
                className="w-full py-3.5 px-6 rounded-xl font-medium text-sm text-center transition-all duration-300 block"
                style={{
                  backgroundColor: plan.isHighlighted ? theme?.accent || "#C5FF65" : "transparent",
                  color: plan.isHighlighted ? theme?.bg || "#0B0D0C" : theme?.text || "#F5F5F0",
                  border: plan.isHighlighted ? "none" : `1px solid ${theme?.border || "#232825"}`,
                }}
              >
                {plan.ctaText || "Select Plan"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
