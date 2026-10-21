import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validatePageConfig } from "../validation/pageConfigSchema.js";
import { enrichPageConfigWithDomainImages, detectDomainFromPrompt } from "./imageResolver.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Candidate models in preferred order (prioritizing active models verified on v1beta)
const PREFERRED_MODELS = Array.from(
  new Set([
    process.env.GEMINI_MODEL,
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
  ].filter(Boolean))
);

// ============================================================================
// STAGE 1: CREATIVE DIRECTOR & DESIGN INTELLIGENCE PROMPT
// ============================================================================
const DESIGN_INTELLIGENCE_SYSTEM_PROMPT = `
You are the Executive Creative Director and Principal Design Systems Architect at Forma Studio.
You formulate an original, bespoke Art Direction and Layout Architecture Plan (DesignPlan) for each user brief.

CRITICAL PRODUCT REQUIREMENT:
Forma must NEVER behave like a template-based website builder that produces the same 10 sections or the same layout.
You art-direct every landing page independently based on the user's business idea, audience, and conversion goal.

YOU MUST AUTONOMOUSLY INFER & DECIDE:
1. Business Category & Target Audience: Who are they? What visual tone do they expect?
2. Conversion Objective: VIP reservation, enterprise demo, product purchase, waitlist, course enrollment, inquiry.
3. Brand Personality: Minimal luxury, high-velocity developer technical, avant-garde creative, tranquil wellness, etc.
4. Visual Direction:
   - "editorial": Monolithic type, asymmetrical grids, quiet luxury, curated framing (luxury skincare, fine dining, architecture, boutique agency).
   - "experimental": High kinetic velocity, sharp contrast, provocative geometry (creative studios, avant-garde tech, fashion drops).
   - "minimal": Restrained whitespace, high scannability, refined simplicity (developer tooling, clean wellness, modern SaaS).
   - "futuristic": Dark voids, cyber luminescence, telemetry matrices, technical precision (AI platforms, cybersecurity, cloud infra).
5. Hero Composition (SELECT WITH EXTREME INTENTIONALITY):
   - "saas_mockup": Interactive floating window with macOS traffic lights, active telemetry stats pills, and status chips (Developer tools, cloud infra, analytics, tech SaaS).
   - "large_typography": Monumental 8xl/9xl headline statement, live ticker banner, minimal split CTA (Creative agencies, fashion drops, avant-garde studios, manifestos).
   - "minimal_luxury": Ultra-generous whitespace, refined serif headline, hairline borders, understated luxury CTA (High-end skincare, private wealth, luxury watches, quiet luxury).
   - "overlapping": Kinetic layered card geometry, floating badges, asymmetric visual collage (B2B SaaS, modern fintech, mobile apps, creator tools).
   - "immersive": Cinematic full-bleed photographic hero with dark radial vignette & floating glass card (Fine dining, boutique resorts, luxury real estate, cinematic experiences).
   - "asymmetric": 7/5 column kinetic editorial split with framed technical media (AI platforms, cybersecurity, engineering).
   - "centered": Balanced centered editorial headline, ambient radial glow, dual CTAs & wide media showcase below (Education, coding bootcamps, platforms).
6. Section Sequence & Architecture:
   - Curate 6 to 10 purposeful sections in a logical conversion order.
   - DO NOT always use the same section sequence. Each domain requires a distinct narrative flow!
   - Luxury Skincare: navbar -> hero -> showcase -> benefits -> testimonials -> cta -> footer
   - AI Developer Tool: announcement -> navbar -> hero -> logo_strip -> stats -> features -> showcase -> pricing -> faq -> form -> footer
   - Creative Design Agency: navbar -> hero -> showcase -> stats -> features -> testimonials -> cta -> footer
   - Real Estate Campaign: announcement -> navbar -> hero -> showcase -> stats -> benefits -> testimonials -> cta -> form -> footer
   - Fitness / Wellness: navbar -> hero -> stats -> features -> showcase -> pricing -> testimonials -> cta -> footer
   - Premium Fashion E-Commerce: announcement -> navbar -> hero -> showcase -> benefits -> testimonials -> cta -> footer
7. Bespoke Color Palette:
   - Formulate custom hex colors (bg, text, accent, surface, border, muted) reflecting the brand mood.
   - NEVER default to Forma's dashboard colors (milk-white #FAF7F0 or hot-orange #FF5A1F).
8. Typography Strategy:
   - Heading Font: "display" | "serif" | "sans" | "mono"
   - Body Font: "sans" | "serif" | "mono"
9. Section Layout Variants:
   - Features: "bento" | "workflow" | "integrations" | "alternating" | "grid"
   - Showcase: "curriculum" | "metrics" | "menu" | "properties" | "cards"
   - Stats: "minimal_bar" | "giant_numbers" | "cards"
   - Benefits: "split_list" | "cards"
   - Cta: "minimal_split" | "reservation" | "banner"

JSON OUTPUT CONTRACT:
Output pure raw parseable JSON adhering to this exact schema (no markdown, no backticks):
{
  "industryAndAudience": "...",
  "conversionObjective": "...",
  "brandPersonality": "...",
  "visualDirection": "editorial" | "experimental" | "minimal" | "futuristic",
  "density": "compact" | "spacious" | "editorial" | "cinematic",
  "palette": {
    "name": "Bespoke Palette Name",
    "bg": "#HEX",
    "text": "#HEX",
    "accent": "#HEX",
    "surface": "#HEX",
    "border": "#HEX",
    "muted": "#HEX"
  },
  "typography": {
    "headingFont": "display" | "serif" | "sans" | "mono",
    "bodyFont": "sans" | "serif" | "mono",
    "rationale": "..."
  },
  "heroComposition": "saas_mockup" | "large_typography" | "minimal_luxury" | "overlapping" | "immersive" | "asymmetric" | "centered",
  "heroRationale": "...",
  "sectionSequence": [
    { "type": "navbar", "purpose": "..." },
    { "type": "hero", "variant": "...", "purpose": "..." }
  ],
  "ctaStrategy": {
    "primaryLabel": "...",
    "secondaryLabel": "...",
    "layoutVariant": "minimal_split" | "reservation" | "banner",
    "formPlacement": "before_footer" | "cta_section" | "none" | "dedicated_section"
  },
  "animationDirection": {
    "preset": "cinematic" | "subtle" | "experimental",
    "intensity": "low" | "medium" | "high"
  }
}
`;

// ============================================================================
// STAGE 2: PAGE SYNTHESIS SYSTEM PROMPT
// ============================================================================
const PAGE_SYNTHESIS_SYSTEM_PROMPT = `
You are the Master UI Engineer and Content Synthesizer at Forma Studio.
You receive an approved Art Direction & Layout Architecture Plan (DesignPlan) created by the Creative Director.

YOUR MISSION:
Faithfully execute the approved DesignPlan. You must:
1. STRICTLY follow the specified sectionSequence in the exact order requested. DO NOT add unrequested sections or change the sequence.
2. STRICTLY implement the specified heroComposition as the hero section's layoutVariant.
   - "saas_mockup": Provide rich "statsPills" ([{ label, value }]) and "mockup" ({ path, status, metrics: [{ label, value }] }).
   - "large_typography": Provide a striking "ticker" array of 4-6 brand keywords and succinct split primary/secondary CTAs.
   - "minimal_luxury": Provide refined badge, elegant headline, and understated CTA.
   - "overlapping": Provide badge, compelling headline, and dynamic visual card framing.
   - "immersive": Provide full-bleed cinematic hero headline and glass card treatment.
   - "asymmetric": Provide 7/5 editorial kinetic headline and media.
   - "centered": Provide centered typography-led headline, ambient radial glow, and dual CTAs.
3. Use the exact theme colors (#HEX) from the DesignPlan palette.
4. Use the exact headingFont and bodyFont from the DesignPlan typography.
5. Provide COMPLETE, RICH, REALISTIC domain-specific content for every section. NEVER output empty items [].
6. Never produce generic placeholder copy. Every headline, description, badge, and metric must sound like an authentic high-end product.

JSON OUTPUT CONTRACT:
Output pure raw parseable JSON adhering to the Forma PageConfig schema:
{
  "version": "1.0",
  "metadata": {
    "title": "Brand Name - Value Proposition",
    "description": "Compelling Meta Description",
    "category": "Domain Category",
    "creativeDirection": "editorial" | "experimental" | "minimal" | "futuristic",
    "author": "Forma Studio",
    "designConcept": {
      "businessType": "...",
      "targetAudience": "...",
      "conversionGoal": "...",
      "brandPersonality": "...",
      "visualDirection": "...",
      "layoutComposition": "...",
      "colorMood": "..."
    }
  },
  "designConcept": { ...same object as metadata.designConcept... },
  "theme": {
    "id": "bespoke-theme-id",
    "name": "Bespoke Palette Name",
    "bg": "#HEX",
    "text": "#HEX",
    "accent": "#HEX",
    "surface": "#HEX",
    "border": "#HEX",
    "muted": "#HEX"
  },
  "typography": {
    "headingFont": "display" | "serif" | "sans" | "mono",
    "bodyFont": "sans" | "serif" | "mono"
  },
  "motion": {
    "preset": "cinematic" | "subtle" | "experimental",
    "intensity": "low" | "medium" | "high"
  },
  "sections": [
    {
      "id": "hero-1",
      "type": "hero",
      "isVisible": true,
      "content": {
        "badge": "...",
        "headline": "...",
        "subheadline": "...",
        "layoutVariant": "saas_mockup" | "large_typography" | "minimal_luxury" | "overlapping" | "immersive" | "asymmetric" | "centered",
        "primaryCta": { "label": "...", "href": "#" },
        "secondaryCta": { "label": "...", "href": "#" },
        "statsPills": [ { "label": "...", "value": "..." } ],
        "mockup": { "path": "...", "metrics": [ { "label": "...", "value": "..." } ] },
        "ticker": [ "...", "..." ]
      }
    }
  ]
}
`;

/**
 * Normalizes and converts various reference image inputs into GoogleGenerativeAI inlineData parts.
 */
async function processReferenceImage(item) {
  if (!item) return null;

  if (typeof item === "object" && item.inlineData && item.inlineData.data) {
    return item;
  }

  if (typeof item === "object" && item.data && item.mimeType) {
    return {
      inlineData: {
        data: item.data,
        mimeType: item.mimeType,
      },
    };
  }

  if (typeof item === "string") {
    if (item.startsWith("data:")) {
      const matches = item.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/);
      if (matches) {
        return {
          inlineData: {
            mimeType: matches[1],
            data: matches[2],
          },
        };
      }
    }

    if (item.startsWith("/uploads/") || item.startsWith("uploads/")) {
      const cleanPath = item.replace(/^\//, "");
      const fullPath = path.join(process.cwd(), "public", cleanPath);
      if (fs.existsSync(fullPath)) {
        const ext = path.extname(fullPath).toLowerCase();
        const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg";
        const buffer = fs.readFileSync(fullPath);
        return {
          inlineData: {
            mimeType,
            data: buffer.toString("base64"),
          },
        };
      }
    }

    if (path.isAbsolute(item) && fs.existsSync(item)) {
      const ext = path.extname(item).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg";
      const buffer = fs.readFileSync(item);
      return {
        inlineData: {
          mimeType,
          data: buffer.toString("base64"),
        },
      };
    }

    if (item.startsWith("http://") || item.startsWith("https://")) {
      try {
        const res = await fetch(item, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const contentType = res.headers.get("content-type") || "image/jpeg";
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return {
            inlineData: {
              mimeType: contentType.split(";")[0],
              data: buffer.toString("base64"),
            },
          };
        }
      } catch (err) {
        console.warn(`[FORMA_DIAGNOSTICS] Failed to fetch remote reference image: ${item}`, err.message);
      }
    }
  }

  return null;
}

/**
 * Stage 1 Fallback: Synthesizes a deeply differentiated DesignPlan when Gemini Stage 1 is offline or rate limited.
 */
export function generateAutonomousDesignPlanFallback(prompt, direction = "auto", themePreference = "auto", motionStyle = "auto") {
  const pLower = (prompt || "").toLowerCase();
  const domain = detectDomainFromPrompt(prompt);

  // 1. Luxury Skincare / Cosmetics / Organic Wellness
  if (domain === "skincare" || domain === "ecommerce_skincare" || pLower.includes("skincare") || pLower.includes("botanical") || pLower.includes("serum")) {
    return {
      industryAndAudience: "Luxury Organic Skincare targeting discerning skincare connoisseurs",
      conversionObjective: "Discover Collection & VIP Purchase",
      brandPersonality: "Minimalist luxury, serene, clinical botanical efficacy",
      visualDirection: direction !== "auto" ? direction : "editorial",
      density: "spacious",
      palette: {
        name: "Botanical Obsidian & Champagne",
        bg: "#0E1210",
        text: "#F7F5F0",
        accent: "#C2D4B0",
        surface: "#141A16",
        border: "#202A23",
        muted: "#8E9E94",
      },
      typography: {
        headingFont: "serif",
        bodyFont: "sans",
        rationale: "Serif headings evoke timeless Parisian luxury, balanced with ultra-clean sans for ingredients.",
      },
      heroComposition: "minimal_luxury",
      heroRationale: "Minimal luxury composition provides generous breathing room for product purity.",
      sectionSequence: [
        { type: "navbar", purpose: "Boutique navigation and cart trigger" },
        { type: "hero", variant: "minimal_luxury", purpose: "Unveil hero formulation with quiet luxury" },
        { type: "showcase", variant: "cards", purpose: "Curated seasonal formulations" },
        { type: "benefits", variant: "split_list", purpose: "Clinical extraction standard and purity guarantees" },
        { type: "testimonials", variant: "quote_cards", purpose: "Dermatological reviews & client accolades" },
        { type: "cta", variant: "minimal_split", purpose: "VIP allocation invitation" },
        { type: "footer", purpose: "Brand provenance and ethics" },
      ],
      ctaStrategy: {
        primaryLabel: "Claim Allocation",
        secondaryLabel: "Explore Formulary",
        layoutVariant: "minimal_split",
        formPlacement: "none",
      },
      animationDirection: {
        preset: motionStyle !== "auto" ? motionStyle : "subtle",
        intensity: "low",
      },
    };
  }

  // 2. AI Developer Tool / Cloud Infrastructure / Cybersecurity
  if (domain === "ai_startup" || domain === "cybersecurity" || pLower.includes("developer") || pLower.includes("api") || pLower.includes("cloud") || pLower.includes("threat")) {
    return {
      industryAndAudience: "DevOps Engineers, Staff SREs, and Security Architects",
      conversionObjective: "Deploy Free Cluster / Request Enterprise Demo",
      brandPersonality: "High-velocity technical, precision telemetry, ruthless efficiency",
      visualDirection: direction !== "auto" ? direction : "futuristic",
      density: "compact",
      palette: {
        name: "Hyper Dark Void & Matrix Cyan",
        bg: "#060A10",
        text: "#E2F1FF",
        accent: "#00F0FF",
        surface: "#0A1220",
        border: "#162844",
        muted: "#647D9B",
      },
      typography: {
        headingFont: "mono",
        bodyFont: "sans",
        rationale: "Monospace headings convey code-level precision and terminal authority.",
      },
      heroComposition: "saas_mockup",
      heroRationale: "Developer tools require instant visual proof of CLI/GUI telemetry in the hero.",
      sectionSequence: [
        { type: "announcement", purpose: "Runtime v3.2 release banner" },
        { type: "navbar", purpose: "Documentation, GitHub link, and sign-in" },
        { type: "hero", variant: "saas_mockup", purpose: "Live interactive telemetry dashboard with latency stats" },
        { type: "logo_strip", purpose: "Enterprise production compliance badges" },
        { type: "stats", variant: "minimal_bar", purpose: "Sub-millisecond latency and uptime SLAs" },
        { type: "features", variant: "bento", purpose: "Distributed runtime engine and sandboxing capabilities" },
        { type: "showcase", variant: "metrics", purpose: "Real-time query performance telemetry" },
        { type: "pricing", variant: "plans", purpose: "Consumption-based developer and enterprise tiers" },
        { type: "faq", variant: "accordion", purpose: "Security architecture and deployment models" },
        { type: "form", purpose: "Request Enterprise Pilot and VPC deployment" },
        { type: "footer", purpose: "Telemetry status and open source repositories" },
      ],
      ctaStrategy: {
        primaryLabel: "Start Free Cluster",
        secondaryLabel: "Read the Docs",
        layoutVariant: "banner",
        formPlacement: "before_footer",
      },
      animationDirection: {
        preset: motionStyle !== "auto" ? motionStyle : "experimental",
        intensity: "high",
      },
    };
  }

  // 3. Creative Design Agency / Portfolio / Avant-Garde Studio
  if (domain === "portfolio_agency" || pLower.includes("agency") || pLower.includes("studio") || pLower.includes("creative director") || pLower.includes("design agency")) {
    return {
      industryAndAudience: "Venture-backed founders and CMOs seeking transformative brand identity",
      conversionObjective: "Commission Studio / Project Inquiry",
      brandPersonality: "Provocative, monumental, uncompromising craft",
      visualDirection: direction !== "auto" ? direction : "experimental",
      density: "editorial",
      palette: {
        name: "Gallery Titanium & Pure Silver",
        bg: "#080808",
        text: "#FBFBFB",
        accent: "#E4E4E7",
        surface: "#121212",
        border: "#27272A",
        muted: "#71717A",
      },
      typography: {
        headingFont: "display",
        bodyFont: "sans",
        rationale: "Display typography creates monumental visual tension and editorial drama.",
      },
      heroComposition: "large_typography",
      heroRationale: "Massive scale headline makes an uncompromising creative statement.",
      sectionSequence: [
        { type: "navbar", purpose: "Minimalist navigation and contact prompt" },
        { type: "hero", variant: "large_typography", purpose: "Monumental headline manifesto with kinetic ticker" },
        { type: "showcase", variant: "cards", purpose: "Curated exhibition of award-winning case studies" },
        { type: "stats", variant: "giant_numbers", purpose: "Impact metrics and global design honors" },
        { type: "features", variant: "alternating", purpose: "Creative disciplines and strategic methodology" },
        { type: "testimonials", variant: "quote_cards", purpose: "Partner and founder endorsements" },
        { type: "cta", variant: "minimal_split", purpose: "Direct studio commission inquiry" },
        { type: "footer", purpose: "Colophon and studio coordinates" },
      ],
      ctaStrategy: {
        primaryLabel: "Commission Studio",
        secondaryLabel: "View Archives",
        layoutVariant: "minimal_split",
        formPlacement: "none",
      },
      animationDirection: {
        preset: motionStyle !== "auto" ? motionStyle : "cinematic",
        intensity: "medium",
      },
    };
  }

  // 4. Real Estate Property Campaign / Luxury Residences
  if (domain === "real_estate" || pLower.includes("real estate") || pLower.includes("property") || pLower.includes("residence") || pLower.includes("estate")) {
    return {
      industryAndAudience: "High-net-worth investors and discerning families seeking landmark properties",
      conversionObjective: "Schedule Private Tour / Inquire for Dossier",
      brandPersonality: "Sovereign, timeless, architectural grandeur",
      visualDirection: direction !== "auto" ? direction : "editorial",
      density: "cinematic",
      palette: {
        name: "Imperial Midnight Navy & Champagne Gold",
        bg: "#080E1C",
        text: "#FAF9F6",
        accent: "#D4AF37",
        surface: "#0F1A30",
        border: "#1C2F55",
        muted: "#7B8EAA",
      },
      typography: {
        headingFont: "serif",
        bodyFont: "sans",
        rationale: "Serif typography embodies heritage, prestige, and timeless architectural permanence.",
      },
      heroComposition: "immersive",
      heroRationale: "Cinematic full-bleed photography establishes the sensory atmosphere of the residence.",
      sectionSequence: [
        { type: "announcement", purpose: "Private residences phase 1 release" },
        { type: "navbar", purpose: "Residences navigation and VIP inquiry button" },
        { type: "hero", variant: "immersive", purpose: "Full-bleed architectural visual with floating glass card" },
        { type: "showcase", variant: "properties", purpose: "Penthouses and signature estate floorplans" },
        { type: "stats", variant: "minimal_bar", purpose: "Acreage, ceiling heights, and concierge amenities" },
        { type: "benefits", variant: "split_list", purpose: "Private wellness amenities and biometric security" },
        { type: "testimonials", variant: "quote_cards", purpose: "Architectural and patron reviews" },
        { type: "cta", variant: "reservation", purpose: "Private viewing reservation" },
        { type: "form", purpose: "Confidential buyers dossier request" },
        { type: "footer", purpose: "Sales gallery location and legal disclosures" },
      ],
      ctaStrategy: {
        primaryLabel: "Schedule Private Tour",
        secondaryLabel: "Download Dossier",
        layoutVariant: "reservation",
        formPlacement: "before_footer",
      },
      animationDirection: {
        preset: motionStyle !== "auto" ? motionStyle : "cinematic",
        intensity: "medium",
      },
    };
  }

  // 5. Fitness and Wellness Startup / Athletic Performance
  if (pLower.includes("fitness") || pLower.includes("workout") || pLower.includes("gym") || pLower.includes("athletic") || pLower.includes("wellness startup")) {
    return {
      industryAndAudience: "Athletes, performance enthusiasts, and modern wellness seekers",
      conversionObjective: "Claim Early Access / Start Trial",
      brandPersonality: "High-intensity, visceral, bio-engineered performance",
      visualDirection: direction !== "auto" ? direction : "experimental",
      density: "compact",
      palette: {
        name: "Athletic Obsidian & High-Voltage Lime",
        bg: "#090E0B",
        text: "#F4FDF2",
        accent: "#A3E635",
        surface: "#101813",
        border: "#1D2D23",
        muted: "#7E9986",
      },
      typography: {
        headingFont: "sans",
        bodyFont: "sans",
        rationale: "Bold geometric sans delivers athletic velocity and direct motivational punch.",
      },
      heroComposition: "overlapping",
      heroRationale: "Dynamic overlapping visual geometry captures kinetic movement and biometric tracking.",
      sectionSequence: [
        { type: "navbar", purpose: "Protocol navigation and trial trigger" },
        { type: "hero", variant: "overlapping", purpose: "Layered visual composition showcasing biometric telemetry" },
        { type: "stats", variant: "giant_numbers", purpose: "VO2 max gains, recovery velocity, and member results" },
        { type: "features", variant: "workflow", purpose: "The 3-phase athletic progression protocol" },
        { type: "showcase", variant: "metrics", purpose: "Daily biometric strain and recovery telemetry" },
        { type: "pricing", variant: "plans", purpose: "Athletic membership tiers" },
        { type: "testimonials", variant: "quote_cards", purpose: "Pro athlete testimonials and community reviews" },
        { type: "cta", variant: "banner", purpose: "Early access membership invitation" },
        { type: "footer", purpose: "Platform status and legal disclosures" },
      ],
      ctaStrategy: {
        primaryLabel: "Claim Founder Membership",
        secondaryLabel: "Explore Training Protocol",
        layoutVariant: "banner",
        formPlacement: "none",
      },
      animationDirection: {
        preset: motionStyle !== "auto" ? motionStyle : "experimental",
        intensity: "high",
      },
    };
  }

  // 6. Premium Fashion E-Commerce / Haute Couture / Modern Apparel
  if (domain === "ecommerce" || pLower.includes("fashion") || pLower.includes("apparel") || pLower.includes("clothing") || pLower.includes("couture") || pLower.includes("garment")) {
    return {
      industryAndAudience: "Style-conscious cultural curators and luxury apparel collectors",
      conversionObjective: "Pre-Order Seasonal Drop / Enter Private Salon",
      brandPersonality: "Avant-garde, sculptural, quiet sovereignty",
      visualDirection: direction !== "auto" ? direction : "editorial",
      density: "spacious",
      palette: {
        name: "Ebony Obsidian & Champagne Warmth",
        bg: "#0C0B0A",
        text: "#F7F5F0",
        accent: "#D9C3A5",
        surface: "#141210",
        border: "#23201C",
        muted: "#948C83",
      },
      typography: {
        headingFont: "serif",
        bodyFont: "sans",
        rationale: "Serif typography lends high-fashion editorial distinction.",
      },
      heroComposition: "large_typography",
      heroRationale: "Monumental typography headline establishes the collection's creative thesis.",
      sectionSequence: [
        { type: "announcement", purpose: "Edition 04 global pre-order release" },
        { type: "navbar", purpose: "Collection index and bag trigger" },
        { type: "hero", variant: "large_typography", purpose: "Monumental statement hero with collection ticker" },
        { type: "showcase", variant: "cards", purpose: "Lookbook garments and sculptural silhouettes" },
        { type: "benefits", variant: "split_list", purpose: "Artisan mill provenance and sustainable raw silk" },
        { type: "testimonials", variant: "quote_cards", purpose: "Vogue and fashion editorial acclaim" },
        { type: "cta", variant: "minimal_split", purpose: "Private runway access and waitlist invitation" },
        { type: "footer", purpose: "Atelier coordinates and stockist directory" },
      ],
      ctaStrategy: {
        primaryLabel: "Pre-Order Edition 04",
        secondaryLabel: "View Lookbook",
        layoutVariant: "minimal_split",
        formPlacement: "none",
      },
      animationDirection: {
        preset: motionStyle !== "auto" ? motionStyle : "cinematic",
        intensity: "low",
      },
    };
  }

  // Default Editorial Studio Plan
  return {
    industryAndAudience: "Modern digital enterprise and discerning patrons",
    conversionObjective: "Initiate Partnership / Get Started",
    brandPersonality: "Elevated, intentional, architecturally refined",
    visualDirection: direction !== "auto" ? direction : "editorial",
    density: "editorial",
    palette: {
      name: "Modern Charcoal & Electric Amber",
      bg: "#0B0D0C",
      text: "#F5F5F0",
      accent: "#FF9900",
      surface: "#121514",
      border: "#232825",
      muted: "#8E928F",
    },
    typography: {
      headingFont: "display",
      bodyFont: "sans",
      rationale: "High-contrast display heading paired with utilitarian body sans.",
    },
    heroComposition: "asymmetric",
    heroRationale: "Asymmetric split layout balances bold value proposition with proof media.",
    sectionSequence: [
      { type: "navbar", purpose: "Navigation and primary CTA" },
      { type: "hero", variant: "asymmetric", purpose: "Asymmetric editorial split with dynamic framing" },
      { type: "logo_strip", purpose: "Ecosystem partners and patrons" },
      { type: "features", variant: "bento", purpose: "Modular architectural capabilities" },
      { type: "showcase", variant: "cards", purpose: "Selected portfolio works" },
      { type: "testimonials", variant: "quote_cards", purpose: "Client outcomes and perspectives" },
      { type: "cta", variant: "minimal_split", purpose: "High-intent conversion" },
      { type: "footer", purpose: "Brand colophon and legal notes" },
    ],
    ctaStrategy: {
      primaryLabel: "Initiate Experience",
      secondaryLabel: "Explore Work",
      layoutVariant: "minimal_split",
      formPlacement: "none",
    },
    animationDirection: {
      preset: motionStyle !== "auto" ? motionStyle : "cinematic",
      intensity: "medium",
    },
  };
}

/**
 * Stage 1: Ask Gemini to act as Executive Creative Director and formulate a DesignPlan.
 */
export async function generateDesignPlan({
  prompt,
  direction = "auto",
  themePreference = "auto",
  motionStyle = "auto",
  imageParts = [],
  genAI,
  candidateModels = PREFERRED_MODELS,
  requestId = `plan_${Date.now()}`,
}) {
  console.log(`[FORMA_DIAGNOSTICS] [${requestId}] [STAGE_1_DESIGN_INTELLIGENCE_STARTED] Prompt: "${prompt.slice(0, 60)}..."`);

  const userInstruction = `
User Brief: "${prompt}"
${direction !== "auto" ? `Client Requested Direction: ${direction}` : "Client Direction: Autonomous (infer optimal creative direction)"}
${themePreference !== "auto" && themePreference !== "ai_suggested" ? `Client Requested Theme: ${themePreference}` : "Client Theme: Autonomous (formulate bespoke color palette tailored to brand mood)"}
${motionStyle !== "auto" ? `Client Requested Motion: ${motionStyle}` : "Client Motion: Autonomous (select optimal motion preset)"}
${imageParts.length > 0 ? `Design Reference Note: ${imageParts.length} design screenshot(s) attached. Extract their spacing rhythm and contrast principles without copying trademarks.` : ""}

ART DIRECTION DIRECTIVES:
1. Infer the industry, demographic, and conversion goal.
2. Choose an intentional heroComposition ("saas_mockup", "large_typography", "minimal_luxury", "overlapping", "immersive", "asymmetric", or "centered") that uniquely suits this product.
3. Select an authentic sectionSequence of 6 to 10 sections. DO NOT follow a fixed template sequence!
4. Formulate a custom color palette with rich hex colors for bg, text, accent, surface, border, and muted.
5. Return ONLY pure parseable JSON conforming to the DesignPlan contract.
`;

  const payload = imageParts.length > 0 ? [...imageParts, userInstruction] : userInstruction;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: DESIGN_INTELLIGENCE_SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const start = Date.now();
      const res = await model.generateContent(payload);
      let text = res.response.text();
      const dur = Date.now() - start;

      if (text && text.trim().length > 0) {
        let clean = text.trim();
        if (clean.startsWith("```")) {
          clean = clean.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
        }
        const firstB = clean.indexOf("{");
        const lastB = clean.lastIndexOf("}");
        if (firstB !== -1 && lastB !== -1 && lastB > firstB) {
          clean = clean.substring(firstB, lastB + 1);
        }
        const plan = JSON.parse(clean);
        if (plan && plan.palette && plan.heroComposition && Array.isArray(plan.sectionSequence)) {
          console.log(
            `[FORMA_DIAGNOSTICS] [${requestId}] [STAGE_1_SUCCESS] Model: ${modelName}, Dur: ${dur}ms, Hero: ${plan.heroComposition}, Sections: ${plan.sectionSequence.map((s) => s.type).join(", ")}`
          );
          return plan;
        }
      }
    } catch (err) {
      console.warn(`[FORMA_DIAGNOSTICS] [${requestId}] Stage 1 model ${modelName} failed: ${err.message}`);
    }
  }

  console.log(`[FORMA_DIAGNOSTICS] [${requestId}] Using autonomous fallback DesignPlan`);
  return generateAutonomousDesignPlanFallback(prompt, direction, themePreference, motionStyle);
}

/**
 * Stage 2: Synthesize full landing page adhering strictly to the DesignPlan.
 */
export async function synthesizePageWithDesignPlan({
  prompt,
  designPlan,
  imageParts = [],
  genAI,
  candidateModels = PREFERRED_MODELS,
  requestId = `syn_${Date.now()}`,
}) {
  console.log(
    `[FORMA_DIAGNOSTICS] [${requestId}] [STAGE_2_PAGE_SYNTHESIS_STARTED] Hero: ${designPlan.heroComposition}, Palette: ${designPlan.palette.name}`
  );

  const userInstruction = `
User Brief: "${prompt}"

APPROVED DESIGN PLAN TO EXECUTE:
- Industry: ${designPlan.industryAndAudience}
- Conversion Goal: ${designPlan.conversionObjective}
- Brand Personality: ${designPlan.brandPersonality}
- Visual Direction: ${designPlan.visualDirection}
- Density: ${designPlan.density}
- Color Palette: ${designPlan.palette.name}
  * bg: "${designPlan.palette.bg}"
  * text: "${designPlan.palette.text}"
  * accent: "${designPlan.palette.accent}"
  * surface: "${designPlan.palette.surface}"
  * border: "${designPlan.palette.border}"
  * muted: "${designPlan.palette.muted}"
- Typography:
  * headingFont: "${designPlan.typography.headingFont}"
  * bodyFont: "${designPlan.typography.bodyFont}"
- Hero Composition: "${designPlan.heroComposition}"
- Motion: preset="${designPlan.animationDirection.preset}", intensity="${designPlan.animationDirection.intensity}"
- Required Section Sequence (MUST BE IN THIS EXACT ORDER):
${JSON.stringify(designPlan.sectionSequence, null, 2)}
- CTA Strategy:
${JSON.stringify(designPlan.ctaStrategy, null, 2)}

SYNTHESIS INSTRUCTIONS:
1. Follow the required section sequence EXACTLY. Do NOT add missing sections or alter their order.
2. In the hero section, set layoutVariant to "${designPlan.heroComposition}".
   ${designPlan.heroComposition === "saas_mockup" ? "Provide rich statsPills and mockup metrics." : ""}
   ${designPlan.heroComposition === "large_typography" ? "Provide a bold 4-6 word headline, a ticker array, and split CTAs." : ""}
   ${designPlan.heroComposition === "minimal_luxury" ? "Provide refined badge, elegant serif headline, and understated CTA." : ""}
   ${designPlan.heroComposition === "overlapping" ? "Provide rich card geometry and dynamic badge." : ""}
   ${designPlan.heroComposition === "immersive" ? "Provide cinematic visual hero headline and dark glass card details." : ""}
3. For each section, provide authentic, rich, non-empty items.
4. Output purely valid JSON adhering to the Forma page contract.
`;

  const payload = imageParts.length > 0 ? [...imageParts, userInstruction] : userInstruction;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: PAGE_SYNTHESIS_SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.75,
        },
      });

      const start = Date.now();
      const res = await model.generateContent(payload);
      const text = res.response.text();
      const dur = Date.now() - start;

      if (text && text.trim().length > 0) {
        let clean = text.trim();
        if (clean.startsWith("```")) {
          clean = clean.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
        }
        const firstB = clean.indexOf("{");
        const lastB = clean.lastIndexOf("}");
        if (firstB !== -1 && lastB !== -1 && lastB > firstB) {
          clean = clean.substring(firstB, lastB + 1);
        }
        const parsed = JSON.parse(clean);
        console.log(
          `[FORMA_DIAGNOSTICS] [${requestId}] [STAGE_2_SUCCESS] Model: ${modelName}, Dur: ${dur}ms, Sections: ${parsed.sections?.length || 0}`
        );
        return parsed;
      }
    } catch (err) {
      console.warn(`[FORMA_DIAGNOSTICS] [${requestId}] Stage 2 model ${modelName} failed: ${err.message}`);
    }
  }

  throw new Error("Stage 2 page synthesis failed across candidate models.");
}

/**
 * Normalizes raw model output to guarantee contract adherence and prevent empty shells.
 */
function normalizeGeminiOutput(rawJson, prompt, designPlan = null) {
  if (!rawJson || typeof rawJson !== "object") {
    throw new Error("Gemini returned invalid non-object JSON.");
  }

  if (rawJson.pageConfig && typeof rawJson.pageConfig === "object") rawJson = rawJson.pageConfig;
  else if (rawJson.landingPage && typeof rawJson.landingPage === "object") rawJson = rawJson.landingPage;
  else if (rawJson.config && typeof rawJson.config === "object") rawJson = rawJson.config;

  const domain = detectDomainFromPrompt(prompt);

  // 1. Ensure version
  rawJson.version = "1.0";

  // 2. Creative direction & metadata
  const resolvedDirection =
    designPlan?.visualDirection ||
    rawJson.designConcept?.visualDirection ||
    rawJson.metadata?.creativeDirection ||
    "editorial";

  if (!rawJson.metadata || typeof rawJson.metadata !== "object") rawJson.metadata = {};
  if (!rawJson.metadata.title) rawJson.metadata.title = rawJson.title || prompt.slice(0, 50).trim();
  if (!rawJson.metadata.description) rawJson.metadata.description = rawJson.description || "Bespoke digital experience tailored for this brand.";
  if (!rawJson.metadata.category) rawJson.metadata.category = domain.replace(/_/g, " ").toUpperCase();
  rawJson.metadata.creativeDirection = resolvedDirection;
  if (!rawJson.metadata.author) rawJson.metadata.author = "Forma AI";
  if (!rawJson.metadata.createdAt) rawJson.metadata.createdAt = new Date().toISOString();

  // 3. Design Concept
  rawJson.designConcept = {
    businessType: designPlan?.industryAndAudience || domain.replace(/_/g, " "),
    targetAudience: designPlan?.industryAndAudience || "Discerning clientele",
    conversionGoal: designPlan?.conversionObjective || "Explore & Engage",
    brandPersonality: designPlan?.brandPersonality || "Elevated and intentional",
    visualDirection: resolvedDirection,
    layoutComposition: designPlan?.heroComposition || "bespoke",
    colorMood: designPlan?.palette?.name || "Curated Palette",
  };
  rawJson.metadata.designConcept = rawJson.designConcept;

  // 4. Typography
  const headingFont = designPlan?.typography?.headingFont || rawJson.typography?.headingFont || "display";
  const bodyFont = designPlan?.typography?.bodyFont || rawJson.typography?.bodyFont || "sans";
  rawJson.typography = { headingFont, bodyFont };

  // 5. Motion
  const motionPreset = designPlan?.animationDirection?.preset || rawJson.motion?.preset || "cinematic";
  const motionIntensity = designPlan?.animationDirection?.intensity || rawJson.motion?.intensity || "medium";
  rawJson.motion = { preset: motionPreset, intensity: motionIntensity };

  // 6. Theme: Preserve AI's custom palette or DesignPlan palette
  if (designPlan?.palette) {
    rawJson.theme = {
      id: "bespoke-theme",
      name: designPlan.palette.name || "Bespoke Palette",
      bg: designPlan.palette.bg || "#0B0D0C",
      text: designPlan.palette.text || "#F5F5F0",
      accent: designPlan.palette.accent || "#C5FF65",
      surface: designPlan.palette.surface || "#121514",
      border: designPlan.palette.border || "#232825",
      muted: designPlan.palette.muted || "#8E928F",
    };
  } else {
    const hasValidCustomTheme =
      rawJson.theme &&
      typeof rawJson.theme === "object" &&
      typeof rawJson.theme.accent === "string" &&
      rawJson.theme.accent.startsWith("#") &&
      typeof rawJson.theme.bg === "string" &&
      rawJson.theme.bg.startsWith("#");

    if (hasValidCustomTheme) {
      if (!rawJson.theme.id) rawJson.theme.id = "custom-palette";
      if (!rawJson.theme.name) rawJson.theme.name = "Bespoke Palette";
      if (!rawJson.theme.text || !rawJson.theme.text.startsWith("#")) rawJson.theme.text = "#F5F5F0";
      if (!rawJson.theme.surface || !rawJson.theme.surface.startsWith("#")) rawJson.theme.surface = "#121514";
      if (!rawJson.theme.border || !rawJson.theme.border.startsWith("#")) rawJson.theme.border = "#232825";
      if (!rawJson.theme.muted || !rawJson.theme.muted.startsWith("#")) rawJson.theme.muted = "#8E928F";
    } else {
      rawJson.theme = { id: "forma-dark", name: "Dark Modern", bg: "#0B0D0C", text: "#F5F5F0", accent: "#C5FF65", surface: "#121514", border: "#232825", muted: "#8E928F" };
    }
  }

  // 7. Ensure sections and defensive sanitization
  if (Array.isArray(rawJson.sections)) {
    const validTypes = new Set([
      "announcement", "navbar", "hero", "logo_strip", "features", "stats",
      "benefits", "showcase", "gallery", "video_showcase", "testimonials",
      "pricing", "faq", "cta", "form", "footer",
    ]);

    const sanitizedSections = [];

    rawJson.sections.forEach((section, idx) => {
      if (!section || !validTypes.has(section.type)) return;

      const id = section.id || `${section.type}-${idx + 1}`;
      const isVisible = section.isVisible !== false;
      const content = section.content || {};

      // Defensive checks: Omit empty collections to avoid empty cards
      if (section.type === "features" && (!Array.isArray(content.items) || content.items.length === 0)) return;
      if (section.type === "showcase" && (!Array.isArray(content.items) || content.items.length === 0)) return;
      if (section.type === "benefits" && (!Array.isArray(content.items) || content.items.length === 0)) return;

      if (section.type === "logo_strip") {
        if (!Array.isArray(content.logos) || content.logos.length === 0) return;
        content.logos = content.logos.map((l) => (typeof l === "string" ? { name: l } : l));
      }

      if (section.type === "stats") {
        const list = Array.isArray(content.stats) && content.stats.length > 0
          ? content.stats
          : Array.isArray(content.items) && content.items.length > 0
          ? content.items
          : [];
        if (list.length === 0) return;
        const normalizedStats = list.map((s) => ({
          metric: s?.metric || s?.value || s?.number || s?.stat || "100%",
          label: s?.label || s?.title || s?.name || "Metric",
          description: s?.description || "",
        }));
        content.stats = normalizedStats;
        content.items = normalizedStats;
        if (!content.layoutVariant) content.layoutVariant = "cards";
      }

      if (section.type === "pricing") {
        const tiers = Array.isArray(content.plans) && content.plans.length > 0
          ? content.plans
          : Array.isArray(content.tiers) && content.tiers.length > 0
          ? content.tiers
          : Array.isArray(content.items) && content.items.length > 0
          ? content.items
          : [];
        if (tiers.length === 0) return;
        content.tiers = tiers;
        content.plans = tiers;
        content.items = tiers;
      }

      if (section.type === "testimonials") {
        const items = Array.isArray(content.items) && content.items.length > 0
          ? content.items
          : Array.isArray(content.testimonials) && content.testimonials.length > 0
          ? content.testimonials
          : [];
        if (items.length === 0) return;
        content.testimonials = items;
        content.items = items;
      }

      if (section.type === "faq") {
        const items = Array.isArray(content.questions) && content.questions.length > 0
          ? content.questions
          : Array.isArray(content.faqs) && content.faqs.length > 0
          ? content.faqs
          : Array.isArray(content.items) && content.items.length > 0
          ? content.items
          : [];
        if (items.length === 0) return;
        const normalizedFaqs = items.map((q) => ({
          question: q.question || q.q || q.title || "Frequently Asked Question",
          answer: q.answer || q.a || q.description || "",
        }));
        content.questions = normalizedFaqs;
        content.faqs = normalizedFaqs;
        content.items = normalizedFaqs;
      }

      if (section.type === "hero") {
        if (!content.primaryCta) {
          content.primaryCta = { label: "Explore", href: "#features" };
        }
        if (designPlan?.heroComposition) {
          content.layoutVariant = designPlan.heroComposition;
        } else if (!content.layoutVariant) {
          content.layoutVariant = (domain === "ai_startup" || domain === "saas") ? "saas_mockup" : "asymmetric";
        }
      }

      if (section.type === "form") {
        if (!content.sectionTitle) content.sectionTitle = "Get in Touch";
        if (!content.submitButtonText) content.submitButtonText = "Send Message";
        if (!content.successMessage) content.successMessage = "Your submission was received. We will respond promptly.";
        if (!Array.isArray(content.fields) || content.fields.length === 0) {
          content.fields = [
            { id: "f-name", name: "fullName", label: "Full Name", type: "text", placeholder: "Elena Vance", required: true, width: "half" },
            { id: "f-email", name: "email", label: "Email Address", type: "email", placeholder: "elena@company.com", required: true, width: "half" },
            { id: "f-message", name: "message", label: "Message / Inquiry", type: "textarea", placeholder: "How can we assist you?", required: true, width: "full" },
          ];
        } else {
          content.fields = content.fields.map((f, fIdx) => {
            const options = Array.isArray(f.options)
              ? f.options.map((opt) =>
                  typeof opt === "string"
                    ? { label: opt, value: opt.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "option" }
                    : {
                        label: opt?.label || opt?.value || opt?.text || "Option",
                        value: opt?.value || (opt?.label ? opt.label.toLowerCase().replace(/[^a-z0-9]+/g, "_") : "option"),
                      }
                )
              : [];
            return {
              id: f.id || `f-${fIdx + 1}`,
              name: f.name || `field_${fIdx + 1}`,
              label: f.label || f.name || `Field ${fIdx + 1}`,
              type: f.type === "tel" ? "phone" : (f.type || "text"),
              placeholder: f.placeholder || "",
              isRequired: f.isRequired !== undefined ? !!f.isRequired : !!f.required,
              width: f.width === "half" ? "half" : "full",
              options,
            };
          });
        }
      }

      if (section.type === "footer" && typeof content.brand === "object" && content.brand !== null) {
        content.brand = content.brand.name || content.brand.title || "Forma Studio";
      }

      sanitizedSections.push({
        id,
        type: section.type,
        isVisible,
        content,
      });
    });

    rawJson.sections = sanitizedSections;
  }

  return rawJson;
}

/**
 * Generates landing page configuration using Google Gemini API.
 * Uses a Two-Stage Design Intelligence Pipeline:
 * Stage 1: Creative Director creates bespoke Art Direction & Layout Architecture Plan.
 * Stage 2: Page Synthesis executes that plan with rich domain-specific content.
 */
export async function generateLandingPageWithGemini({
  prompt,
  direction = "auto",
  themePreference = "auto",
  motionStyle = "auto",
  referenceImages = [],
  referenceUrls = [],
  requestId = `req_${Date.now()}`,
}) {
  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
    throw new Error("Please provide a prompt describing your landing page idea.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in your .env or .env.local file to enable live Gemini generation."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const detectedDomain = detectDomainFromPrompt(prompt);

  // Process reference images (multimodal support)
  const imageParts = [];
  const rawReferences = [
    ...(Array.isArray(referenceImages) ? referenceImages : [referenceImages]),
    ...(Array.isArray(referenceUrls) ? referenceUrls : [referenceUrls]),
  ].filter(Boolean);

  for (const ref of rawReferences) {
    try {
      const part = await processReferenceImage(ref);
      if (part) imageParts.push(part);
    } catch (partErr) {
      console.warn(`[FORMA_DIAGNOSTICS] [${requestId}] Error processing reference:`, partErr.message);
    }
  }

  console.log(
    `[FORMA_DIAGNOSTICS] [${requestId}] [TWO_STAGE_PIPELINE_START] Prompt: "${prompt.slice(0, 50)}...", Domain: ${detectedDomain}, Multimodal refs: ${imageParts.length}`
  );

  // STAGE 1: Formulate bespoke DesignPlan (Creative Director)
  const designPlan = await generateDesignPlan({
    prompt,
    direction,
    themePreference,
    motionStyle,
    imageParts,
    genAI,
    candidateModels: PREFERRED_MODELS,
    requestId,
  });

  // STAGE 2: Synthesize complete landing page based on the DesignPlan
  let synthesizedJson = null;
  try {
    synthesizedJson = await synthesizePageWithDesignPlan({
      prompt,
      designPlan,
      imageParts,
      genAI,
      candidateModels: PREFERRED_MODELS,
      requestId,
    });
  } catch (synErr) {
    console.warn(`[FORMA_DIAGNOSTICS] [${requestId}] Stage 2 synthesis failed: ${synErr.message}. Attempting single-shot recovery.`);
    throw synErr;
  }

  // Normalize structure to ensure contract adherence & non-empty sections
  const normalized = normalizeGeminiOutput(synthesizedJson, prompt, designPlan);

  // Enrich images with domain-specific curated high-res assets
  const enrichedJson = enrichPageConfigWithDomainImages(normalized, prompt);

  // Validate output strictly with Zod
  const validation = validatePageConfig(enrichedJson);
  if (!validation.success) {
    const errDetails = validation.errors.map((e) => e.path + ": " + e.message).join("; ");
    console.warn(
      `[FORMA_DIAGNOSTICS] [${requestId}] [SCHEMA_VALIDATION_FAILED] Errors: ${errDetails}`
    );
    throw new Error(`AI output did not match production page contract: ${errDetails}`);
  }

  console.log(
    `[FORMA_DIAGNOSTICS] [${requestId}] [PIPELINE_COMPLETE] Hero: ${validation.data.sections.find((s) => s.type === "hero")?.content?.layoutVariant}, Palette: ${validation.data.theme.name}, Sections: ${validation.data.sections.length} (${validation.data.sections.map((s) => s.type).join(", ")})`
  );

  return validation.data;
}

/**
 * Surgically refines an existing page configuration with targeted user instructions.
 * Preserves all untouched sections, design tokens, and content.
 */
export async function refineLandingPageWithGemini({
  pageConfig,
  refinementPrompt,
  sectionId = null,
  requestId = "refine_" + Date.now(),
}) {
  console.log(`[FORMA_DIAGNOSTICS] [${requestId}] [REFINEMENT_START] Prompt: "${refinementPrompt}"`);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const pLower = (refinementPrompt || "").toLowerCase();

  const userInstruction = `
You are the Executive Creative Director and Senior Frontend Engineer at Forma Studio.
The user wants to iteratively refine an existing landing page according to their instruction.

USER REFINEMENT INSTRUCTION:
"${refinementPrompt}"

${sectionId ? `TARGET SECTION ID: "${sectionId}"` : "TARGET: Entire landing page"}

CURRENT PAGE CONFIGURATION:
${JSON.stringify(pageConfig, null, 2)}

INSTRUCTIONS:
1. Apply the user's requested modifications accurately.
2. PRESERVE all unaffected sections, text, metadata, and design tokens that the user did not ask to change.
3. If changing theme/palette, update theme.bg, theme.text, theme.accent, theme.surface, theme.border, theme.muted.
4. If modifying layout, change section.content.layoutVariant or content attributes appropriately.
5. If changing typography, update typography.headingFont or typography.bodyFont.
6. Return ONLY the complete, updated valid JSON object matching the Forma PageConfig schema without markdown formatting or code blocks.
`;

  if (process.env.GEMINI_API_KEY) {
    for (const modelName of PREFERRED_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(userInstruction);
        const text = result.response.text();

        let cleanText = text.trim();
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
        }
        const firstB = cleanText.indexOf("{");
        const lastB = cleanText.lastIndexOf("}");
        if (firstB !== -1 && lastB !== -1 && lastB > firstB) {
          cleanText = cleanText.substring(firstB, lastB + 1);
        }

        const parsed = JSON.parse(cleanText);
        const validated = validatePageConfig(parsed);
        if (validated.success) {
          console.log(`[FORMA_DIAGNOSTICS] [${requestId}] [REFINEMENT_SUCCESS] Model: ${modelName}`);
          return validated.data;
        }
      } catch (err) {
        console.warn(`[FORMA_DIAGNOSTICS] [${requestId}] Model ${modelName} refinement failed: ${err.message}`);
      }
    }
  }

  // Resilient Heuristic Fallback Refinement
  console.log(`[FORMA_DIAGNOSTICS] [${requestId}] Applying intelligent heuristic refinement`);
  const clone = JSON.parse(JSON.stringify(pageConfig));

  if (pLower.includes("orange") || pLower.includes("amber") || pLower.includes("warm")) {
    clone.theme = {
      ...clone.theme,
      bg: "#140E0A",
      text: "#FAF5EE",
      accent: "#FF7A00",
      surface: "#1E1712",
      border: "#342820",
      muted: "#9E8E82",
    };
  } else if (pLower.includes("ivory") || pLower.includes("cream") || pLower.includes("light")) {
    clone.theme = {
      ...clone.theme,
      bg: "#FAF8F5",
      text: "#18181B",
      accent: "#15803D",
      surface: "#FFFFFF",
      border: "#E4E4E7",
      muted: "#71717A",
    };
  } else if (pLower.includes("cyber") || pLower.includes("neon") || pLower.includes("cyan")) {
    clone.theme = {
      ...clone.theme,
      bg: "#05080E",
      text: "#F0F6FC",
      accent: "#00F0FF",
      surface: "#0C121D",
      border: "#1C2738",
      muted: "#7E8FA4",
    };
  } else if (pLower.includes("luxury") || pLower.includes("gold") || pLower.includes("champagne")) {
    clone.theme = {
      ...clone.theme,
      bg: "#080B10",
      text: "#F7F5F0",
      accent: "#D4AF37",
      surface: "#0F141C",
      border: "#2A2518",
      muted: "#969082",
    };
    clone.typography = { ...clone.typography, headingFont: "serif" };
  }

  if (pLower.includes("reduce") || pLower.includes("less animation") || pLower.includes("subtle")) {
    clone.motion = { ...clone.motion, preset: "subtle" };
  } else if (pLower.includes("high motion") || pLower.includes("experimental") || pLower.includes("kinetic")) {
    clone.motion = { ...clone.motion, preset: "experimental" };
  }

  const heroSection = clone.sections.find((s) => s.type === "hero");
  if (heroSection) {
    if (pLower.includes("hero") && (pLower.includes("premium") || pLower.includes("editorial"))) {
      heroSection.content.layoutVariant = "immersive";
    } else if (pLower.includes("mockup") || pLower.includes("saas")) {
      heroSection.content.layoutVariant = "saas_mockup";
    } else if (pLower.includes("split")) {
      heroSection.content.layoutVariant = "asymmetric";
    } else if (pLower.includes("typography") || pLower.includes("statement")) {
      heroSection.content.layoutVariant = "large_typography";
    }
  }

  const finalValidation = validatePageConfig(clone);
  if (finalValidation.success) {
    return finalValidation.data;
  }
  return pageConfig;
}
