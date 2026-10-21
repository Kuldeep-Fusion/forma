"use client";

import { useState } from "react";
import { ArrowUp, ArrowRight, Sparkles, ShieldCheck, Clock, X } from "lucide-react";
import { FadeUp } from "../motion/MotionReveal.js";

const LEGAL_DOCS = {
  privacy: {
    title: "Privacy Policy",
    content: [
      "At Forma Studio, your privacy and intellectual property are our highest priority.",
      "1. Data Minimization: We only collect prompts and reference images explicitly provided during generation sessions. We never sell your personal data or generated assets to third parties.",
      "2. Autonomous Processing: AI landing page synthesis is performed via secure API calls to Google Gemini with encryption in transit. Prompts are used solely to generate your requested landing page.",
      "3. Local Ownership: You retain 100% intellectual property ownership of all generated landing page copy, layout configurations, and exported source code.",
    ],
  },
  terms: {
    title: "Terms of Service",
    content: [
      "By using Forma Studio, you agree to these operational guidelines:",
      "1. Permitted Use: You are free to generate, commercialize, customize, and deploy landing pages built with Forma for personal and commercial ventures without royalty fees.",
      "2. Export & Self-Hosting: Downloaded standalone ZIP packages contain standard HTML, Tailwind CSS, and vanilla JS. You may host them on any infrastructure (Vercel, Netlify, AWS, Cloudflare, or self-hosted servers).",
      "3. Fair Use: Generation resources are rate-limited to ensure high availability for all builders worldwide.",
    ],
  },
  security: {
    title: "Security & Data Governance",
    content: [
      "Forma is engineered with zero-trust design system security:",
      "1. Edit Tokens: Project mutation and administrative editing endpoints are guarded by cryptographic bearer tokens.",
      "2. Ephemeral Storage: 24-hour preview links automatically transition to expired states to preserve privacy unless actively persisted.",
      "3. Zero Code Lock-in: You are never locked into our proprietary platform — every design can be exported to clean, standards-compliant source code at any time.",
    ],
  },
};

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToHero = () => {
    const el = document.getElementById("hero-studio");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    const input = document.getElementById("prompt-input");
    if (input) {
      setTimeout(() => input.focus(), 300);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-[#FAF7F0] text-[#171717] border-t border-[#E9E3DA] relative overflow-hidden">
      {/* Final Conversion Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-16 md:py-24">
        <div className="relative rounded-[32px] sm:rounded-[40px] p-8 sm:p-14 md:p-16 bg-white border border-[#E9E3DA] shadow-xs overflow-hidden text-center flex flex-col items-center">
          {/* Subtle Warm Accent Glow */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-96 bg-[#FF5A1F]/5 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 max-w-xl flex flex-col items-center">
            <FadeUp delay={0.1}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F0] border border-[#E9E3DA] text-xs font-mono font-medium text-[#171717] mb-5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>START BUILDING TODAY</span>
              </span>
            </FadeUp>

            <FadeUp delay={0.2}>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#171717] font-display leading-[1.12] mb-4">
                Ready to bring your idea to life?
              </h2>
            </FadeUp>

            <FadeUp delay={0.3}>
              <p className="text-sm sm:text-base text-[#737373] mb-8 leading-relaxed">
                Describe your vision in plain English. Forma crafts bespoke typography, curated color harmony, and kinetic motion in seconds.
              </p>
            </FadeUp>

            {/* CTA Buttons consistent with Hero */}
            <FadeUp delay={0.4}>
              <div className="flex flex-wrap items-center justify-center gap-3.5">
                <button
                  onClick={scrollToHero}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-medium text-sm sm:text-base bg-[#171717] hover:bg-[#FF5A1F] text-white shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Start Building</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollToSection("recent-builds")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-medium text-sm sm:text-base bg-[#FAF7F0] hover:bg-white text-[#171717] border border-[#E9E3DA] transition-all duration-200 cursor-pointer"
                >
                  <span>Explore Recent Projects</span>
                </button>
              </div>
            </FadeUp>

            <FadeUp delay={0.45}>
              <div className="flex items-center justify-center gap-5 mt-7 text-xs font-mono text-[#737373]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  24h Preview Links
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  Production-Ready Code
                </span>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Copyright */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 pb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E9E3DA]">
          {/* Official Brand Logo */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/forma-logo.png"
                alt="Forma — AI Landing Page Studio"
                className="h-7 sm:h-8 w-auto object-contain"
              />
              <span className="text-xs font-mono text-[#737373] hidden sm:inline">
                — AI Landing Page Studio
              </span>
            </a>
          </div>

          {/* Working Quick Navigation Links */}
          <nav className="flex flex-wrap items-center gap-5 sm:gap-6 text-xs font-medium text-[#737373]">
            <a
              href="/dashboard"
              className="hover:text-[#171717] transition-colors cursor-pointer font-semibold text-[#171717]"
            >
              Dashboard
            </a>
            <button
              onClick={() => scrollToSection("recent-builds")}
              className="hover:text-[#171717] transition-colors cursor-pointer"
            >
              Recent Projects
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-[#171717] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("editor-features")}
              className="hover:text-[#171717] transition-colors cursor-pointer"
            >
              Editor Features
            </button>
            <button
              onClick={scrollToHero}
              className="hover:text-[#FF5A1F] transition-colors cursor-pointer"
            >
              Launch Studio
            </button>
          </nav>

          {/* Legal / Policy Modals */}
          <div className="flex items-center gap-4 text-xs font-mono text-[#737373]">
            <button
              onClick={() => setActiveModal("privacy")}
              className="hover:text-[#171717] transition-colors cursor-pointer underline underline-offset-2"
            >
              Privacy
            </button>
            <button
              onClick={() => setActiveModal("terms")}
              className="hover:text-[#171717] transition-colors cursor-pointer underline underline-offset-2"
            >
              Terms
            </button>
            <button
              onClick={() => setActiveModal("security")}
              className="hover:text-[#171717] transition-colors cursor-pointer underline underline-offset-2"
            >
              Security
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#737373]">
          <div>
            © {new Date().getFullYear()} Forma Studio Inc. All rights reserved.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-[#171717] transition-colors py-1 px-2 rounded cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Legal & Policy Info Modal */}
      {activeModal && LEGAL_DOCS[activeModal] && (
        <div className="fixed inset-0 z-50 bg-[#171717]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-[#E9E3DA] p-6 sm:p-8 shadow-2xl relative text-left">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#FAF7F0] text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-display text-[#171717] mb-4">
              {LEGAL_DOCS[activeModal].title}
            </h3>

            <div className="space-y-3 text-xs sm:text-sm text-[#737373] leading-relaxed">
              {LEGAL_DOCS[activeModal].content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E9E3DA] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-full text-xs font-medium bg-[#171717] text-white hover:bg-[#FF5A1F] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
