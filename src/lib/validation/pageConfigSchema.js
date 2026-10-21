import { z } from "zod";

export const DesignConceptSchema = z.object({
  businessType: z.string().default("Creative Studio"),
  targetAudience: z.string().default("Discerning individuals and institutions"),
  conversionGoal: z.string().default("Get Started"),
  brandPersonality: z.string().default("Elevated, intentional, visceral"),
  visualDirection: z.string().default("editorial"),
  layoutComposition: z.string().default("bespoke"),
  colorMood: z.string().default("Obsidian & Lime"),
}).optional();

export const ThemeSchema = z.object({
  id: z.string().default("dark-editorial"),
  name: z.string().default("Dark Editorial"),
  bg: z.string().default("#0B0D0C"),
  text: z.string().default("#F5F5F0"),
  accent: z.string().default("#C5FF65"),
  surface: z.string().default("#121514"),
  border: z.string().default("#232825"),
  muted: z.string().default("#8E928F"),
});

export const TypographySchema = z.object({
  headingFont: z.enum(["sans", "display", "serif", "mono"]).default("display"),
  bodyFont: z.enum(["sans", "mono", "serif"]).default("sans"),
});

export const MotionSchema = z.object({
  preset: z.enum(["subtle", "cinematic", "experimental"]).default("cinematic"),
  intensity: z.enum(["low", "medium", "high"]).default("medium"),
});

export const PageMetadataSchema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().min(5).max(400),
  category: z.string().default("Creative Studio"),
  creativeDirection: z.string().default("editorial"),
  author: z.string().default("Forma Creator"),
  createdAt: z.string().optional(),
  designConcept: DesignConceptSchema,
});

// Section Content Schemas
export const AnnouncementContentSchema = z.object({
  badge: z.string().optional(),
  message: z.string().default("Exclusive announcement"),
  linkText: z.string().optional(),
  linkHref: z.string().optional(),
});

export const NavbarContentSchema = z.object({
  brandName: z.string().default("Brand"),
  logoUrl: z.string().optional(),
  links: z.array(z.object({ label: z.string(), href: z.string().default("#") })).default([]),
  cta: z.object({ label: z.string(), href: z.string() }).optional(),
});

export const HeroContentSchema = z.object({
  badge: z.string().optional(),
  headline: z.string().min(2).default("Elevate your vision."),
  subheadline: z.string().min(2).default("Designed with architectural precision and creative excellence."),
  primaryCta: z.object({
    label: z.string().default("Explore"),
    href: z.string().default("#explore"),
  }).default({ label: "Explore", href: "#explore" }),
  secondaryCta: z.object({
    label: z.string().default("Details"),
    href: z.string().default("#details"),
  }).optional(),
  media: z.object({
    type: z.enum(["image", "video"]).default("image"),
    url: z.string().default(""),
    alt: z.string().default("Landing page hero visual"),
    caption: z.string().optional(),
  }).optional(),
  layoutVariant: z.string().default("editorial"),
  statsPills: z.array(z.object({
    label: z.string().optional(),
    value: z.string().optional(),
    icon: z.string().optional(),
  })).optional(),
  mockup: z.object({
    title: z.string().optional(),
    path: z.string().optional(),
    status: z.string().optional(),
    metrics: z.array(z.object({
      label: z.string().optional(),
      value: z.string().optional(),
    })).optional(),
    codeSnippet: z.string().optional(),
  }).optional(),
  ticker: z.array(z.string()).optional(),
});

export const LogoStripContentSchema = z.object({
  title: z.string().optional(),
  logos: z.array(
    z.union([
      z.string().transform((name) => ({ name })),
      z.object({ name: z.string().default("Partner"), icon: z.string().optional(), logoUrl: z.string().optional() }),
    ])
  ).default([]),
});

export const FeaturesContentSchema = z.object({
  sectionTitle: z.string().default("Core Capabilities"),
  subtitle: z.string().optional(),
  tag: z.string().optional(),
  layoutVariant: z.string().default("grid"),
  items: z.array(
    z.object({
      title: z.string().default("Feature"),
      description: z.string().default("Engineered for peak performance and aesthetic excellence."),
      metric: z.string().optional(),
      tag: z.string().optional(),
      image: z.string().optional(),
    })
  ).default([]),
});

export const StatsContentSchema = z.object({
  sectionTitle: z.string().optional(),
  subtitle: z.string().optional(),
  layoutVariant: z.string().default("cards"),
  stats: z.array(
    z.object({
      metric: z.string().optional(),
      value: z.string().optional(),
      label: z.string().default("Metric"),
      description: z.string().optional(),
    }).transform((item) => ({
      metric: item.metric || item.value || "100%",
      label: item.label,
      description: item.description,
    }))
  ).default([]),
  items: z.array(
    z.object({
      metric: z.string().optional(),
      value: z.string().optional(),
      label: z.string().default("Metric"),
      description: z.string().optional(),
    }).transform((item) => ({
      metric: item.metric || item.value || "100%",
      label: item.label,
      description: item.description,
    }))
  ).optional(),
}).transform((val) => {
  if ((!val.stats || val.stats.length === 0) && val.items && val.items.length > 0) {
    return { ...val, stats: val.items };
  }
  return val;
});

export const BenefitsContentSchema = z.object({
  sectionTitle: z.string().default("The Standard"),
  subtitle: z.string().optional(),
  layoutVariant: z.string().default("cards"),
  items: z.array(
    z.object({
      title: z.string().default("Benefit"),
      description: z.string().default("Uncompromising adherence to quality and client success."),
      icon: z.string().optional(),
      badge: z.string().optional(),
    })
  ).default([]),
});

export const ShowcaseContentSchema = z.object({
  sectionTitle: z.string().default("Selected Showcase"),
  subtitle: z.string().optional(),
  tag: z.string().optional(),
  layoutVariant: z.string().default("cards"),
  items: z.array(
    z.object({
      title: z.string().default("Featured"),
      category: z.string().default("Featured"),
      image: z.string().default(""),
      description: z.string().default(""),
      link: z.string().optional(),
      price: z.string().optional(),
      badge: z.string().optional(),
      attributes: z.array(z.string()).optional(),
    })
  ).default([]),
});

export const GalleryContentSchema = z.object({
  sectionTitle: z.string().default("Gallery"),
  subtitle: z.string().optional(),
  images: z.array(
    z.object({
      url: z.string().default(""),
      caption: z.string().optional(),
      alt: z.string().default("Gallery asset"),
    })
  ).default([]),
});

export const VideoShowcaseContentSchema = z.object({
  sectionTitle: z.string().default("Experience"),
  subtitle: z.string().optional(),
  videoUrl: z.string().default(""),
  posterUrl: z.string().optional(),
  caption: z.string().optional(),
});

export const TestimonialsContentSchema = z.object({
  sectionTitle: z.string().default("Client Perspectives"),
  subtitle: z.string().optional(),
  layoutVariant: z.string().default("quote_cards"),
  items: z.array(
    z.object({
      quote: z.string().default("Exceptional craft and uncompromising attention to detail."),
      author: z.string().default("Patron"),
      role: z.string().default("Client"),
      company: z.string().optional(),
      metric: z.string().optional(),
      avatar: z.string().optional(),
    })
  ).default([]),
  testimonials: z.array(z.any()).optional(),
}).transform((val) => {
  let list = val.items;
  if ((!list || list.length === 0) && Array.isArray(val.testimonials) && val.testimonials.length > 0) {
    list = val.testimonials;
  }
  const normalized = (list || []).map((t) => ({
    quote: t.quote || t.text || t.content || "Exceptional craft and uncompromising attention to detail.",
    author: t.author || t.name || "Client",
    role: t.role || t.title || "Client",
    company: t.company,
    metric: t.metric,
    avatar: t.avatar,
  }));
  return {
    ...val,
    items: normalized,
    testimonials: normalized,
  };
});

export const PricingContentSchema = z.object({
  sectionTitle: z.string().default("Investment Plans"),
  subtitle: z.string().optional(),
  billingInterval: z.string().default("Monthly"),
  plans: z.array(
    z.object({
      name: z.string().default("Tier"),
      price: z.string().default("Contact"),
      period: z.string().default("/mo"),
      description: z.string().default(""),
      features: z.array(z.string()).default([]),
      isHighlighted: z.boolean().default(false),
      ctaText: z.string().default("Get Started"),
    })
  ).default([]),
  tiers: z.array(z.any()).optional(),
  items: z.array(z.any()).optional(),
}).transform((val) => {
  let list = val.plans;
  if ((!list || list.length === 0) && Array.isArray(val.tiers) && val.tiers.length > 0) {
    list = val.tiers;
  } else if ((!list || list.length === 0) && Array.isArray(val.items) && val.items.length > 0) {
    list = val.items;
  }
  const normalized = (list || []).map((p) => ({
    name: p.name || p.title || p.tier || "Tier",
    price: p.price || "Contact",
    period: p.period || "/mo",
    description: p.description || "",
    features: Array.isArray(p.features) ? p.features : [],
    isHighlighted: !!p.isHighlighted,
    ctaText: p.ctaText || p.ctaLabel || "Get Started",
  }));
  return {
    ...val,
    plans: normalized,
    tiers: normalized,
  };
});

export const FaqContentSchema = z.object({
  sectionTitle: z.string().default("Frequently Asked Questions"),
  subtitle: z.string().optional(),
  questions: z.array(
    z.object({
      question: z.string().optional(),
      q: z.string().optional(),
      answer: z.string().optional(),
      a: z.string().optional(),
    }).transform((item) => ({
      q: item.q || item.question || "Question",
      question: item.question || item.q || "Question",
      a: item.a || item.answer || "Answer",
      answer: item.answer || item.a || "Answer",
    }))
  ).default([]),
  faqs: z.array(z.any()).optional(),
  items: z.array(z.any()).optional(),
}).transform((val) => {
  let list = val.questions;
  if ((!list || list.length === 0) && Array.isArray(val.faqs) && val.faqs.length > 0) {
    list = val.faqs;
  } else if ((!list || list.length === 0) && Array.isArray(val.items) && val.items.length > 0) {
    list = val.items;
  }
  const normalized = (list || []).map((item) => ({
    q: item.q || item.question || item.title || "Question",
    question: item.question || item.q || item.title || "Question",
    a: item.a || item.answer || item.description || "Answer",
    answer: item.answer || item.a || item.description || "Answer",
  }));
  return {
    ...val,
    questions: normalized,
    faqs: normalized,
  };
});

export const CtaContentSchema = z.object({
  headline: z.string().default("Ready to elevate your experience?"),
  subheadline: z.string().default("Connect with our team to explore possibilities and begin today."),
  buttonText: z.string().default("Get Started"),
  buttonHref: z.string().default("#start"),
  secondaryText: z.string().optional(),
  layoutVariant: z.string().default("banner"),
  fields: z.array(z.string()).optional(),
});

export const FooterContentSchema = z.object({
  brand: z.any().transform((b) => {
    if (typeof b === "string" && b.trim()) return b;
    if (typeof b === "object" && b !== null) return b.name || b.title || b.text || "Forma Studio";
    return "Forma Studio";
  }),
  tagline: z.string().optional(),
  copyright: z.string().default(`© ${new Date().getFullYear()} Forma Studio. All rights reserved.`),
  links: z.array(
    z.object({
      label: z.string().default("Link"),
      href: z.string().default("#"),
    })
  ).default([]),
});

export const FormFieldOptionSchema = z.union([
  z.string().transform((str) => ({
    label: str,
    value: str.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "option",
  })),
  z.object({
    label: z.string().default("Option"),
    value: z.string().default("option"),
  }),
]);

export const FormFieldSchema = z.object({
  id: z.string().default("field_id"),
  name: z.string().default("field_name"),
  label: z.string().default("Field Label"),
  type: z.preprocess(
    (val) => {
      if (val === "tel") return "phone";
      if (val === "string") return "text";
      if (val === "multiline") return "textarea";
      if (val === "boolean") return "checkbox";
      return val;
    },
    z.enum([
      "text",
      "email",
      "phone",
      "textarea",
      "number",
      "select",
      "radio",
      "checkbox",
      "date",
      "url",
      "hidden",
    ]).default("text")
  ),
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
  isRequired: z.boolean().default(false),
  options: z.array(FormFieldOptionSchema).default([]),
  width: z.enum(["full", "half"]).default("full"),
  defaultValue: z.string().optional(),
  validation: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
});

export const FormContentSchema = z.object({
  sectionTitle: z.string().default("Connect With Our Team"),
  subtitle: z.string().optional(),
  tag: z.string().optional(),
  layout: z.enum(["single_column", "two_column"]).default("single_column"),
  layoutVariant: z.string().default("standard"),
  submitButtonText: z.string().default("Submit Inquiry"),
  successMessage: z.string().default("Thank you. Your request has been received. Our team will review and reply promptly."),
  formAction: z.string().default("/api/forms/submit"),
  fields: z.array(FormFieldSchema).default([]),
});

export const SectionSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("announcement"),
    isVisible: z.boolean().default(true),
    content: AnnouncementContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("navbar"),
    isVisible: z.boolean().default(true),
    content: NavbarContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("hero"),
    isVisible: z.boolean().default(true),
    content: HeroContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("logo_strip"),
    isVisible: z.boolean().default(true),
    content: LogoStripContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("features"),
    isVisible: z.boolean().default(true),
    content: FeaturesContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("stats"),
    isVisible: z.boolean().default(true),
    content: StatsContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("benefits"),
    isVisible: z.boolean().default(true),
    content: BenefitsContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("showcase"),
    isVisible: z.boolean().default(true),
    content: ShowcaseContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("gallery"),
    isVisible: z.boolean().default(true),
    content: GalleryContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("video_showcase"),
    isVisible: z.boolean().default(true),
    content: VideoShowcaseContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("testimonials"),
    isVisible: z.boolean().default(true),
    content: TestimonialsContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("pricing"),
    isVisible: z.boolean().default(true),
    content: PricingContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("faq"),
    isVisible: z.boolean().default(true),
    content: FaqContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("cta"),
    isVisible: z.boolean().default(true),
    content: CtaContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("form"),
    isVisible: z.boolean().default(true),
    content: FormContentSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("footer"),
    isVisible: z.boolean().default(true),
    content: FooterContentSchema,
  }),
]);

export const PageConfigSchema = z.object({
  version: z.literal("1.0").default("1.0"),
  metadata: PageMetadataSchema,
  designConcept: DesignConceptSchema,
  theme: ThemeSchema,
  typography: TypographySchema,
  motion: MotionSchema,
  sections: z.array(SectionSchema),
});

export function stripNulls(value) {
  if (value === null) return undefined;
  if (Array.isArray(value)) return value.map(stripNulls);
  if (typeof value === "object" && value !== null) {
    const res = {};
    for (const [k, v] of Object.entries(value)) {
      const stripped = stripNulls(v);
      if (stripped !== undefined) {
        res[k] = stripped;
      }
    }
    return res;
  }
  return value;
}

export function validatePageConfig(config) {
  const sanitizedConfig = stripNulls(config);
  const result = PageConfigSchema.safeParse(sanitizedConfig);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));
    return {
      success: false,
      errors: formattedErrors,
      rawError: result.error,
    };
  }
  return {
    success: true,
    data: result.data,
  };
}
