"use client";

import { useGsapAnimation, gsapPresets } from "../../lib/motion/gsapAnimations.js";
import { Quote } from "lucide-react";

export default function TestimonialsSection({ content, theme, motionPreset = "cinematic" }) {
  const containerRef = useGsapAnimation((ctx, isReduced) => {
    if (containerRef.current) {
      gsapPresets.staggerCards(containerRef.current, "[data-gsap='card']", { isReduced, motionPreset });
    }
  }, [content, motionPreset]);

  if (!content) return null;

  const { sectionTitle, subtitle } = content;
  const items = Array.isArray(content.items) && content.items.length > 0
    ? content.items
    : Array.isArray(content.testimonials) && content.testimonials.length > 0
    ? content.testimonials
    : [];

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t"
      style={{ borderColor: theme?.border || "#232825" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <span
            className="inline-block text-xs font-mono uppercase tracking-widest mb-4"
            style={{ color: theme?.accent || "#C5FF65" }}
          >
            Client Perspectives
          </span>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight headline-editorial leading-tight mb-4"
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
          {items.map((item, index) => (
            <div
              key={index}
              data-gsap="card"
              className="relative p-8 md:p-10 rounded-2xl flex flex-col justify-between h-full border"
              style={{
                backgroundColor: theme?.surface || "#121514",
                borderColor: theme?.border || "#232825",
              }}
            >
              <div>
                <Quote
                  className="w-10 h-10 mb-6 opacity-30"
                  style={{ color: theme?.accent || "#C5FF65" }}
                />

                <p
                  className="text-lg sm:text-xl md:text-2xl font-light italic leading-relaxed mb-8"
                  style={{ color: theme?.text || "#F5F5F0" }}
                >
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div
                className="pt-6 border-t flex flex-wrap items-center justify-between gap-4"
                style={{ borderColor: theme?.border || "#232825" }}
              >
                <div>
                  <h4 className="font-semibold text-base" style={{ color: theme?.text || "#F5F5F0" }}>
                    {item.author}
                  </h4>
                  <p className="text-xs font-mono" style={{ color: theme?.muted || "#8E928F" }}>
                    {item.role} {item.company ? `— ${item.company}` : ""}
                  </p>
                </div>

                {item.metric && (
                  <div
                    className="px-3 py-1.5 rounded-full text-xs font-mono font-medium"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      border: `1px solid ${theme?.border || "#232825"}`,
                      color: theme?.accent || "#C5FF65",
                    }}
                  >
                    {item.metric}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
