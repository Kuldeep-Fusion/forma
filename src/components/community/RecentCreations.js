"use client";

import { useState, useEffect } from "react";
import { FadeUp, HoverCard } from "../motion/MotionReveal.js";
import PageRenderer from "../renderer/PageRenderer.js";
import { Eye, ArrowRight, X, Sparkles, SlidersHorizontal, ArrowUpRight } from "lucide-react";

// Distinct industries and art directions with high-res curated screenshots
const DISTINCT_POSSIBILITIES = [
  {
    id: "possibility-1",
    title: "Aura Intelligence — Cloud Defense",
    category: "SaaS & AI",
    artDirection: "Cyber Editorial",
    palette: { primary: "#171717", accent: "#FF5A1F", name: "High Contrast Monolith" },
    layoutType: "Asymmetrical Bento Grid",
    description: "Deep-contrast dark chrome with hot orange telemetry, live security event feeds, and mathematical grid spacing.",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    pageConfig: {
      metadata: {
        title: "Aura Intelligence — Cloud Defense",
        category: "SaaS & AI",
        themePreference: "monochrome",
      },
      theme: {
        colors: {
          background: "#171717",
          foreground: "#FFFFFF",
          accent: "#FF5A1F",
          surface: "#212121",
          border: "#333333",
          muted: "#A3A3A3",
        },
        typography: {
          headingFont: "font-display",
          bodyFont: "font-sans",
          scale: "dramatic",
        },
      },
      sections: [
        {
          id: "hero-aura",
          type: "hero",
          variant: "editorial",
          content: {
            eyebrow: "ZERO-TRUST AUTONOMOUS DEFENSE",
            headline: "Defend cloud infrastructure with neural precision.",
            subheadline: "Autonomous agentic telemetry protecting Fortune 500 networks with sub-millisecond threat mitigation.",
            ctas: [
              { label: "Request Sandbox Access", action: "modal", variant: "primary" },
              { label: "Read Architecture Spec", action: "link", variant: "secondary" },
            ],
            media: {
              type: "image",
              url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
            },
          },
        },
      ],
    },
  },
  {
    id: "possibility-2",
    title: "Verve Botanics — Sustainable Goods",
    category: "Shops",
    artDirection: "Organic Minimalist",
    palette: { primary: "#FAF7F0", accent: "#3B6E44", name: "Warm Milk & Forest Flora" },
    layoutType: "Editorial Split & Nature Story",
    description: "Airy milk-white canvas paired with deep botanical greens, sunlit organic textures, and transparent material sourcing.",
    thumbnail: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    pageConfig: {
      metadata: {
        title: "Verve Botanics — Sustainable Goods",
        category: "Shops",
        themePreference: "forest_green",
      },
      theme: {
        colors: {
          background: "#FAF7F0",
          foreground: "#1C241D",
          accent: "#3B6E44",
          surface: "#FFFFFF",
          border: "#E2DDD3",
          muted: "#667067",
        },
        typography: {
          headingFont: "font-serif",
          bodyFont: "font-sans",
          scale: "editorial",
        },
      },
      sections: [
        {
          id: "hero-verve",
          type: "hero",
          variant: "split",
          content: {
            eyebrow: "100% REGENERATIVE BOTANICALS",
            headline: "Gentle skincare rooted in biodynamic earth.",
            subheadline: "Formulated with certified wildcrafted herbs, unrefined seed oils, and recyclable compostable glass packaging.",
            ctas: [
              { label: "Shop the Collection", action: "link", variant: "primary" },
              { label: "Our Sourcing Promise", action: "link", variant: "secondary" },
            ],
            media: {
              type: "image",
              url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
            },
          },
        },
      ],
    },
  },
  {
    id: "possibility-3",
    title: "Atelier Forma — Architectural Sanctuary",
    category: "Real Estate",
    artDirection: "Monolithic Brutalist",
    palette: { primary: "#F4EFEA", accent: "#8A5A36", name: "Stone & Cast Bronze" },
    layoutType: "Full-Bleed Specimen Showcase",
    description: "Generous whitespace, monolithic headline scaling, and raw tactile material photography honoring architectural craft.",
    thumbnail: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    pageConfig: {
      metadata: {
        title: "Atelier Forma — Architectural Sanctuary",
        category: "Real Estate",
        themePreference: "warm_amber",
      },
      theme: {
        colors: {
          background: "#F4EFEA",
          foreground: "#1F1A17",
          accent: "#8A5A36",
          surface: "#FFFFFF",
          border: "#DED6CD",
          muted: "#786E66",
        },
        typography: {
          headingFont: "font-display",
          bodyFont: "font-sans",
          scale: "dramatic",
        },
      },
      sections: [
        {
          id: "hero-atelier",
          type: "hero",
          variant: "minimal",
          content: {
            eyebrow: "ARCHITECTURAL HARDWARE EDITIONS",
            headline: "Form carved from geological permanence.",
            subheadline: "Hand-poured bronze handles, solid travertine sinks, and patinated architectural hardware.",
            ctas: [
              { label: "View 2026 Lookbook", action: "link", variant: "primary" },
              { label: "Commission Atelier Work", action: "link", variant: "secondary" },
            ],
            media: {
              type: "image",
              url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
            },
          },
        },
      ],
    },
  },
  {
    id: "possibility-4",
    title: "Apex Horizon — Institutional Wealth",
    category: "B2B App",
    artDirection: "Swiss Precision",
    palette: { primary: "#FFFFFF", accent: "#FF5A1F", name: "Crisp White & Hot Signal" },
    layoutType: "Metrics & Data Spec",
    description: "Structured metric strips, mathematical typography, interactive yield projections, and institutional bank-grade security.",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    pageConfig: {
      metadata: {
        title: "Apex Horizon — Institutional Wealth",
        category: "B2B App",
        themePreference: "auto",
      },
      theme: {
        colors: {
          background: "#FFFFFF",
          foreground: "#0F172A",
          accent: "#FF5A1F",
          surface: "#F8FAFC",
          border: "#E2E8F0",
          muted: "#64748B",
        },
        typography: {
          headingFont: "font-sans",
          bodyFont: "font-sans",
          scale: "balanced",
        },
      },
      sections: [
        {
          id: "hero-apex",
          type: "hero",
          variant: "bento",
          content: {
            eyebrow: "PRIVATE WEALTH INTELLIGENCE",
            headline: "Capital allocation accelerated by real-time alpha.",
            subheadline: "Direct algorithmic liquidity, automated hedging protocols, and institutional custody for family offices.",
            ctas: [
              { label: "Explore Portfolio Spec", action: "link", variant: "primary" },
              { label: "Schedule Advisor Call", action: "link", variant: "secondary" },
            ],
            media: {
              type: "image",
              url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
            },
          },
        },
      ],
    },
  },
  {
    id: "possibility-5",
    title: "NeuroPulse — Cognitive Sensory Audio",
    category: "SaaS & AI",
    artDirection: "Bioluminescent Dark",
    palette: { primary: "#0A0F1D", accent: "#00F0FF", name: "Deep Navy & Cyan" },
    layoutType: "Spatial Audio Waves",
    description: "Real-time EEG biosensing coupled with generative binaural audio therapy for cognitive decompression.",
    thumbnail: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80",
    pageConfig: {
      metadata: {
        title: "NeuroPulse — Cognitive Sensory Audio",
        category: "SaaS & AI",
        themePreference: "electric_blue",
      },
      theme: {
        colors: {
          background: "#0A0F1D",
          foreground: "#F0F4FF",
          accent: "#00F0FF",
          surface: "#111827",
          border: "#1F2937",
          muted: "#9CA3AF",
        },
        typography: {
          headingFont: "font-display",
          bodyFont: "font-sans",
          scale: "dramatic",
        },
      },
      sections: [
        {
          id: "hero-neuro",
          type: "hero",
          variant: "editorial",
          content: {
            eyebrow: "NEURAL BIO-FREQUENCY ENGINE",
            headline: "Synchronize your nervous system with generative sound.",
            subheadline: "Clinical-grade neurofeedback algorithms producing personalized soundscapes.",
            ctas: [
              { label: "Start Free Session", action: "link", variant: "primary" },
              { label: "View Clinical Study", action: "link", variant: "secondary" },
            ],
            media: {
              type: "image",
              url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80",
            },
          },
        },
      ],
    },
  },
  {
    id: "possibility-6",
    title: "Osteria Luca — Wood-Fired Tuscan",
    category: "Restaurants",
    artDirection: "Warm Editorial",
    palette: { primary: "#FAF7F0", accent: "#D9480F", name: "Tuscan Terracotta" },
    layoutType: "Culinary Specimen",
    description: "Handmade tagliatelle, 48-hour fermented sourdough crusts, and natural biodynamic wines from Chianti hills.",
    thumbnail: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    pageConfig: {
      metadata: {
        title: "Osteria Luca — Wood-Fired Tuscan",
        category: "Restaurants",
        themePreference: "warm_amber",
      },
      theme: {
        colors: {
          background: "#FAF7F0",
          foreground: "#211D1B",
          accent: "#D9480F",
          surface: "#FFFFFF",
          border: "#E7DFD5",
          muted: "#786E66",
        },
        typography: {
          headingFont: "font-serif",
          bodyFont: "font-sans",
          scale: "editorial",
        },
      },
      sections: [
        {
          id: "hero-osteria",
          type: "hero",
          variant: "split",
          content: {
            eyebrow: "FLORENTINE WOOD-FIRED HERITAGE",
            headline: "Simple ingredients celebrated over living embers.",
            subheadline: "Freshly extruded pasta, heritage estate olive oils, and wood-roasted prime bistecca.",
            ctas: [
              { label: "Reserve a Table", action: "link", variant: "primary" },
              { label: "Seasonal Tasting Menu", action: "link", variant: "secondary" },
            ],
            media: {
              type: "image",
              url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
            },
          },
        },
      ],
    },
  },
  {
    id: "possibility-7",
    title: "Kroma Studio — Avant-Garde Atelier",
    category: "Personal",
    artDirection: "Swiss Kinetic",
    palette: { primary: "#FAF7F0", accent: "#FF5A1F", name: "Warm Milk & Hot Orange" },
    layoutType: "Interactive Gallery",
    description: "Award-winning creative direction blending tactile brand identity with expressive motion choreography.",
    thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    pageConfig: {
      metadata: {
        title: "Kroma Studio — Digital Atelier",
        category: "Personal",
        themePreference: "editorial",
      },
      theme: {
        colors: {
          background: "#FAF7F0",
          foreground: "#171717",
          accent: "#FF5A1F",
          surface: "#FFFFFF",
          border: "#E9E3DA",
          muted: "#737373",
        },
        typography: {
          headingFont: "font-display",
          bodyFont: "font-sans",
          scale: "dramatic",
        },
      },
      sections: [
        {
          id: "hero-kroma",
          type: "hero",
          variant: "editorial",
          content: {
            eyebrow: "DIGITAL IDENTITY STUDIO",
            headline: "We design brands that command cultural reverence.",
            subheadline: "Bespoke digital architecture for pioneers in AI, luxury, and cultural arts.",
            ctas: [
              { label: "View Selected Works", action: "link", variant: "primary" },
              { label: "Initiate Project", action: "link", variant: "secondary" },
            ],
            media: {
              type: "image",
              url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
            },
          },
        },
      ],
    },
  },
  {
    id: "possibility-8",
    title: "Chronos Horology — Haute Watchmaking",
    category: "Shops",
    artDirection: "Editorial Monolith",
    palette: { primary: "#1A1715", accent: "#D4AF37", name: "Espresso & Hand Gold" },
    layoutType: "Full-Bleed Specimen",
    description: "Hand-finished tourbillons, meteorite dials, and perpetual calendars constructed in Geneva.",
    thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
    pageConfig: {
      metadata: {
        title: "Chronos Horology — Haute Watchmaking",
        category: "Shops",
        themePreference: "warm_amber",
      },
      theme: {
        colors: {
          background: "#1A1715",
          foreground: "#FAF7F0",
          accent: "#D4AF37",
          surface: "#24201D",
          border: "#3B3530",
          muted: "#9E948C",
        },
        typography: {
          headingFont: "font-serif",
          bodyFont: "font-sans",
          scale: "dramatic",
        },
      },
      sections: [
        {
          id: "hero-chronos",
          type: "hero",
          variant: "minimal",
          content: {
            eyebrow: "GENEVA METIERS D'ART",
            headline: "Time measured in celestial craftsmanship.",
            subheadline: "Each timepiece requires 450 hours of hand-anglage, geneva striping, and precision calibration.",
            ctas: [
              { label: "Inquire Allocation", action: "link", variant: "primary" },
              { label: "Discover Manufacture", action: "link", variant: "secondary" },
            ],
            media: {
              type: "image",
              url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
            },
          },
        },
      ],
    },
  },
];

const CATEGORIES = [
  { id: "all", label: "Discover" },
  { id: "SaaS & AI", label: "Internal Tools" },
  { id: "Shops", label: "Shops" },
  { id: "Personal", label: "Personal" },
  { id: "Restaurants", label: "Restaurants" },
  { id: "B2B App", label: "B2B App" },
];

export default function RecentCreations() {
  const [projectsList, setProjectsList] = useState(DISTINCT_POSSIBILITIES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchCommunityProjects() {
      try {
        const res = await fetch("/api/community");
        if (res.ok) {
          const data = await res.json();
          if (data.projects && data.projects.length > 0) {
            const mapped = data.projects.map((p) => ({
              id: p.id,
              title: p.title,
              category: p.category || "SaaS & AI",
              artDirection: p.direction === "editorial" ? "Editorial Craft" : "Modern Precision",
              palette: { primary: "#FFFFFF", accent: "#FF5A1F", name: "Autonomous Palette" },
              layoutType: "Autonomous Layout",
              description: `Generated live through Forma AI. Category: ${p.category || "Creative"}.`,
              thumbnail: p.thumbnail,
              pageConfig: p.pageConfig,
            }));
            setProjectsList([...mapped, ...DISTINCT_POSSIBILITIES]);
          }
        }
      } catch (err) {
        // Fallback to distinct fixtures
      }
    }
    fetchCommunityProjects();
  }, []);

  const openPreview = (item) => {
    setSelectedProject(item);
  };

  const closePreview = () => {
    setSelectedProject(null);
  };

  // Filter projects by category
  const filteredProjects = selectedCategory === "all"
    ? projectsList
    : projectsList.filter((p) => p.category === selectedCategory);

  // 1 row (4 cards) on desktop by default, or all when expanded
  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 4);

  return (
    <section id="recent-builds" className="w-full px-4 sm:px-6 md:px-10 py-10 sm:py-16">
      <div className="max-w-6xl mx-auto">
        
        {/* Docked Recent Projects Control Panel matching screenshot */}
        <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#E9E3DA] p-4 sm:p-6 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Section Title & Category Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#171717] font-display shrink-0">
              Recent projects
            </h2>

            {/* Filter Pills matching screenshot */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-[#171717] text-white shadow-xs"
                      : "bg-[#FAF7F0] text-[#737373] hover:text-[#171717] hover:bg-white border border-[#E9E3DA]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Popular Tag & View All button */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E9E3DA]/60">
            <span className="text-xs font-mono text-[#737373] px-3 py-1 rounded-full bg-[#FAF7F0] border border-[#E9E3DA]">
              Popular
            </span>

            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#171717] hover:text-[#FF5A1F] transition-colors cursor-pointer py-1 px-2"
            >
              <span>{showAll ? "Show Recent" : "View All"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Cards in 1 Row on Desktop, 2 Cards on Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
          {displayedProjects.map((item, index) => (
            <FadeUp key={item.id} delay={0.05 * (index + 1)}>
              <HoverCard
                className="group p-3 sm:p-4 rounded-2xl bg-white border border-[#E9E3DA] shadow-xs hover:border-[#FF5A1F]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full"
              >
                <div>
                  {/* Category Badge & Palette */}
                  <div className="flex items-center justify-between mb-2 text-[10px] sm:text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF7F0] text-[#171717] border border-[#E9E3DA] font-medium truncate max-w-[110px]">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-[#737373] truncate">
                      <span
                        className="w-2 h-2 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: item.palette.accent }}
                      />
                      <span className="hidden sm:inline text-[9px]">{item.artDirection}</span>
                    </span>
                  </div>

                  {/* Thumbnail with Live Hover Preview Trigger */}
                  <div
                    onClick={() => openPreview(item)}
                    className="relative aspect-video rounded-xl overflow-hidden bg-[#FAF7F0] border border-[#E9E3DA] mb-3 group/thumb cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#171717] text-xs font-medium shadow-md">
                        <Eye className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span>Live Preview</span>
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-semibold text-xs sm:text-sm text-[#171717] tracking-tight group-hover:text-[#FF5A1F] transition-colors line-clamp-1 mb-1">
                    {item.title}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-[#737373] line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="pt-2 border-t border-[#E9E3DA]/60 flex items-center justify-between text-[11px] font-mono text-[#737373]">
                  <span className="truncate">{item.layoutType}</span>
                  <button
                    onClick={() => openPreview(item)}
                    className="inline-flex items-center gap-1 text-[#FF5A1F] hover:underline font-medium cursor-pointer shrink-0"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </HoverCard>
            </FadeUp>
          ))}
        </div>

        {displayedProjects.length === 0 && (
          <div className="p-8 text-center text-xs font-mono text-[#737373] bg-white rounded-2xl border border-[#E9E3DA]">
            No projects in this category yet. Select &ldquo;Discover&rdquo; to view all creations.
          </div>
        )}
      </div>

      {/* Fullscreen Live Preview Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-[#171717]/90 backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in duration-200">
          <div className="h-16 px-6 bg-white border-b border-[#E9E3DA] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-[#FF5A1F] uppercase tracking-wider flex items-center gap-2 font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-pulse" />
                Live Showcase
              </span>
              <span className="text-xs text-[#737373] font-mono hidden md:inline-block">
                {"// "}{selectedProject.title}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#737373] hidden sm:inline">
                {selectedProject.artDirection}
              </span>

              <button
                onClick={closePreview}
                className="p-2 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            <PageRenderer pageConfig={selectedProject.pageConfig} />
          </div>
        </div>
      )}
    </section>
  );
}
