import Header from "../components/layout/Header.js";
import HeroPrompt from "../components/studio/HeroPrompt.js";
import HowItWorks from "../components/studio/HowItWorks.js";
import RecentCreations from "../components/community/RecentCreations.js";
import EditorFeaturesSection from "../components/studio/EditorFeaturesSection.js";
import AeoFaqSection from "../components/studio/AeoFaqSection.js";
import Footer from "../components/layout/Footer.js";

export const metadata = {
  title: "Forma — AI-Powered Landing Page Studio",
  description:
    "Your ideas deserve a better landing page. Forma transforms raw business ideas into production-ready, editable landing pages in seconds.",
};

export default function HomePage() {
  return (
    <div
      className="forma-light-theme forma-light-grid relative min-h-screen flex flex-col bg-[#FAF7F0] text-[#171717] selection:bg-[#FF5A1F] selection:text-white"
      style={{ colorScheme: "light" }}
    >
      {/* 1. Light-Themed Navigation Bar */}
      <Header />

      <main className="flex-1">
        {/* 2. Centered Hero Section with AI Generator & Polished Editor Showcase Mockup */}
        <HeroPrompt />

        {/* 3. Recently Built Projects (Directly after Hero) */}
        <RecentCreations />

        {/* 4. How It Works (3 Concise Steps) */}
        <HowItWorks />

        {/* 5. Editor Features (Text, Media, Sections, Custom Forms) */}
        <EditorFeaturesSection />

        {/* 6. AEO Semantic FAQ & Specifications Section */}
        <AeoFaqSection />
      </main>

      {/* 6. Final Conversion CTA & Minimalist Footer */}
      <Footer />
    </div>
  );
}
