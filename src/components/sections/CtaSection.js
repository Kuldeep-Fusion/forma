"use client";

import { useState } from "react";
import { FadeUp } from "../motion/MotionReveal.js";
import { ArrowRight, Calendar, Users, Clock, Check } from "lucide-react";

export default function CtaSection({ content, theme }) {
  const [submitted, setSubmitted] = useState(false);

  if (!content) return null;

  const {
    headline,
    subheadline,
    buttonText,
    buttonHref = "#",
    secondaryText,
    layoutVariant = "banner",
  } = content;

  // 1. RESERVATION / VIP BOOKING FORM CTA (Ideal for Restaurants, Real Estate Tours, Private Consultations)
  if (layoutVariant === "reservation") {
    return (
      <section className="relative w-full py-24 md:py-36 px-6 md:px-12 lg:px-20 overflow-hidden border-t" style={{ borderColor: theme?.border || "#232825" }}>
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-20"
          style={{ backgroundColor: theme?.accent || "#C5FF65" }}
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <FadeUp delay={0.1}>
              <span className="text-xs font-mono uppercase tracking-widest text-accent mb-3 block">
                Exclusive Bookings
              </span>
              <h2
                className="text-3xl sm:text-5xl font-bold tracking-tight headline-editorial mb-4"
                style={{ color: theme?.text || "#F5F5F0" }}
              >
                {headline}
              </h2>
              <p
                className="text-base sm:text-lg max-w-xl mx-auto"
                style={{ color: theme?.muted || "#8E928F" }}
              >
                {subheadline}
              </p>
            </FadeUp>
          </div>

          <FadeUp delay={0.3}>
            <div
              className="p-8 sm:p-10 rounded-3xl border shadow-2xl backdrop-blur-md"
              style={{
                backgroundColor: theme?.surface || "#121514",
                borderColor: `${theme?.accent || "#C5FF65"}40`,
              }}
            >
              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: theme?.text || "#F5F5F0" }}>
                    Inquiry Confirmed
                  </h3>
                  <p className="text-xs font-mono text-muted max-w-sm mx-auto">
                    Our concierge will reach out via priority dispatch to finalize your reservation details.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-muted flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-accent" />
                        <span>Date Preference</span>
                      </label>
                      <input
                        type="date"
                        defaultValue="2026-10-25"
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-muted flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-accent" />
                        <span>Guests / Party</span>
                      </label>
                      <select className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent">
                        <option>2 Guests</option>
                        <option>4 Guests</option>
                        <option>6 Guests</option>
                        <option>Private Dining / Salon</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono uppercase text-muted flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>Time Window</span>
                      </label>
                      <select className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-accent">
                        <option>7:00 PM - Evening</option>
                        <option>8:30 PM - Prime</option>
                        <option>1:00 PM - Luncheon</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-[1.01] shadow-xl flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: theme?.accent || "#C5FF65",
                      color: theme?.bg || "#0B0D0C",
                    }}
                  >
                    <span>{buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </FadeUp>
        </div>
      </section>
    );
  }

  // 2. MINIMAL ASYMMETRIC SPLIT CTA (Ideal for editorial, design agencies, luxury brands)
  if (layoutVariant === "minimal_split" || layoutVariant === "split") {
    return (
      <section
        className="relative w-full py-24 md:py-36 px-6 md:px-12 lg:px-20 border-t overflow-hidden"
        style={{
          backgroundColor: theme?.surface || "#121514",
          borderColor: theme?.border || "#232825",
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span
              className="text-xs font-mono uppercase tracking-widest block"
              style={{ color: theme?.accent || "#FF5A1F" }}
            >
              Initiation
            </span>
            <h2
              className="text-4xl sm:text-6xl font-bold tracking-tight headline-editorial leading-[1.05]"
              style={{ color: theme?.text || "#F5F5F0" }}
            >
              {headline}
            </h2>
            {subheadline && (
              <p className="text-base sm:text-lg leading-relaxed max-w-2xl" style={{ color: theme?.muted || "#8E928F" }}>
                {subheadline}
              </p>
            )}
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 items-start lg:items-end justify-center">
            <a
              href={buttonHref}
              className="w-full sm:w-auto lg:w-full inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full font-medium text-base transition-all duration-300 hover:scale-[1.02] shadow-xl text-center"
              style={{
                backgroundColor: theme?.accent || "#FF5A1F",
                color: theme?.bg || "#0B0D0C",
              }}
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            {secondaryText && (
              <p className="text-xs font-mono text-muted text-center lg:text-right w-full">
                {secondaryText}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 3. STANDARD AMBIENT GLOW BANNER (Default)
  return (
    <section className="relative w-full py-24 md:py-36 px-6 md:px-12 lg:px-20 overflow-hidden border-t" style={{ borderColor: theme?.border || "#232825" }}>
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: theme?.accent || "#C5FF65" }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <FadeUp delay={0.1}>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight headline-editorial leading-[1.08] mb-6"
            style={{ color: theme?.text || "#F5F5F0" }}
          >
            {headline}
          </h2>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p
            className="text-lg sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto mb-10"
            style={{ color: theme?.muted || "#8E928F" }}
          >
            {subheadline}
          </p>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={buttonHref}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full font-medium text-base transition-all duration-300 hover:scale-[1.03] shadow-xl"
              style={{
                backgroundColor: theme?.accent || "#C5FF65",
                color: theme?.bg || "#0B0D0C",
              }}
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {secondaryText && (
            <p className="mt-4 text-xs font-mono text-muted">
              {secondaryText}
            </p>
          )}
        </FadeUp>
      </div>
    </section>
  );
}
