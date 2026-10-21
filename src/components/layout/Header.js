"use client";

import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF7F0]/90 backdrop-blur-md border-b border-[#E9E3DA] transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-18 sm:h-20 flex items-center justify-between">
        {/* Official Brand Logo */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/forma-logo.png"
              alt="Forma — AI Landing Page Studio"
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[#737373] border border-[#E9E3DA] hidden sm:inline-block">
              Studio
            </span>
          </a>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#737373]">
          <a
            href="/dashboard"
            className="hover:text-[#171717] transition-colors duration-150 cursor-pointer flex items-center gap-1 font-semibold text-[#171717]"
          >
            Dashboard
          </a>
          <button
            onClick={() => scrollToSection("recent-builds")}
            className="hover:text-[#171717] transition-colors duration-150 cursor-pointer"
          >
            Recent projects
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="hover:text-[#171717] transition-colors duration-150 cursor-pointer"
          >
            How it works
          </button>
          <button
            onClick={() => scrollToSection("editor-features")}
            className="hover:text-[#171717] transition-colors duration-150 cursor-pointer"
          >
            Editor features
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="hover:text-[#171717] transition-colors duration-150 cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Actions - Dashboard & "Start Building" button */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-medium text-[#171717] hover:text-[#FF5A1F] border border-[#E9E3DA] hover:border-[#FF5A1F]/30 bg-white transition-all shadow-2xs"
          >
            <span>My Projects</span>
          </a>
          <button
            onClick={() => scrollToSection("hero-studio")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[#171717] hover:bg-[#FF5A1F] text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <span>Start Building</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#171717] hover:text-[#FF5A1F] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 py-6 bg-white border-b border-[#E9E3DA] space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <a
            href="/dashboard"
            className="block w-full text-left py-2 text-base font-semibold text-[#FF5A1F]"
          >
            Dashboard / Projects
          </a>
          <button
            onClick={() => scrollToSection("recent-builds")}
            className="block w-full text-left py-2 text-base font-medium text-[#737373] hover:text-[#171717]"
          >
            Recent projects
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="block w-full text-left py-2 text-base font-medium text-[#737373] hover:text-[#171717]"
          >
            How it works
          </button>
          <button
            onClick={() => scrollToSection("editor-features")}
            className="block w-full text-left py-2 text-base font-medium text-[#737373] hover:text-[#171717]"
          >
            Editor features
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="block w-full text-left py-2 text-base font-medium text-[#737373] hover:text-[#171717]"
          >
            FAQ & Answers
          </button>
          <div className="pt-4 border-t border-[#E9E3DA] flex flex-col gap-3">
            <button
              onClick={() => scrollToSection("hero-studio")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium bg-[#171717] hover:bg-[#FF5A1F] text-white transition-colors"
            >
              <span>Start Building</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
