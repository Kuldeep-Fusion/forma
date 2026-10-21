"use client";

import { useState } from "react";
import Header from "../../components/layout/Header.js";
import PageRenderer from "../../components/renderer/PageRenderer.js";
import { generateMockLandingPage } from "../../lib/ai/mockGenerator.js";
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Code2,
  Sparkles,
  Palette,
  Layers,
} from "lucide-react";

const DEMO_PRESETS = [
  { label: "Spatial Tech (Aether OS)", prompt: "Aether OS spatial computing headset", dir: "futuristic", theme: "electric_blue" },
  { label: "Acoustic Synthesizer (Resonance)", prompt: "Resonance algorithmic acoustic engine", dir: "experimental", theme: "ai_suggested" },
  { label: "Design Atelier (Forma)", prompt: "Atelier Forma sovereign architectural systems", dir: "editorial", theme: "forest_green" },
  { label: "Brutalist Objects", prompt: "Monolith objects brutalist timepieces", dir: "minimal", theme: "monochrome" },
];

export default function CreateStudioPage() {
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [viewport, setViewport] = useState("desktop"); // desktop | tablet | mobile
  const [showJson, setShowJson] = useState(false);

  const initialPreset = DEMO_PRESETS[activePresetIndex];
  const [pageConfig, setPageConfig] = useState(() =>
    generateMockLandingPage({
      prompt: initialPreset.prompt,
      direction: initialPreset.dir,
      themePreference: initialPreset.theme,
      motionStyle: "cinematic",
    })
  );

  const switchPreset = (index) => {
    setActivePresetIndex(index);
    const p = DEMO_PRESETS[index];
    const newConfig = generateMockLandingPage({
      prompt: p.prompt,
      direction: p.dir,
      themePreference: p.theme,
      motionStyle: "cinematic",
    });
    setPageConfig(newConfig);
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[390px]";
      case "tablet":
        return "max-w-[768px]";
      default:
        return "w-full";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      {/* Control Studio Bar */}
      <div className="sticky top-16 md:top-20 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-border px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted uppercase">Archetype:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {DEMO_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => switchPreset(idx)}
                className={`text-xs font-mono px-3 py-1.5 rounded-lg transition-all ${
                  activePresetIndex === idx
                    ? "bg-accent text-background font-semibold"
                    : "bg-white/5 text-muted hover:text-foreground hover:bg-white/10"
                }`}
              >
                {p.label.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Viewport Toggles and JSON Inspector */}
        <div className="flex items-center gap-3">
          {/* Responsive Viewport Switchers */}
          <div className="flex items-center bg-background/80 p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewport("desktop")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === "desktop" ? "bg-white/10 text-accent" : "text-muted hover:text-foreground"
              }`}
              title="Desktop View (100%)"
              aria-label="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === "tablet" ? "bg-white/10 text-accent" : "text-muted hover:text-foreground"
              }`}
              title="Tablet View (768px)"
              aria-label="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === "mobile" ? "bg-white/10 text-accent" : "text-muted hover:text-foreground"
              }`}
              title="Mobile View (390px)"
              aria-label="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Toggle JSON Schema */}
          <button
            onClick={() => setShowJson(!showJson)}
            className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted hover:text-foreground border border-white/5"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showJson ? "Rendered Canvas" : "JSON Schema"}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 p-4 md:p-8 flex justify-center items-start bg-black/40">
        <div
          className={`transition-all duration-300 ${getViewportWidth()} ${
            viewport !== "desktop"
              ? "rounded-3xl overflow-hidden border-4 border-surface shadow-2xl my-4"
              : "w-full"
          }`}
        >
          {showJson ? (
            <div className="p-8 rounded-2xl bg-surface border border-border">
              <h3 className="font-mono text-sm text-accent mb-4">
                Active Schema Payload (Zod Validated)
              </h3>
              <pre className="text-xs font-mono text-foreground/80 overflow-x-auto leading-relaxed p-4 bg-background rounded-xl">
                {JSON.stringify(pageConfig, null, 2)}
              </pre>
            </div>
          ) : (
            <PageRenderer pageConfig={pageConfig} />
          )}
        </div>
      </div>
    </div>
  );
}
