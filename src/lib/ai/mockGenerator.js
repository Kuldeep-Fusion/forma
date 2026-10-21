import { validatePageConfig } from "../validation/pageConfigSchema.js";
import { detectDomainFromPrompt, enrichPageConfigWithDomainImages, getDomainImage } from "./imageResolver.js";

/**
 * Domain-specific architectural blueprints used by the synthesis engine
 * when running in fallback/synthesis mode.
 */
const DOMAIN_BLUEPRINTS = {
  skincare: {
    businessType: "Luxury Organic Skincare",
    targetAudience: "Discerning women seeking clean, minimalist, high-efficacy botanicals",
    conversionGoal: "Order Discovery Ritual Set",
    brandPersonality: "Serene, botanical, sensual, understated luxury",
    visualDirection: "minimal",
    layoutComposition: "editorial-split-ritual",
    title: "L'Élixir Botanique — Pure Botanical Alchemy",
    description: "Certified organic bio-active serums formulated with cold-pressed Alpine botanicals for timeless cellular vitality.",
    category: "Luxury Skincare",
    badge: "100% Bio-Active Formulations",
    theme: {
      id: "botanical-sage",
      name: "Botanical Sage & Alabaster",
      bg: "#0E1210",
      text: "#F7F5F0",
      accent: "#C2D4B0",
      surface: "#141A16",
      border: "#202A23",
      muted: "#8E9E94",
    },
    typography: { headingFont: "serif", bodyFont: "sans" },
    motion: { preset: "subtle", intensity: "low" },
    sections: [
      {
        id: "announce-1",
        type: "announcement",
        isVisible: true,
        content: {
          badge: "Complimentary Ritual",
          message: "Receive the Deluxe Botanical Treatment Oil with your first ritual order.",
          linkText: "Claim Gift",
          linkHref: "#showcase-1",
        },
      },
      {
        id: "hero-1",
        type: "hero",
        isVisible: true,
        content: {
          badge: "Cold-Pressed Alpine Botanicals",
          headline: "Skincare reduced to its purest potency.",
          subheadline: "Formulated without synthetic stabilizers or water dilution. Experience biological vitality synthesized from high-altitude wild botanicals.",
          primaryCta: { label: "Explore The Ritual Collection", href: "#showcase-1" },
          secondaryCta: { label: "Our Sourcing Manifesto", href: "#benefits-1" },
          media: {
            type: "image",
            url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80",
            alt: "L'Élixir Botanique organic bottles on natural stone",
            caption: "Small-batch glass flacons hand-poured in the French Alps",
          },
          layoutVariant: "split",
        },
      },
      {
        id: "benefits-1",
        type: "benefits",
        isVisible: true,
        content: {
          sectionTitle: "The Purity Standard",
          subtitle: "Uncompromising botanical discipline backed by clinical dermatology.",
          layoutVariant: "cards",
          items: [
            { title: "Zero Water Dilution", description: "Every droplet is 100% cold-pressed organic botanical hydrosol and active lipids.", icon: "leaf" },
            { title: "High-Altitude Bio-Actives", description: "Wild-harvested edelweiss and rosehip with 4x antioxidant concentration.", icon: "sparkle" },
          ],
        },
      },
      {
        id: "features-1",
        type: "features",
        isVisible: true,
        content: {
          sectionTitle: "The Three-Step Restorative Ritual",
          subtitle: "Engineered to strengthen the epidermal lipid barrier in 14 days.",
          tag: "Daily Regimen",
          layoutVariant: "bento",
          items: [
            { title: "Step 01 // Cellular Hydrosol Infusion", description: "Deeply quenches cellular thirst with fermented birch sap and low-molecular hyaluronic acid.", metric: "100% Organic", tag: "Hydration" },
            { title: "Step 02 // Active Vitamin C Ester", description: "Neutralizes free radicals and restores radiant luminosity without sensitivity.", metric: "15% Ester", tag: "Brightening" },
            { title: "Step 03 // Lipid Barrier Seal", description: "Locks in bio-nutrients with squalane and cold-pressed prickly pear seed oil.", metric: "48-Hour", tag: "Protection" },
          ],
        },
      },
      {
        id: "showcase-1",
        type: "showcase",
        isVisible: true,
        content: {
          sectionTitle: "The Curated Collection",
          subtitle: "Handcrafted in limited seasonal batches to preserve active nutrient vitality.",
          tag: "Curated Formulation",
          layoutVariant: "cards",
          items: [
            { title: "L'Huile Divine Active Serum", category: "Face Oil", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80", description: "Nutrient-dense overnight recovery elixir with bakuchiol.", price: "$120" },
            { title: "Crème Renaissance Hydratante", category: "Barrier Cream", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1000&q=80", description: "Deep moisture barrier balm with snow mushroom extract.", price: "$145" },
          ],
        },
      },
      {
        id: "testimonials-1",
        type: "testimonials",
        isVisible: true,
        content: {
          sectionTitle: "Clinical & Dermatological Endorsements",
          subtitle: "Trusted by holistic aestheticians and dermatological researchers.",
          layoutVariant: "quote_cards",
          items: [
            { quote: "The purity of L'Élixir Botanique transforms skin texture within days. It is the gold standard of organic luxury.", author: "Dr. Camille Laurent", role: "Holistic Dermatologist", company: "Geneva Aesthetic Institute", metric: "+98% Barrier Repair" },
          ],
        },
      },
      {
        id: "cta-1",
        type: "cta",
        isVisible: true,
        content: {
          headline: "Begin your skin renaissance.",
          subheadline: "Experience the transformative calm of wild Alpine botanicals. Ships worldwide with luxury discovery samples.",
          buttonText: "Order Discovery Ritual Kit",
          buttonHref: "#showcase-1",
          secondaryText: "Complimentary carbon-neutral express shipping on orders over $100.",
          layoutVariant: "banner",
        },
      },
      {
        id: "footer-1",
        type: "footer",
        isVisible: true,
        content: {
          brand: "L'Élixir Botanique",
          tagline: "Pure botanical alchemy.",
          copyright: `© ${new Date().getFullYear()} L'Élixir Botanique Paris. All rights reserved.`,
          links: [{ label: "Formulations", href: "#showcase-1" }, { label: "Manifesto", href: "#benefits-1" }, { label: "Ingredients", href: "#features-1" }],
        },
      },
    ],
  },

  cybersecurity: {
    businessType: "Enterprise Cyber Threat Detection",
    targetAudience: "CISOs, SecOps directors, and enterprise defense architects",
    conversionGoal: "Schedule Autonomous Threat Surface Audit",
    brandPersonality: "Vigilant, parametric, cybernetic, mission-critical",
    visualDirection: "futuristic",
    layoutComposition: "asymmetric-threat-matrix",
    title: "Vektor Shield — Autonomous Threat Interception",
    description: "Sub-millisecond adversarial threat neutralization powered by real-time neural kernel telemetry.",
    category: "Cybersecurity",
    badge: "SOC2 Type II Certified",
    theme: {
      id: "cyber-emerald",
      name: "Terminal Void & Emerald",
      bg: "#060A0D",
      text: "#E6F3EA",
      accent: "#00FF88",
      surface: "#0D1418",
      border: "#18262C",
      muted: "#7B9688",
    },
    typography: { headingFont: "mono", bodyFont: "sans" },
    motion: { preset: "experimental", intensity: "high" },
    sections: [
      {
        id: "announce-1",
        type: "announcement",
        isVisible: true,
        content: {
          badge: "Zero-Day Advisory",
          message: "Vektor Shield autonomously intercepted 14 novel zero-day exploits in Q3 benchmark.",
          linkText: "Read Intelligence Brief",
          linkHref: "#features-1",
        },
      },
      {
        id: "hero-1",
        type: "hero",
        isVisible: true,
        content: {
          badge: "Autonomous EDR Pipeline",
          headline: "Neutralize threats before memory execution.",
          subheadline: "Deterministic kernel-level behavioral sandboxing stops ransomware, memory injection, and supply-chain compromises in 0.4 milliseconds.",
          primaryCta: { label: "Deploy Attack Surface Audit", href: "#cta-1" },
          secondaryCta: { label: "View Threat Intelligence", href: "#stats-1" },
          media: {
            type: "image",
            url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80",
            alt: "Cybersecurity operations command center",
            caption: "Autonomous global sensor grid analyzing 42B events/sec",
          },
          layoutVariant: "asymmetric",
        },
      },
      {
        id: "logo-1",
        type: "logo_strip",
        isVisible: true,
        content: {
          title: "Vetted and deployed by defense infrastructure and Fortune 500 CISOs",
          logos: [{ name: "AeroDynamics" }, { name: "FinSecure Global" }, { name: "Apex Cloud" }, { name: "Vektor Telemetry" }],
        },
      },
      {
        id: "stats-1",
        type: "stats",
        isVisible: true,
        content: {
          sectionTitle: "Empirical Threat Neutralization",
          subtitle: "Benchmarked against real-world nation-state intrusion tactics.",
          layoutVariant: "cards",
          stats: [
            { metric: "0.4ms", label: "Kernel Interception", description: "Sub-millisecond mitigation" },
            { metric: "99.998%", label: "Autonomous Accuracy", description: "Zero human intervention" },
            { metric: "0%", label: "Host Overhead", description: "eBPF zero-footprint engine" },
          ],
        },
      },
      {
        id: "features-1",
        type: "features",
        isVisible: true,
        content: {
          sectionTitle: "Zero-Trust Architecture Stack",
          subtitle: "Re-engineered from hardware micro-opcodes to multi-cloud VPC meshes.",
          tag: "Core Telemetry",
          layoutVariant: "bento",
          items: [
            { title: "Adversarial Memory Sandboxing", description: "Intercepts shellcode injection directly in RAM before instruction pointers execute.", metric: "0.2ms", tag: "Kernel Ring-0" },
            { title: "Synthetic Honeynet Decoys", description: "Spawns dynamic ghost infrastructure to trap reconnaissance scanners.", metric: "100% Deceptive", tag: "Active Defense" },
            { title: "Identity Blast Radius Lockdown", description: "Revokes compromised IAM tokens and service accounts within 350ms of lateral movement.", metric: "Autonomous", tag: "IAM Defense" },
          ],
        },
      },
      {
        id: "testimonials-1",
        type: "testimonials",
        isVisible: true,
        content: {
          sectionTitle: "CISO Operational Debriefs",
          subtitle: "Trusted when operational failure is not an option.",
          layoutVariant: "quote_cards",
          items: [
            { quote: "Vektor Shield caught a novel supply-chain backdoor in staging that our legacy EDR completely missed. It is indispensable.", author: "Marcus Vance", role: "CISO", company: "Apex Financial Systems", metric: "100% Ransomware Immunity" },
          ],
        },
      },
      {
        id: "cta-1",
        type: "cta",
        isVisible: true,
        content: {
          headline: "Schedule your external attack surface audit.",
          subheadline: "Uncover unmonitored shadow APIs, credential leaks, and exposed infrastructure in under 60 minutes.",
          buttonText: "Request Enterprise Security Assessment",
          buttonHref: "#",
          secondaryText: "Zero impact on production traffic. Fully non-invasive read-only scan.",
          layoutVariant: "banner",
        },
      },
      {
        id: "footer-1",
        type: "footer",
        isVisible: true,
        content: {
          brand: "Vektor Shield",
          tagline: "Autonomous threat interception.",
          copyright: `© ${new Date().getFullYear()} Vektor Shield Inc. All rights reserved.`,
          links: [{ label: "Architecture", href: "#features-1" }, { label: "Telemetry", href: "#stats-1" }, { label: "Security", href: "#" }],
        },
      },
    ],
  },

  restaurant: {
    businessType: "Italian Fine Dining Restaurant",
    targetAudience: "Discerning food lovers, wine collectors, and romantic couples",
    conversionGoal: "Reserve a Private Dining Table",
    brandPersonality: "Sensory, authentic, intimate, elevated Italian culinary mastery",
    visualDirection: "editorial",
    layoutComposition: "immersive-culinary-journey",
    title: "Osteria Del Sole — Artisanal Italian Gastronomy",
    description: "Handcrafted pasta, wood-fired hearth cooking, and rare vintage Tuscan wines in an intimate candlelit sanctuary.",
    category: "Fine Dining",
    badge: "Michelin Guide Selected",
    theme: {
      id: "tuscan-terracotta",
      name: "Tuscan Charcoal & Terracotta",
      bg: "#100D0B",
      text: "#FAF6F0",
      accent: "#E2935D",
      surface: "#17120F",
      border: "#291F1A",
      muted: "#9C8A82",
    },
    typography: { headingFont: "serif", bodyFont: "sans" },
    motion: { preset: "cinematic", intensity: "medium" },
    sections: [
      {
        id: "hero-1",
        type: "hero",
        isVisible: true,
        content: {
          badge: "Handmade Daily in Firenza Tradition",
          headline: "Where every dish tells a hundred-year story.",
          subheadline: "Centuries-old sourdough traditions, hand-rolled tajarin with Alba white truffles, and rare biodynamic vintages curated by Master Sommelier Marco Bellini.",
          primaryCta: { label: "Reserve A Table", href: "#cta-1" },
          secondaryCta: { label: "Explore Tasting Menu", href: "#showcase-1" },
          media: {
            type: "image",
            url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
            alt: "Intimate candlelit dining room at Osteria Del Sole",
            caption: "Historic exposed stone arches and candlelit intimacy",
          },
          layoutVariant: "immersive",
        },
      },
      {
        id: "showcase-1",
        type: "showcase",
        isVisible: true,
        content: {
          sectionTitle: "Seasonal Degustazione Menu",
          subtitle: "Curated daily based on morning arrivals from our organic Tuscan partner farms.",
          tag: "Autumn Harvest",
          layoutVariant: "menu",
          items: [
            { title: "Tagliolini al Tartufo Bianco d'Alba", category: "Primo", image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281084?auto=format&fit=crop&w=1000&q=80", description: "30-egg-yolk pasta tossed in mountain butter and freshly shaved white truffles.", price: "€48", badge: "Signature Dish" },
            { title: "Bistecca alla Fiorentina Chianina", category: "Secondo", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80", description: "Dry-aged 45 days over olive wood embers with rosemary sea salt.", price: "€85", badge: "Wood Hearth" },
            { title: "Torta Tradizionale al Cioccolato & Nocciole", category: "Dolce", image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1000&q=80", description: "Valrhona 72% dark chocolate with roasted Piedmont hazelnuts.", price: "€18", badge: "Dolce" },
          ],
        },
      },
      {
        id: "gallery-1",
        type: "gallery",
        isVisible: true,
        content: {
          sectionTitle: "Atmosphere & Cellar",
          subtitle: "Over 800 rare Brunello, Barolo, and Super Tuscan labels stored at perfect humidity.",
          images: [
            { url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80", caption: "Underground centuries-old cellar" },
            { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80", caption: "The Private Chef's Salon" },
            { url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80", caption: "Aperitivo at the marble bar" },
          ],
        },
      },
      {
        id: "testimonials-1",
        type: "testimonials",
        isVisible: true,
        content: {
          sectionTitle: "Critics & Praise",
          subtitle: "Recognized among Italy's finest contemporary dining institutions.",
          layoutVariant: "quote_cards",
          items: [
            { quote: "Osteria Del Sole delivers pure gastronomic transcendence. The tagliolini is nothing short of sublime.", author: "Michelin Guide Review", role: "Inspector Verdict", company: "Michelin Guide 2026", metric: "★★ Three Stars" },
          ],
        },
      },
      {
        id: "cta-1",
        type: "cta",
        isVisible: true,
        content: {
          headline: "Reserve your culinary experience.",
          subheadline: "Seating is limited to twelve tables per evening. Select your preferred date and party size below.",
          buttonText: "Request Table Reservation",
          buttonHref: "#",
          secondaryText: "Private salon dining available for parties up to 14 guests.",
          layoutVariant: "reservation",
        },
      },
      {
        id: "footer-1",
        type: "footer",
        isVisible: true,
        content: {
          brand: "Osteria Del Sole",
          tagline: "Artisanal Italian Gastronomy.",
          copyright: `© ${new Date().getFullYear()} Osteria Del Sole. Piazza San Marco, Firenza.`,
          links: [{ label: "Menu", href: "#showcase-1" }, { label: "Cellar", href: "#gallery-1" }, { label: "Reservations", href: "#cta-1" }],
        },
      },
    ],
  },

  architecture_photography: {
    businessType: "Architectural & Spatial Photography",
    targetAudience: "World-renowned architects, design monographs, and cultural institutions",
    conversionGoal: "Commission Architectural Photographic Series",
    brandPersonality: "Monolithic, quiet, disciplined, brutalist clarity",
    visualDirection: "minimal",
    layoutComposition: "gallery-monochrome-monograph",
    title: "Kaelen Voss — Spatial & Structural Photography",
    description: "Documenting monolithic architecture, light, and brutalist structural forms worldwide.",
    category: "Architecture Photography",
    badge: "World Architecture Festival Photo Award",
    theme: {
      id: "gallery-monochrome",
      name: "Gallery Carbon & Titanium",
      bg: "#0A0A0A",
      text: "#FAFAFA",
      accent: "#FFFFFF",
      surface: "#141414",
      border: "#262626",
      muted: "#949494",
    },
    typography: { headingFont: "display", bodyFont: "mono" },
    motion: { preset: "cinematic", intensity: "low" },
    sections: [
      {
        id: "hero-1",
        type: "hero",
        isVisible: true,
        content: {
          badge: "Architectural Archives 2020–2026",
          headline: "Light carving concrete and steel.",
          subheadline: "Documenting spatial volume, tactile brutalism, and monumental modern architecture across Tokyo, Berlin, and Zurich for distinguished monographs.",
          primaryCta: { label: "View Portfolio Archives", href: "#showcase-1" },
          secondaryCta: { label: "Commission An Inquiry", href: "#cta-1" },
          media: {
            type: "image",
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
            alt: "Monolithic concrete architectural structure",
            caption: "Residence in Kyoto — Arch. Kenzo Tange Studio",
          },
          layoutVariant: "editorial",
        },
      },
      {
        id: "stats-1",
        type: "stats",
        isVisible: true,
        content: {
          sectionTitle: "Publications & Recognition",
          subtitle: "Visual studies featured in global architectural journals.",
          layoutVariant: "large_numbers",
          stats: [
            { metric: "18", label: "Monograph Features", description: "Taschen, Phaidon, El Croquis" },
            { metric: "4", label: "International Awards", description: "Architectural Photo Prize" },
            { metric: "120+", label: "Completed Projects", description: "Documented in 14 countries" },
          ],
        },
      },
      {
        id: "showcase-1",
        type: "showcase",
        isVisible: true,
        content: {
          sectionTitle: "Selected Monographs & Commissions",
          subtitle: "Captured exclusively with large-format architectural shift lenses.",
          tag: "Monographs",
          layoutVariant: "cards",
          items: [
            { title: "Monolith Residence Tokyo", category: "Spatial CAD", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80", description: "Raw form-poured concrete and natural pine illumination." },
            { title: "Museum of Modernist Volumes Berlin", category: "Cultural", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80", description: "Cantilevered steel galleries capturing natural zenith light." },
          ],
        },
      },
      {
        id: "gallery-1",
        type: "gallery",
        isVisible: true,
        content: {
          sectionTitle: "Studies in Shadow & Texture",
          subtitle: "Monochromatic micro-studies of brutalist surfaces and spatial transitions.",
          images: [
            { url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1000&q=80", caption: "Helical spiral concrete staircase" },
            { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80", caption: "Interior shadow study" },
            { url: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1000&q=80", caption: "Monolithic façade" },
          ],
        },
      },
      {
        id: "cta-1",
        type: "cta",
        isVisible: true,
        content: {
          headline: "Commission spatial documentation.",
          subheadline: "Now accepting project commissions for 2026 monographs and museum exhibitions worldwide.",
          buttonText: "Inquire About Availability",
          buttonHref: "mailto:commissions@kaelenvoss.studio",
          secondaryText: "Worldwide dispatch with dedicated large-format Phase One equipment.",
          layoutVariant: "minimal",
        },
      },
      {
        id: "footer-1",
        type: "footer",
        isVisible: true,
        content: {
          brand: "Kaelen Voss Studio",
          tagline: "Spatial & structural photography.",
          copyright: `© ${new Date().getFullYear()} Kaelen Voss Studio. Zurich • Berlin • Tokyo.`,
          links: [{ label: "Monographs", href: "#showcase-1" }, { label: "Studies", href: "#gallery-1" }, { label: "Contact", href: "#cta-1" }],
        },
      },
    ],
  },

  real_estate: {
    businessType: "Luxury Real Estate & Estates",
    targetAudience: "High-net-worth families, NRI investors, and luxury homebuyers in Delhi NCR",
    conversionGoal: "Schedule A Private Estate Tour",
    brandPersonality: "Prestigious, architectural, confidential, discreet luxury",
    visualDirection: "editorial",
    layoutComposition: "property-catalog-concierge",
    title: "Vasant & Co. — Sovereign Delhi NCR Estates",
    description: "Curating Delhi NCR's most prestigious luxury penthouses, private farmhouses, and architectural villas.",
    category: "Luxury Real Estate",
    badge: "Discreet HNW Portfolio",
    theme: {
      id: "delhi-navy-gold",
      name: "Lutyens Navy & Champagne Gold",
      bg: "#080C14",
      text: "#F7F6F2",
      accent: "#E5C07B",
      surface: "#0E1522",
      border: "#1C273D",
      muted: "#8493AC",
    },
    typography: { headingFont: "serif", bodyFont: "sans" },
    motion: { preset: "cinematic", intensity: "medium" },
    sections: [
      {
        id: "announce-1",
        type: "announcement",
        isVisible: true,
        content: {
          badge: "Private Preview",
          message: "Off-market Golf Links & Chanakyapuri diplomatic estates now accepting private inquiries.",
          linkText: "View Portfolio",
          linkHref: "#showcase-1",
        },
      },
      {
        id: "hero-1",
        type: "hero",
        isVisible: true,
        content: {
          badge: "Delhi NCR Ultra-Luxury Real Estate",
          headline: "Distinguished residences for visionary families.",
          subheadline: "Unmatched private estates, sunlit duplex penthouses, and bespoke architectural sanctuaries across Delhi Golf Links, Chanakyapuri, and Gurgaon Horizon.",
          primaryCta: { label: "Explore Private Residences", href: "#showcase-1" },
          secondaryCta: { label: "Schedule Confidential Tour", href: "#cta-1" },
          media: {
            type: "image",
            url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
            alt: "Illuminated luxury modern villa in Delhi NCR with private pool",
            caption: "The Horizon Estate — 12,000 sq.ft private gated sanctuary",
          },
          layoutVariant: "split",
        },
      },
      {
        id: "showcase-1",
        type: "showcase",
        isVisible: true,
        content: {
          sectionTitle: "Curated Estate Portfolio",
          subtitle: "Pre-vetted freehold properties with crystal-clear legal due diligence and private security perimeters.",
          tag: "Featured Residences",
          layoutVariant: "properties",
          items: [
            { title: "The Grand Golf Links Duplex", category: "Golf Links, New Delhi", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80", description: "5-bedroom duplex penthouse overlooking manicured fairways with private infinity deck.", price: "₹38.5 Cr / $4.6M", badge: "Golf Course View" },
            { title: "The Chanakyapuri Diplomatic Villa", category: "Chanakyapuri, New Delhi", image: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=1000&q=80", description: "Gated classical residence with 4-car subterranean vault and high-security protocol.", price: "₹62 Cr / $7.4M", badge: "Diplomatic Enclave" },
            { title: "Horizon Sky Villa Gurgaon", category: "Golf Course Road, Gurgaon", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80", description: "Triple-height glass penthouse with temperature-controlled indoor pool.", price: "₹24 Cr / $2.9M", badge: "Sky Mansion" },
          ],
        },
      },
      {
        id: "benefits-1",
        type: "benefits",
        isVisible: true,
        content: {
          sectionTitle: "The Sovereign Concierge Standard",
          subtitle: "Ensuring zero friction for domestic and international high-net-worth acquisitions.",
          layoutVariant: "cards",
          items: [
            { title: "100% Freehold Title Verification", description: "Comprehensive 30-year deed chain scrutiny verified by leading Supreme Court legal counsel." },
            { title: "Total Transaction Discretion", description: "Non-disclosure agreements executed before any off-market property dossiers are released." },
          ],
        },
      },
      {
        id: "testimonials-1",
        type: "testimonials",
        isVisible: true,
        content: {
          sectionTitle: "Trusted by Leading Industrialists",
          subtitle: "Representing generations of prominent business families.",
          layoutVariant: "quote_cards",
          items: [
            { quote: "Vasant & Co. secured our family's Golf Links residence with impeccable speed, total confidentiality, and zero stress.", author: "Rajesh Singhania", role: "Managing Director", company: "Singhania Industrial Holdings", metric: "₹120 Cr Portfolio" },
          ],
        },
      },
      {
        id: "cta-1",
        type: "cta",
        isVisible: true,
        content: {
          headline: "Schedule your private estate inspection.",
          subheadline: "Experience Delhi NCR's most distinguished properties in person with our senior private wealth partners.",
          buttonText: "Request Confidential Tour",
          buttonHref: "#",
          secondaryText: "Direct chauffeur dispatch available for visiting overseas NRI buyers.",
          layoutVariant: "reservation",
        },
      },
      {
        id: "footer-1",
        type: "footer",
        isVisible: true,
        content: {
          brand: "Vasant & Co. Estates",
          tagline: "Sovereign Delhi NCR Luxury Estates.",
          copyright: `© ${new Date().getFullYear()} Vasant & Co. Estates. Vasant Vihar, New Delhi.`,
          links: [{ label: "Portfolio", href: "#showcase-1" }, { label: "Standards", href: "#benefits-1" }, { label: "Inquire", href: "#cta-1" }],
        },
      },
    ],
  },
};

// Map all 12 detected industry sectors to their optimal blueprint archetype
DOMAIN_BLUEPRINTS.healthcare_wellness = DOMAIN_BLUEPRINTS.skincare;
DOMAIN_BLUEPRINTS.ecommerce = DOMAIN_BLUEPRINTS.skincare;
DOMAIN_BLUEPRINTS.ai_startup = DOMAIN_BLUEPRINTS.cybersecurity;
DOMAIN_BLUEPRINTS.saas = DOMAIN_BLUEPRINTS.cybersecurity;
DOMAIN_BLUEPRINTS.b2b = DOMAIN_BLUEPRINTS.cybersecurity;
DOMAIN_BLUEPRINTS.restaurants_hospitality = DOMAIN_BLUEPRINTS.restaurant;
DOMAIN_BLUEPRINTS.portfolio_agency = DOMAIN_BLUEPRINTS.architecture_photography;
DOMAIN_BLUEPRINTS.service_business = DOMAIN_BLUEPRINTS.architecture_photography;
DOMAIN_BLUEPRINTS.education = DOMAIN_BLUEPRINTS.cybersecurity;
DOMAIN_BLUEPRINTS.fintech_finance = DOMAIN_BLUEPRINTS.real_estate;
DOMAIN_BLUEPRINTS.events_community = DOMAIN_BLUEPRINTS.restaurant;

/**
 * Generates an intelligent, domain-aware mock landing page configuration
 * designed around the user's specific prompt.
 */
export function generateMockLandingPage({
  prompt = "",
  direction = "editorial",
  themePreference = "ai_suggested",
  motionStyle = "cinematic",
}) {
  const domain = detectDomainFromPrompt(prompt);
  const blueprint = DOMAIN_BLUEPRINTS[domain] || DOMAIN_BLUEPRINTS.skincare;

  const designConcept = {
    businessType: domain,
    targetAudience: blueprint.targetAudience,
    conversionGoal: blueprint.conversionGoal,
    brandPersonality: blueprint.brandPersonality,
    visualDirection: direction || blueprint.visualDirection,
    layoutComposition: blueprint.layoutComposition,
    colorMood: blueprint.theme.name,
  };

  // Clone sections to prevent mutating blueprint templates
  let sections = JSON.parse(JSON.stringify(blueprint.sections));

  // If prompt explicitly or contextually requests contact/lead capture, insert bottom form
  const hasForm = sections.some((s) => s.type === "form");
  if (!hasForm && /form|contact|inquir|consult|reach out|quote|waitlist|lead|book|audit|schedule/i.test(prompt)) {
    const formSection = {
      id: "form-inquiry-1",
      type: "form",
      isVisible: true,
      content: {
        badge: "Direct Contact",
        sectionTitle: "Initiate A Direct Inquiry",
        subtitle: "Schedule a confidential briefing with our senior leadership team.",
        submitButtonText: "Submit Inquiry",
        successTitle: "Inquiry Transmitted",
        successMessage: "Thank you. Our partners will review your brief and respond within 24 hours.",
        fields: [
          { id: "f-name", name: "fullName", label: "Full Name", type: "text", placeholder: "e.g. Elena Vance", required: true, width: "half" },
          { id: "f-email", name: "email", label: "Work Email", type: "email", placeholder: "elena@company.com", required: true, width: "half" },
          { id: "f-subject", name: "subject", label: "Inquiry Scope", type: "text", placeholder: "Briefly describe your objectives...", required: false, width: "full" },
          { id: "f-msg", name: "message", label: "Message & Timeline", type: "textarea", placeholder: "Key project parameters, goals, and target deadlines...", required: true, width: "full" },
        ],
      },
    };
    const footerIdx = sections.findIndex((s) => s.type === "footer");
    if (footerIdx !== -1) {
      sections.splice(footerIdx, 0, formSection);
    } else {
      sections.push(formSection);
    }
  }

  const rawConfig = {
    version: "1.0",
    designConcept,
    metadata: {
      title: prompt.length > 5 && prompt.length < 50 ? prompt.replace(/[^\w\s-]/gi, "").trim() : blueprint.title,
      description: blueprint.description,
      category: blueprint.category,
      creativeDirection: direction || blueprint.visualDirection,
      author: "Forma Studio",
      createdAt: new Date().toISOString(),
      designConcept,
    },
    theme: blueprint.theme,
    typography: blueprint.typography,
    motion: {
      preset: motionStyle || blueprint.motion.preset,
      intensity: blueprint.motion.intensity,
    },
    sections,
  };

  // Enrich images with domain-accurate Unsplash photography
  const enrichedConfig = enrichPageConfigWithDomainImages(rawConfig, prompt);

  const validation = validatePageConfig(enrichedConfig);
  if (!validation.success) {
    console.error("Mock generator validation error:", validation.errors);
    throw new Error("Generated configuration failed schema validation");
  }

  return validation.data;
}
