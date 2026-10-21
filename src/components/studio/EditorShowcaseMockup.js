"use client";

import { useState } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Undo2,
  Redo2,
  Share2,
  Download,
  SlidersHorizontal,
  Check,
  Eye,
  MousePointer,
  ChevronRight,
  Layers,
  Palette,
  Type,
} from "lucide-react";

export default function EditorShowcaseMockup() {
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [activeTab, setActiveTab] = useState("content");

  return (
    <div className="w-full max-w-6xl mx-auto pt-4 pb-12 px-4 sm:px-6">
      {/* Editor Window Container */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-white border border-[#E9E3DA] shadow-[0_30px_70px_-20px_rgba(23,23,23,0.1)] overflow-hidden transition-all duration-300">
        
        {/* 1. Miniature Top Toolbar */}
        <div className="h-14 sm:h-16 px-4 sm:px-6 bg-[#FAF7F0] border-b border-[#E9E3DA] flex items-center justify-between gap-4">
          {/* Left: Window Controls & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#E9E3DA]" />
              <span className="w-3 h-3 rounded-full bg-[#E9E3DA]" />
              <span className="w-3 h-3 rounded-full bg-[#E9E3DA]" />
            </div>
            <div className="h-4 w-px bg-[#E9E3DA] hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#171717] font-mono">
                Aura Studio
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-[#737373] border border-[#E9E3DA] hidden md:inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Editor
              </span>
            </div>
          </div>

          {/* Center: Device Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-white border border-[#E9E3DA]">
            <button
              onClick={() => setActiveDevice("desktop")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeDevice === "desktop"
                  ? "bg-[#FAF7F0] text-[#171717] shadow-xs"
                  : "text-[#737373] hover:text-[#171717]"
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveDevice("tablet")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeDevice === "tablet"
                  ? "bg-[#FAF7F0] text-[#171717] shadow-xs"
                  : "text-[#737373] hover:text-[#171717]"
              }`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveDevice("mobile")}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeDevice === "mobile"
                  ? "bg-[#FAF7F0] text-[#171717] shadow-xs"
                  : "text-[#737373] hover:text-[#171717]"
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1">
              <button
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-white transition-colors"
                title="Undo"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-white transition-colors"
                title="Redo"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-4 w-px bg-[#E9E3DA] hidden sm:block" />

            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E9E3DA] text-xs font-medium text-[#171717] hover:border-[#FF5A1F] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span className="hidden sm:inline">AI Refine</span>
            </button>

            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF5A1F] text-white text-xs font-medium hover:bg-[#E44A12] transition-colors shadow-xs"
            >
              <span>Publish</span>
            </button>
          </div>
        </div>

        {/* 2. Contextual Inspector Breadcrumb */}
        <div className="px-4 sm:px-6 py-2 bg-white border-b border-[#E9E3DA] flex items-center justify-between text-xs font-mono text-[#737373] overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hover:text-[#171717] cursor-pointer">HeroSection</span>
            <ChevronRight className="w-3 h-3 text-[#E9E3DA]" />
            <span className="hover:text-[#171717] cursor-pointer">ContentGrid</span>
            <ChevronRight className="w-3 h-3 text-[#E9E3DA]" />
            <span className="text-[#FF5A1F] font-semibold">H1.headline-expressive</span>
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#E9E3DA] text-[11px] text-[#171717]">
              <Type className="w-3 h-3 text-[#FF5A1F]" />
              Space Grotesk • 64px
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#E9E3DA] text-[11px] text-[#171717]">
              <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
              Hot Orange Accent
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#E9E3DA] text-[11px] text-[#737373]">
              GSAP ScrollTrigger: Active
            </span>
          </div>
        </div>

        {/* 3. Editor Canvas Area */}
        <div className="bg-[#FAF7F0]/40 p-4 sm:p-8 flex justify-center min-h-[460px] sm:min-h-[540px]">
          {/* Dynamic Responsive Frame */}
          <div
            className={`w-full bg-white rounded-2xl border border-[#E9E3DA] shadow-sm overflow-hidden transition-all duration-300 relative flex flex-col justify-between ${
              activeDevice === "desktop"
                ? "max-w-5xl"
                : activeDevice === "tablet"
                ? "max-w-2xl"
                : "max-w-sm"
            }`}
          >
            {/* Mock Page Topbar */}
            <div className="h-14 px-6 border-b border-[#FAF7F0] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#171717] flex items-center justify-center text-white text-[10px] font-mono font-bold">
                  A
                </div>
                <span className="text-sm font-bold tracking-tight text-[#171717]">
                  Aura Studio
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-xs text-[#737373] font-medium">
                <span className="text-[#171717]">Works</span>
                <span>Services</span>
                <span>Philosophy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#171717] text-white">
                  Contact
                </span>
              </div>
            </div>

            {/* Mock Page Hero Section with Live Contextual Inspector */}
            <div className="p-6 sm:p-12 relative flex-1 flex flex-col justify-center">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7F0] border border-[#E9E3DA] text-xs font-mono text-[#737373] mb-5 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
                ARCHITECTURAL IDENTITIES
              </div>

              {/* Active Selected Headline with Orange Editor Focus Frame */}
              <div className="relative group max-w-2xl">
                {/* Visual Selection Ring */}
                <div className="absolute -inset-2.5 rounded-xl border-2 border-[#FF5A1F] bg-[#FF5A1F]/[0.02] pointer-events-none transition-all">
                  {/* Selection handles */}
                  <span className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#FF5A1F]" />
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#FF5A1F]" />
                  <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#FF5A1F]" />
                  <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#FF5A1F]" />
                </div>

                {/* Floating Contextual Toolbar Widget */}
                <div className="absolute -top-12 left-0 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#171717] text-white text-xs shadow-lg animate-in fade-in duration-150">
                  <span className="font-medium text-white/90">Edit Headline</span>
                  <div className="w-px h-3 bg-white/20" />
                  <button className="text-[11px] text-white/70 hover:text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#FF5A1F]" />
                    AI Rewrite
                  </button>
                  <div className="w-px h-3 bg-white/20" />
                  <span className="text-[10px] font-mono text-[#FF5A1F]">Space Grotesk 700</span>
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#171717] leading-[1.1] relative z-10">
                  Crafting digital experiences that{" "}
                  <span className="text-[#FF5A1F]">command reverence.</span>
                </h1>
              </div>

              {/* Supporting Copy */}
              <p className="text-sm sm:text-base text-[#737373] max-w-xl mt-6 leading-relaxed">
                Transform complex engineering narratives into visceral, conversion-tuned digital identities. Designed with mathematical rhythm and kinetic fluidity.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 mt-8">
                <button className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#FF5A1F] text-white shadow-sm flex items-center gap-2">
                  <span>Explore Cases</span>
                </button>
                <button className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-white border border-[#E9E3DA] text-[#171717]">
                  <span>Philosophy</span>
                </button>
              </div>

              {/* Floating Contextual Inspector Chip (Right) */}
              <div className="hidden lg:flex absolute right-8 top-12 flex-col gap-2 p-3.5 rounded-2xl bg-white border border-[#E9E3DA] shadow-md w-52">
                <div className="flex items-center justify-between pb-2 border-b border-[#FAF7F0]">
                  <span className="text-[11px] font-semibold text-[#171717]">Inspector</span>
                  <span className="text-[10px] font-mono text-[#FF5A1F] bg-[#FAF7F0] px-1.5 py-0.5 rounded border border-[#E9E3DA]">
                    Active
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-[#737373]">
                    <span>Typography</span>
                    <span className="font-mono text-[#171717]">Display H1</span>
                  </div>
                  <div className="flex justify-between text-[#737373]">
                    <span>Motion</span>
                    <span className="font-mono text-[#171717]">Stagger (0.2s)</span>
                  </div>
                  <div className="flex justify-between text-[#737373]">
                    <span>Responsive</span>
                    <span className="font-mono text-emerald-600">Adaptive</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Bottom Metrics Bar */}
            <div className="px-6 sm:px-12 py-4 bg-[#FAF7F0]/60 border-t border-[#E9E3DA] flex items-center justify-between text-xs font-mono text-[#737373]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Production HTML / React / Tailwind Ready</span>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <span>Viewport: {activeDevice.toUpperCase()}</span>
                <span>GSAP v3.15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
