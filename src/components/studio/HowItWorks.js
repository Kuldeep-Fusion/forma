"use client";

import { FadeUp, HoverCard } from "../motion/MotionReveal.js";
import { MessageSquareText, Wand2, Rocket } from "lucide-react";

const STEPS = [
  {
    step: "01",
    name: "Direct & Describe",
    tagline: "Natural Language Prompt",
    icon: MessageSquareText,
    description:
      "Type a concise prompt describing your product, audience, and goals. Optionally attach reference screenshots or visual mockups.",
  },
  {
    step: "02",
    name: "Autonomous Synthesis",
    tagline: "Full-Stack Design System",
    icon: Wand2,
    description:
      "Forma crafts a bespoke color palette, expressive typography hierarchy, responsive bento layouts, and kinetic motion choreography in seconds.",
  },
  {
    step: "03",
    name: "Refine & Deploy",
    tagline: "Visual Studio & Code Export",
    icon: Rocket,
    description:
      "Edit copy inline, swap assets, test interactive forms, and export production-ready React & Tailwind code or share a live 24h preview.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-16 md:py-24 px-4 sm:px-6 md:px-10 bg-[#FAF7F0] border-t border-[#E9E3DA]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-xl mb-12">
          <FadeUp delay={0.1}>
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF5A1F] font-semibold mb-2 block">
              How It Works
            </span>
          </FadeUp>

          <FadeUp delay={0.2}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#171717] font-display leading-tight mb-3">
              From raw thought to live landing page.
            </h2>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="text-sm sm:text-base text-[#737373] leading-relaxed">
              Three streamlined steps engineered to eliminate boilerplate and give every idea the presentation it deserves.
            </p>
          </FadeUp>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, idx) => {
            const IconComponent = s.icon;
            return (
              <FadeUp key={s.step} delay={0.1 * (idx + 1)}>
                <HoverCard
                  className="h-full p-6 sm:p-8 rounded-3xl bg-white border border-[#E9E3DA] shadow-xs flex flex-col justify-between hover:border-[#FF5A1F]/40 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl font-mono font-bold text-[#FF5A1F]">
                        {s.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-[#E9E3DA] flex items-center justify-center text-[#FF5A1F]">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="mb-2">
                      <span className="text-[11px] font-mono text-[#737373] uppercase tracking-wider block mb-1">
                        {s.tagline}
                      </span>
                      <h3 className="text-xl font-bold tracking-tight text-[#171717]">
                        {s.name}
                      </h3>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed text-[#737373] mt-3">
                      {s.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#E9E3DA]/60 flex items-center justify-between text-xs font-mono text-[#737373]">
                    <span>STEP {s.step} / 03</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
                  </div>
                </HoverCard>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
