"use client";

import { useState } from "react";
import { useGsapAnimation, gsapPresets } from "../../lib/motion/gsapAnimations.js";
import { ChevronDown } from "lucide-react";

export default function FaqSection({ content, theme, motionPreset = "cinematic" }) {
  const [openIdx, setOpenIdx] = useState(0);

  const containerRef = useGsapAnimation((ctx, isReduced) => {
    if (containerRef.current) {
      gsapPresets.staggerCards(containerRef.current, "[data-gsap='card']", { isReduced, motionPreset });
    }
  }, [content, motionPreset]);

  if (!content) return null;
  const { sectionTitle, subtitle } = content;
  const questions = Array.isArray(content.questions) && content.questions.length > 0
    ? content.questions
    : Array.isArray(content.faqs) && content.faqs.length > 0
    ? content.faqs
    : Array.isArray(content.items)
    ? content.items
    : [];

  if (questions.length === 0) {
    return null;
  }

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section
      ref={containerRef}
      className="w-full py-20 md:py-32 px-6 md:px-12 border-b"
      style={{
        backgroundColor: theme?.bg || "#0B0D0C",
        borderColor: theme?.border || "#232825",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span
            className="text-xs font-mono uppercase tracking-widest mb-3 block"
            style={{ color: theme?.accent || "#C5FF65" }}
          >
            Frequently Asked Questions
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

        <div className="space-y-4">
          {questions.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                data-gsap="card"
                className="rounded-2xl border transition-all duration-200 overflow-hidden"
                style={{
                  backgroundColor: theme?.surface || "#121514",
                  borderColor: isOpen ? theme?.accent || "#C5FF65" : theme?.border || "#232825",
                }}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span
                    className="text-base sm:text-lg font-semibold tracking-tight"
                    style={{ color: theme?.text || "#F5F5F0" }}
                  >
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    style={{ color: isOpen ? theme?.accent || "#C5FF65" : undefined }}
                  />
                </button>

                {isOpen && (
                  <div
                    className="px-6 pb-6 text-sm sm:text-base leading-relaxed border-t pt-4"
                    style={{
                      borderColor: theme?.border || "#232825",
                      color: theme?.muted || "#8E928F",
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
