"use client";

import { useState } from "react";
import { FadeUp, BlurReveal, TextReveal, HoverCard } from "../motion/MotionReveal.js";
import { Play, RotateCcw, Sparkles, MoveUp, Eye, Type, MousePointer } from "lucide-react";

export default function MotionShowcase() {
  const [fadeUpKey, setFadeUpKey] = useState(0);
  const [blurKey, setBlurKey] = useState(0);
  const [textKey, setTextKey] = useState(0);

  return (
    <section id="motion-showcase" className="relative w-full py-24 md:py-32 px-6 md:px-12 lg:px-20 border-t border-border-subtle bg-surface/30">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16">
          <FadeUp delay={0.1}>
            <span className="text-xs font-mono uppercase tracking-widest text-accent mb-3 block">
              Motion Choreography Lab
            </span>
          </FadeUp>

          <FadeUp delay={0.2}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight headline-editorial leading-tight text-foreground mb-4">
              Motion with purpose, not decoration.
            </h2>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="text-base sm:text-lg text-muted">
              Explore the four core animation presets generated across Forma landing pages. Every preset automatically respects reduced-motion accessibility standards.
            </p>
          </FadeUp>
        </div>

        {/* 4 Interactive Motion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 1. Fade-Up Entrance */}
          <div className="p-8 rounded-3xl bg-surface border border-border flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-accent">
                    <MoveUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-mono text-sm uppercase font-semibold text-foreground">
                    01 // Fade-Up Entrance
                  </h3>
                </div>

                <button
                  onClick={() => setFadeUpKey((k) => k + 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/5 hover:bg-white/10 text-muted hover:text-foreground transition-colors border border-white/5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Replay</span>
                </button>
              </div>

              <p className="text-sm text-muted mb-8">
                Smooth vertical translation with cubic bezier easing [0.22, 1, 0.36, 1].
              </p>

              <div className="h-36 rounded-2xl bg-background/80 border border-border flex items-center justify-center p-6">
                <FadeUp key={fadeUpKey} distance={28} duration={0.8} once={false}>
                  <div className="p-4 rounded-xl bg-surface border border-accent/40 shadow-lg text-center">
                    <span className="text-xs font-mono text-accent block font-medium">
                      Eased Spatial Transition
                    </span>
                    <span className="text-xs text-muted">
                      Offset 28px → 0px • Easing cubic-bezier
                    </span>
                  </div>
                </FadeUp>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-muted">
              <span>Duration: 0.7s</span>
              <span>Accessibility: Clean Opacity Fallback</span>
            </div>
          </div>

          {/* 2. Blur Reveal */}
          <div className="p-8 rounded-3xl bg-surface border border-border flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-accent">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h3 className="font-mono text-sm uppercase font-semibold text-foreground">
                    02 // Blur Reveal
                  </h3>
                </div>

                <button
                  onClick={() => setBlurKey((k) => k + 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/5 hover:bg-white/10 text-muted hover:text-foreground transition-colors border border-white/5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Replay</span>
                </button>
              </div>

              <p className="text-sm text-muted mb-8">
                Cinematic depth-of-field transition from optical 12px blur into crisp focus.
              </p>

              <div className="h-36 rounded-2xl bg-background/80 border border-border flex items-center justify-center p-6">
                <BlurReveal key={blurKey} duration={1.0} once={false}>
                  <div className="p-4 rounded-xl bg-accent/15 border border-accent/40 text-center">
                    <span className="text-xs font-mono text-accent block font-semibold">
                      Optical Focus Shift
                    </span>
                    <span className="text-xs text-foreground/80">
                      Filter blur(12px) → blur(0px)
                    </span>
                  </div>
                </BlurReveal>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-muted">
              <span>Duration: 0.9s</span>
              <span>Curve: [0.16, 1, 0.3, 1]</span>
            </div>
          </div>

          {/* 3. Text Reveal */}
          <div className="p-8 rounded-3xl bg-surface border border-border flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-accent">
                    <Type className="w-4 h-4" />
                  </div>
                  <h3 className="font-mono text-sm uppercase font-semibold text-foreground">
                    03 // Text Reveal
                  </h3>
                </div>

                <button
                  onClick={() => setTextKey((k) => k + 1)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/5 hover:bg-white/10 text-muted hover:text-foreground transition-colors border border-white/5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Replay</span>
                </button>
              </div>

              <p className="text-sm text-muted mb-8">
                Staggered word decomposition delivering theatrical headline impact.
              </p>

              <div className="h-36 rounded-2xl bg-background/80 border border-border flex items-center justify-center p-6 text-center">
                <TextReveal
                  key={textKey}
                  text="Typography in motion commands attention."
                  className="text-xl sm:text-2xl font-bold headline-editorial text-foreground"
                  delay={0.1}
                  stagger={0.06}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-muted">
              <span>Stagger: 0.05s / Word</span>
              <span>Micro-blur: 4px</span>
            </div>
          </div>

          {/* 4. Hover Interaction */}
          <div className="p-8 rounded-3xl bg-surface border border-border flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-accent">
                    <MousePointer className="w-4 h-4" />
                  </div>
                  <h3 className="font-mono text-sm uppercase font-semibold text-foreground">
                    04 // Hover Interaction
                  </h3>
                </div>

                <span className="text-xs font-mono text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                  Interactive
                </span>
              </div>

              <p className="text-sm text-muted mb-8">
                Physics-based tactile lift and micro-tilt responding to cursor state.
              </p>

              <div className="h-36 rounded-2xl bg-background/80 border border-border flex items-center justify-center p-6">
                <HoverCard className="p-4 rounded-xl bg-surface border border-white/10 hover:border-accent cursor-pointer text-center shadow-lg">
                  <span className="text-xs font-mono text-accent block font-medium">
                    Hover Over Me
                  </span>
                  <span className="text-xs text-muted">
                    y: -4px • scale: 1.02 • 300ms easeOut
                  </span>
                </HoverCard>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-mono text-muted">
              <span>Response: 250ms</span>
              <span>Tap Scale: 0.99</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
