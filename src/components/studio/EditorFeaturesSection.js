"use client";

import { FadeUp, HoverCard } from "../motion/MotionReveal.js";
import {
  Type,
  ImageIcon,
  LayoutGrid,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  Layers,
  Download,
} from "lucide-react";

const FEATURES = [
  {
    id: "text-editing",
    icon: Type,
    title: "Inline Canvas Editing & AI Copy Refinement",
    category: "Typography & Copy",
    description:
      "Click any headline or paragraph to edit directly on canvas. Rewrite tone for higher conversions with one-click AI refinement prompts.",
    microVisual: (
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F0] border border-[#E9E3DA] space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#737373]">
          <span className="flex items-center gap-1.5 text-[#171717] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
            Inline Text Inspector
          </span>
          <span className="inline-flex items-center gap-1 text-[#FF5A1F] bg-white px-2 py-0.5 rounded border border-[#E9E3DA]">
            <Sparkles className="w-3 h-3" />
            AI Refine
          </span>
        </div>
        <div className="p-3.5 bg-white rounded-xl border border-[#FF5A1F] text-xs font-medium text-[#171717] shadow-xs relative">
          <p className="leading-relaxed">&ldquo;Transform your brand identity into an unforgettable experience.&rdquo;</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E9E3DA]/60 text-[10px] font-mono text-[#737373]">
            <span>Font: Space Grotesk</span>
            <span className="text-emerald-600 font-medium">98% Conversion Score</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "media-replacement",
    icon: ImageIcon,
    title: "Curated Media & Cloudinary Storage",
    category: "Asset Management",
    description:
      "Swap imagery effortlessly with curated sector-specific photography, custom screenshot uploads, and automated image optimization.",
    microVisual: (
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F0] border border-[#E9E3DA] space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#737373]">
          <span className="text-[#171717] font-semibold">Asset Studio</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Retina Ready
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="aspect-video rounded-xl bg-[#E9E3DA] overflow-hidden border-2 border-[#FF5A1F] relative shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=400&q=80"
              alt="Asset 1"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-[#FF5A1F]" />
          </div>
          <div className="aspect-video rounded-xl bg-[#E9E3DA] overflow-hidden opacity-75">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=400&q=80"
              alt="Asset 2"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="aspect-video rounded-xl bg-white border border-dashed border-[#E9E3DA] flex flex-col items-center justify-center text-[10px] font-mono text-[#737373] hover:border-[#FF5A1F] transition-colors">
            <span>+ Upload</span>
            <span className="text-[9px] text-[#737373]/60">PNG, JPG</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "section-customization",
    icon: LayoutGrid,
    title: "Modular Section Hierarchy & Flow",
    category: "Layout Architecture",
    description:
      "Reorganize sections without layout breakage. Switch variants between split heroes, bento grids, and metrics with preserved design tokens.",
    microVisual: (
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F0] border border-[#E9E3DA] space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#737373]">
          <span className="text-[#171717] font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#FF5A1F]" />
            Section Architecture
          </span>
          <span>4 Active Sections</span>
        </div>
        <div className="space-y-1.5 text-xs font-mono">
          <div className="px-3 py-2 rounded-xl bg-white border border-[#FF5A1F] text-[#171717] flex items-center justify-between shadow-xs">
            <span>01. Hero Split (Editorial)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/70 border border-[#E9E3DA] text-[#737373] flex items-center justify-between">
            <span>02. Bento Features Matrix</span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/70 border border-[#E9E3DA] text-[#737373] flex items-center justify-between">
            <span>03. Social Proof & Numbers</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "form-building",
    icon: FileSpreadsheet,
    title: "Custom Form Building & Instant CRM",
    category: "Leads & Conversion",
    description:
      "Capture high-intent leads with customizable forms. Entries stream directly into your project CRM with instant one-click CSV export.",
    microVisual: (
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F0] border border-[#E9E3DA] space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#737373]">
          <span className="text-[#171717] font-semibold">Lead Stream</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Download className="w-3 h-3" />
            CSV Exportable
          </span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-[#E9E3DA] space-y-2 text-xs">
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-1.5 rounded-lg bg-[#FAF7F0] text-[#737373] border border-[#E9E3DA] text-[11px] truncate">
              founder@startup.io
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#FF5A1F] text-white text-[11px] font-medium shrink-0">
              Submit
            </div>
          </div>
          <div className="text-[10px] font-mono text-[#737373] flex items-center justify-between pt-0.5">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Verified & Synced
            </span>
            <span>24 Leads Today</span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function EditorFeaturesSection() {
  return (
    <section id="editor-features" className="w-full py-16 md:py-24 px-4 sm:px-6 md:px-10 bg-[#FAF7F0] border-t border-[#E9E3DA]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-xl mb-12">
          <FadeUp delay={0.1}>
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF5A1F] font-semibold mb-2 block">
              Editor Features
            </span>
          </FadeUp>

          <FadeUp delay={0.2}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#171717] font-display leading-tight mb-3">
              Complete creative control. Zero lock-in.
            </h2>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="text-sm sm:text-base text-[#737373] leading-relaxed">
              Step into an autonomous visual studio engineered for instant iteration, responsive typography tuning, and production code export.
            </p>
          </FadeUp>
        </div>

        {/* 2x2 Bento Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <FadeUp key={feat.id} delay={0.1 * (idx + 1)}>
                <HoverCard
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E9E3DA] shadow-xs hover:border-[#FF5A1F]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full"
                >
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-[#E9E3DA] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#FF5A1F]" />
                      </div>
                      <span className="text-[11px] font-mono text-[#737373] uppercase tracking-wider">
                        {feat.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-[#171717]">
                      {feat.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E9E3DA]/60">
                    {feat.microVisual}
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
