"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FadeUp } from "../motion/MotionReveal.js";
import PageRenderer from "../renderer/PageRenderer.js";
import {
  Sparkles,
  ArrowUp,
  X,
  Code2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  RotateCcw,
  Paperclip,
  Plus,
  Globe,
  Mic,
  Eye,
  Zap,
  BarChart3,
  Gamepad2,
  Rocket,
  Home,
  Radio,
  UtensilsCrossed,
} from "lucide-react";

const CREATIVE_DIRECTIONS = [
  { id: "auto", label: "Autonomous", desc: "AI selects optimal aesthetic" },
  { id: "editorial", label: "Editorial", desc: "Monolithic type & asymmetrical grid" },
  { id: "experimental", label: "Experimental", desc: "Kinetic typography & high contrast" },
  { id: "minimal", label: "Minimal", desc: "Generous whitespace & quiet luxury" },
  { id: "futuristic", label: "Futuristic", desc: "Cyber-editorial & spatial light" },
];

const THEME_OPTIONS = [
  { id: "auto", label: "Autonomous", color: "#FF5A1F" },
  { id: "forest_green", label: "Forest", color: "#2D5A27" },
  { id: "electric_blue", label: "Electric Blue", color: "#0066FF" },
  { id: "monochrome", label: "Monochrome", color: "#171717" },
  { id: "warm_amber", label: "Warm Amber", color: "#F59E0B" },
];

const STARTER_PILLS = [
  {
    icon: BarChart3,
    label: "Reporting Dashboard",
    prompt: "Create an executive analytics reporting dashboard with real-time revenue metrics, churn forecasting, and cohort retention tables.",
  },
  {
    icon: Gamepad2,
    label: "Gaming Platform",
    prompt: "Design a futuristic web3 gaming universe landing page featuring competitive tournament brackets, live Twitch streams, and digital skins.",
  },
  {
    icon: Rocket,
    label: "Onboarding Portal",
    prompt: "Build a sleek developer onboarding portal with step-by-step interactive CLI tutorials, API token creation, and dark-mode code snippets.",
  },
  {
    icon: Home,
    label: "Room Visualizer",
    prompt: "Create an architectural 3D interior design and room visualizer landing page with before-and-after spatial sliders and furniture staging.",
  },
  {
    icon: Radio,
    label: "Networking App",
    prompt: "Design a private executive networking and peer mastermind app with verified member profiles, invite-only summits, and instant messaging.",
  },
  {
    icon: UtensilsCrossed,
    label: "Artisanal Bakery",
    prompt: "Create a warm, organic sourdough bakery landing page with seasonal pastry menus, wood-fired oven heritage, and catering pre-orders.",
  },
];


export default function HeroPrompt({ onPageGenerated }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [prompt, setPrompt] = useState("");
  const [direction, setDirection] = useState("auto");
  const [themePreference, setThemePreference] = useState("auto");
  const [motionStyle, setMotionStyle] = useState("auto");
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Live Telemetry Ticker
  const [stats, setStats] = useState({
    totalVisits: 1842,
    activePeople: 1,
    totalBuilds: 54,
  });

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        // ignore
      }
    };

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/activity", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalVisits: data.totalVisits || 1842,
            activePeople: data.activePeople || data.onlineNow || 1,
            totalBuilds: data.totalBuilds || 54,
          });
        }
      } catch (e) {
        // fallback
      }
    };

    sendHeartbeat();
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Multimodal visual references
  const [referenceImages, setReferenceImages] = useState([]);

  const compressImageFile = (file, maxWidth = 1200, quality = 0.85) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const img = new window.Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => resolve(loadEvt.target.result);
        img.src = loadEvt.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const file of files.slice(0, 3)) {
      if (!file.type.startsWith("image/")) continue;
      const compressedDataUrl = await compressImageFile(file);
      if (compressedDataUrl) {
        setReferenceImages((prev) => {
          if (prev.includes(compressedDataUrl)) return prev;
          return [...prev, compressedDataUrl].slice(0, 3);
        });
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeReferenceImage = (idxToRemove) => {
    setReferenceImages((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // State machine: idle | generating | success | error
  const [status, setStatus] = useState("idle");
  const [generationStep, setGenerationStep] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Generated state
  const [generatedProject, setGeneratedProject] = useState(null);
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [generationNotice, setGenerationNotice] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showJsonSchema, setShowJsonSchema] = useState(false);

  useEffect(() => {
    if (status !== "generating") return;
    const steps = [
      referenceImages.length > 0
        ? "Analyzing attached visual screenshots & aesthetic cues..."
        : "Analyzing business category & conversion hierarchy...",
      "Synthesizing bespoke color harmony & typography pairing...",
      "Composing responsive layout sections & bento grids...",
      "Choreographing kinetic scroll & hover interactions...",
      "Validating production schema & rendering live page...",
    ];
    let idx = 0;
    setGenerationStep(steps[0]);
    const timer = setInterval(() => {
      idx = (idx + 1) % steps.length;
      setGenerationStep(steps[idx]);
    }, 2400);
    return () => clearInterval(timer);
  }, [status, referenceImages.length]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (status === "generating") return;

    if (!prompt.trim()) {
      setStatus("error");
      setErrorMessage("Please describe your business or product idea before generating.");
      return;
    }

    if (prompt.trim().length < 4) {
      setStatus("error");
      setErrorMessage("Prompt is too short. Please provide at least a few descriptive words.");
      return;
    }

    setGeneratedProject(null);
    setGeneratedConfig(null);
    setGenerationNotice("");
    setErrorMessage("");
    setStatus("generating");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          direction,
          themePreference,
          motionStyle,
          referenceImages,
          referenceUrls: [],
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Generation failed with status ${res.status}`);
      }

      const proj = data.project;
      const config = proj?.pageConfig;

      if (!proj || !config || !Array.isArray(config.sections) || config.sections.length === 0) {
        throw new Error("Invalid response received from server: page configuration missing sections.");
      }

      if (typeof window !== "undefined" && data.editToken) {
        const targetId = proj._id || proj.id;
        localStorage.setItem(`forma_token_${targetId}`, data.editToken);
        localStorage.setItem(`forma_edit_token_${targetId}`, data.editToken);
      }

      setGeneratedProject(proj);
      setGeneratedConfig(config);
      setGenerationNotice(data.notice || "");
      setStatus("success");
      setGenerationStep("Landing page synthesized & validated successfully!");
      setIsPreviewOpen(true);

      if (onPageGenerated) {
        onPageGenerated(config);
      }
    } catch (err) {
      console.error("Generation error:", err);
      setStatus("error");
      const isNetworkError =
        err.message === "Failed to fetch" ||
        err.message?.includes("NetworkError") ||
        err.name === "TypeError";
      setErrorMessage(
        isNetworkError
          ? "Unable to connect to the generation server. Please retry in a few moments."
          : (err.message || "Failed to generate landing page configuration.")
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const openVisualEditor = () => {
    if (!generatedProject) return;
    const id = generatedProject._id || generatedProject.id;
    router.push(`/editor/${id}`);
  };

  return (
    <section id="hero-studio" className="w-full relative overflow-hidden forma-hero-canvas border-b border-[#E9E3DA] py-14 sm:py-20 md:py-16 px-4 sm:px-6 md:px-12">
      {/* Precision Dotted Matrix Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none forma-hero-dots z-0" />

      {/* Luminous Ambient Gradient Light Blooms */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] sm:w-[960px] h-[450px] bg-gradient-to-b from-[#FF5A1F]/16 via-[#FF8A00]/08 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-gradient-to-tr from-amber-400/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-gradient-to-tl from-[#FF5A1F]/10 to-transparent blur-3xl rounded-full" />
      </div>

      {/* Content Container */}
      <div className="max-w-3xl mx-auto text-center flex flex-col items-center relative z-10">

        {/* Clean Telemetry Status Ticker */}
        <FadeUp delay={0.05}>
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#E9E3DA] text-[11px] font-mono text-[#737373] mb-6 shadow-2xs">
            <span className="inline-flex items-center gap-1.5 text-[#171717]">
              <Eye className="w-3 h-3 text-[#FF5A1F]" />
              <span><strong>{(stats.totalVisits || 1842).toLocaleString()}</strong> visits</span>
            </span>
            <span className="text-[#E9E3DA]">•</span>
            <span className="inline-flex items-center gap-1.5 text-[#171717]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span><strong>{stats.activePeople || 1}</strong> online</span>
            </span>
            <span className="text-[#E9E3DA]">•</span>
            <span className="inline-flex items-center gap-1.5 text-[#171717]">
              <Zap className="w-3 h-3 text-[#FF5A1F]" />
              <span><strong>{stats.totalBuilds || 54}</strong> built</span>
            </span>
          </div>
        </FadeUp>

        {/* Centered Editorial Headline */}
        <FadeUp delay={0.1}>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#171717] leading-[1.08] mb-4 max-w-3xl font-display">
            AI-powered builder <br />
            for your <span className="text-[#FF5A1F]">ideas</span>
          </h1>
        </FadeUp>

        {/* Supporting Copy */}
        <FadeUp delay={0.15}>
          <p className="text-base sm:text-lg md:text-xl text-[#737373] max-w-xl mx-auto leading-relaxed mb-8">
            Forma lets you build powerful, fully functional landing pages in minutes using only your words — no coding required.
          </p>
        </FadeUp>

        {/* Redesigned AI Prompt Composer Card */}
        <FadeUp delay={0.2} className="w-full">
          <div className="w-full max-w-2xl mx-auto rounded-3xl bg-white/90 backdrop-blur-xl border border-[#E9E3DA] shadow-xl shadow-orange-500/5 p-4 sm:p-5 relative transition-all focus-within:border-[#FF5A1F]/40 focus-within:shadow-2xl text-left">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Textarea Field */}
              <div className="relative">
                <textarea
                  id="prompt-input"
                  rows={2}
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Forma to create a custom website for you..."
                  className="w-full bg-transparent text-sm sm:text-base text-[#171717] placeholder:text-[#737373]/70 focus:outline-none resize-none leading-relaxed"
                  maxLength={350}
                />
              </div>

              {/* Attached Reference Images Thumbnails */}
              {referenceImages.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E9E3DA]/60">
                  <span className="text-[11px] font-mono text-[#737373]">References:</span>
                  {referenceImages.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#E9E3DA] group shadow-2xs"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgSrc}
                        alt={`Reference ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeReferenceImage(idx)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                        aria-label="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReferenceImages([])}
                    className="text-[10px] font-mono text-red-600 hover:underline cursor-pointer ml-1"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Configuration Dropdown (Collapsible) */}
              {showConfigDrawer && (
                <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E9E3DA] space-y-3 text-xs font-mono animate-in fade-in duration-200">
                  <div>
                    <span className="text-[#737373] block mb-1.5 font-medium">Aesthetic Direction:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {CREATIVE_DIRECTIONS.map((dir) => (
                        <button
                          key={dir.id}
                          type="button"
                          onClick={() => setDirection(dir.id)}
                          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${direction === dir.id
                            ? "bg-[#FF5A1F] text-white border-[#FF5A1F]"
                            : "bg-white text-[#171717] border-[#E9E3DA] hover:border-[#FF5A1F]/40"
                            }`}
                        >
                          {dir.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#737373] block mb-1.5 font-medium">Palette Theme:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {THEME_OPTIONS.map((th) => (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => setThemePreference(th.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${themePreference === th.id
                            ? "bg-[#171717] text-white border-[#171717]"
                            : "bg-white text-[#171717] border-[#E9E3DA] hover:border-[#171717]/40"
                            }`}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: th.color }} />
                          <span>{th.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {status === "generating" && (
                <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#FF5A1F]/30 flex items-center gap-2.5 text-xs text-[#171717]">
                  <Loader2 className="w-4 h-4 text-[#FF5A1F] animate-spin shrink-0" />
                  <span className="font-mono text-[#FF5A1F] font-medium">{generationStep}</span>
                </div>
              )}

              {status === "error" && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-2 text-xs text-red-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span className="font-mono leading-tight">{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono bg-red-100 hover:bg-red-200 text-red-800 transition-colors cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {status === "success" && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-mono text-emerald-800 font-semibold">{generationStep}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono bg-white hover:bg-gray-50 text-[#171717] border border-[#E9E3DA] cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-[#737373]" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={openVisualEditor}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-mono bg-[#FF5A1F] text-white font-medium hover:bg-[#E44A12] cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Bar matching screenshot layout */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E9E3DA]/40">
                {/* Left Controls: +, Attach, Public */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                    className={`p-1.5 sm:p-2 rounded-full border transition-colors cursor-pointer ${showConfigDrawer
                      ? "bg-[#FF5A1F] text-white border-[#FF5A1F]"
                      : "bg-white text-[#737373] hover:text-[#171717] border-[#E9E3DA] hover:border-[#171717]/30"
                      }`}
                    title="Configuration options"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {/* File upload trigger */}
                  <label
                    htmlFor="hero-ref-upload"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white hover:bg-[#FAF7F0] border border-[#E9E3DA] text-xs font-mono text-[#737373] hover:text-[#171717] cursor-pointer transition-colors"
                  >
                    <Paperclip className="w-3 h-3 text-[#FF5A1F]" />
                    <span>Attach</span>
                    {referenceImages.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
                    )}
                    <input
                      ref={fileInputRef}
                      id="hero-ref-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {/* Public badge */}
                  <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E9E3DA] text-xs font-mono text-[#737373]">
                    <Globe className="w-3 h-3 text-[#737373]" />
                    <span>Public</span>
                  </div>
                </div>

                {/* Right Controls: Mic/Sparkles + Prominent Generate Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const randomPill = STARTER_PILLS[Math.floor(Math.random() * STARTER_PILLS.length)];
                      setPrompt(randomPill.prompt);
                    }}
                    className="p-2 rounded-full text-[#737373] hover:text-[#FF5A1F] transition-colors cursor-pointer"
                    title="Surprise me with inspiration"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  <button
                    type="submit"
                    disabled={status === "generating"}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#171717] hover:bg-[#FF5A1F] text-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    aria-label="Generate landing page"
                  >
                    {status === "generating" ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <ArrowUp className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </FadeUp>

        {/* "Not sure where to start? Try one of these:" */}
        <FadeUp delay={0.25} className="mt-6 sm:mt-8">
          <div className="space-y-3">
            <span className="text-xs font-medium text-[#737373] block">
              Not sure where to start? Try one of these:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
              {STARTER_PILLS.map((pill, idx) => {
                const Icon = pill.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(pill.prompt);
                      if (status === "error") setStatus("idle");
                      const input = document.getElementById("prompt-input");
                      if (input) input.focus();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-xs font-medium text-[#171717] border border-[#E9E3DA] hover:border-[#FF5A1F]/40 hover:text-[#FF5A1F] transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#737373] group-hover:text-[#FF5A1F]" />
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </FadeUp>

      </div>

      {/* Fullscreen Live Preview Modal */}
      {isPreviewOpen && generatedConfig && (
        <div className="fixed inset-0 z-50 bg-[#171717]/90 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in duration-200">
          <div className="h-16 px-6 bg-white border-b border-[#E9E3DA] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-[#FF5A1F] uppercase tracking-wider flex items-center gap-2 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-pulse" />
                Live Generated Canvas
              </span>
              <span className="text-xs text-[#737373] font-mono hidden md:inline-block">
                {"// "}{generatedConfig.metadata?.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowJsonSchema(!showJsonSchema)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-[#FAF7F0] hover:bg-[#FAF7F0]/80 text-[#171717] border border-[#E9E3DA] transition-colors cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showJsonSchema ? "View Preview" : "Inspect Schema"}</span>
              </button>

              <button
                onClick={openVisualEditor}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono bg-[#FF5A1F] text-white font-semibold hover:bg-[#E44A12] transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Open in Visual Editor</span>
              </button>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            {showJsonSchema ? (
              <div className="p-8 max-w-4xl mx-auto">
                <h3 className="font-mono text-sm text-[#FF5A1F] mb-4">
                  Schema-Driven Page Configuration (Zod Validated)
                </h3>
                <pre className="p-6 rounded-2xl bg-[#FAF7F0] border border-[#E9E3DA] text-xs font-mono text-[#171717] overflow-x-auto leading-relaxed">
                  {JSON.stringify(generatedConfig, null, 2)}
                </pre>
              </div>
            ) : (
              <PageRenderer pageConfig={generatedConfig} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
