"use client";

import { FadeUp, BlurReveal } from "../motion/MotionReveal.js";
import { Play } from "lucide-react";
import { useState } from "react";

export default function VideoShowcaseSection({ content, theme }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!content) return null;
  const { sectionTitle, subtitle, videoUrl, posterUrl, caption } = content;

  return (
    <section
      className="w-full py-20 md:py-32 px-6 md:px-12 border-b"
      style={{
        backgroundColor: theme?.surface || "#121514",
        borderColor: theme?.border || "#232825",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <FadeUp delay={0.1}>
            <span
              className="text-xs font-mono uppercase tracking-widest mb-3 block"
              style={{ color: theme?.accent || "#C5FF65" }}
            >
              Motion Showcase
            </span>
          </FadeUp>
          <FadeUp delay={0.2}>
            <h2
              className="text-3xl sm:text-5xl font-bold tracking-tight headline-editorial mb-4"
              style={{ color: theme?.text || "#F5F5F0" }}
            >
              {sectionTitle}
            </h2>
          </FadeUp>
          {subtitle && (
            <FadeUp delay={0.3}>
              <p className="text-base" style={{ color: theme?.muted || "#8E928F" }}>
                {subtitle}
              </p>
            </FadeUp>
          )}
        </div>

        <BlurReveal delay={0.4} className="max-w-5xl mx-auto">
          <div
            className="relative rounded-3xl overflow-hidden aspect-video border shadow-2xl p-2 group"
            style={{
              backgroundColor: theme?.bg || "#0B0D0C",
              borderColor: theme?.border || "#232825",
            }}
          >
            {isPlaying ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <img
                  src={
                    posterUrl ||
                    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80"
                  }
                  alt={sectionTitle}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl cursor-pointer"
                    style={{
                      backgroundColor: theme?.accent || "#C5FF65",
                      color: theme?.bg || "#0B0D0C",
                    }}
                    aria-label="Play video showcase"
                  >
                    <Play className="w-7 h-7 ml-1 fill-current" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {caption && (
            <p className="text-center text-xs font-mono text-muted mt-4">
              {caption}
            </p>
          )}
        </BlurReveal>
      </div>
    </section>
  );
}
