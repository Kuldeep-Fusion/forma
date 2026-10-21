"use client";

import AnnouncementSection from "../sections/AnnouncementSection.js";
import NavbarSection from "../sections/NavbarSection.js";
import HeroSection from "../sections/HeroSection.js";
import LogoStripSection from "../sections/LogoStripSection.js";
import FeaturesSection from "../sections/FeaturesSection.js";
import StatsSection from "../sections/StatsSection.js";
import BenefitsSection from "../sections/BenefitsSection.js";
import ShowcaseSection from "../sections/ShowcaseSection.js";
import GallerySection from "../sections/GallerySection.js";
import VideoShowcaseSection from "../sections/VideoShowcaseSection.js";
import TestimonialsSection from "../sections/TestimonialsSection.js";
import PricingSection from "../sections/PricingSection.js";
import FaqSection from "../sections/FaqSection.js";
import CtaSection from "../sections/CtaSection.js";
import FormSection from "../sections/FormSection.js";
import FooterSection from "../sections/FooterSection.js";

const SECTION_COMPONENTS = {
  announcement: AnnouncementSection,
  navbar: NavbarSection,
  hero: HeroSection,
  logo_strip: LogoStripSection,
  features: FeaturesSection,
  stats: StatsSection,
  benefits: BenefitsSection,
  showcase: ShowcaseSection,
  gallery: GallerySection,
  video_showcase: VideoShowcaseSection,
  testimonials: TestimonialsSection,
  pricing: PricingSection,
  faq: FaqSection,
  cta: CtaSection,
  form: FormSection,
  footer: FooterSection,
};

export default function PageRenderer({
  pageConfig,
  activeSectionId = null,
  onSelectSection = null,
  className = "",
}) {
  if (!pageConfig || !pageConfig.sections) {
    return (
      <div className="w-full py-20 text-center text-muted font-mono text-sm">
        No valid page configuration provided.
      </div>
    );
  }

  const { theme, typography, motion, sections } = pageConfig;

  const headingFontFamily =
    typography?.headingFont === "serif"
      ? "var(--font-serif), Georgia, serif"
      : typography?.headingFont === "mono"
      ? "var(--font-mono), monospace"
      : typography?.headingFont === "display"
      ? "var(--font-display), sans-serif"
      : "var(--font-sans), sans-serif";

  const bodyFontFamily =
    typography?.bodyFont === "serif"
      ? "var(--font-serif), Georgia, serif"
      : typography?.bodyFont === "mono"
      ? "var(--font-mono), monospace"
      : "var(--font-sans), sans-serif";

  const themeStyles = {
    backgroundColor: theme?.bg || "#0B0D0C",
    color: theme?.text || "#F5F5F0",
    fontFamily: bodyFontFamily,
    "--theme-bg": theme?.bg || "#0B0D0C",
    "--theme-text": theme?.text || "#F5F5F0",
    "--theme-accent": theme?.accent || "#FF5A1F",
    "--theme-surface": theme?.surface || "#121514",
    "--theme-border": theme?.border || "#232825",
    "--theme-muted": theme?.muted || "#8E928F",
    "--theme-heading-font": headingFontFamily,
    "--theme-body-font": bodyFontFamily,
  };

  return (
    <div
      className={`relative w-full min-h-screen selection:bg-[var(--theme-accent)] selection:text-[var(--theme-bg)] ${className}`}
      style={themeStyles}
    >
      {sections
        .filter((sec) => sec.isVisible !== false)
        .map((sec) => {
          const Component = SECTION_COMPONENTS[sec.type];
          if (!Component) {
            console.warn(`Unsupported section type: ${sec.type}`);
            return null;
          }

          const isSelected = activeSectionId === sec.id;

          return (
            <div
              key={sec.id}
              id={sec.id}
              onClick={() => onSelectSection?.(sec.id)}
              className={`relative transition-all duration-200 ${
                onSelectSection
                  ? "cursor-pointer group hover:outline hover:outline-1 hover:outline-accent/50"
                  : ""
              } ${isSelected ? "outline outline-2 outline-accent" : ""}`}
            >
              {isSelected && onSelectSection && (
                <div className="absolute top-2 right-4 z-50 bg-accent text-background text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
                  SELECTED: {sec.type.toUpperCase()}
                </div>
              )}
              <Component
                content={sec.content}
                theme={theme}
                typography={typography}
                motionPreset={motion?.preset || "cinematic"}
                designConcept={pageConfig.designConcept || pageConfig.metadata?.designConcept}
              />
            </div>
          );
        })}
    </div>
  );
}
