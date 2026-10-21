import fs from "fs";
import path from "path";
import { generateLandingPageWithGemini } from "../src/lib/ai/gemini.js";

// Load .env.local if present
if (fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const TEST_BRIEFS = [
  {
    name: "Luxury Skincare Brand",
    brief: "Create an ultra-luxurious, minimalist landing page for 'Aura Botanica', an organic cellular serum brand targeting discerning clientele who appreciate quiet luxury, raw botanical extraction, and dermatological efficacy.",
    expectedHero: ["minimal_luxury", "immersive"],
  },
  {
    name: "AI Developer Tool",
    brief: "Build a high-performance landing page for 'HyperScale AI', an ultra-low-latency distributed inference runtime for engineering teams with real-time telemetry, CLI benchmarks, and GitHub deployment.",
    expectedHero: ["saas_mockup", "asymmetric"],
  },
  {
    name: "Creative Design Agency",
    brief: "Design an avant-garde manifesto landing page for 'Studio Monolith', an award-winning creative direction and kinetic branding studio that builds provocative cultural identities for visionary founders.",
    expectedHero: ["large_typography", "editorial", "asymmetric"],
  },
  {
    name: "Real Estate Property Campaign",
    brief: "Build an architectural landing page for 'The Obsidian Penthouse Residences', showcasing private waterfront villas and sky estates with private concierge viewings, floorplan dossiers, and biometric security.",
    expectedHero: ["immersive", "minimal_luxury", "asymmetric"],
  },
  {
    name: "Fitness and Wellness Startup",
    brief: "Create a high-energy kinetic landing page for 'PulseProtocol', a bio-wearable and athletic performance app offering personalized metabolic tracking, strain recovery coaching, and pro athlete progressions.",
    expectedHero: ["overlapping", "asymmetric", "saas_mockup"],
  },
  {
    name: "Premium Fashion E-Commerce",
    brief: "Launch a high-fashion editorial runway landing page for 'MAISON NOIR', an independent Parisian fashion atelier releasing Edition 04: sculptural silhouettes in raw Japanese silk and distressed ebony denim.",
    expectedHero: ["large_typography", "minimal_luxury", "editorial"],
  },
];

async function runSixBriefDiversityTest() {
  console.log("================================================================================");
  console.log("FORMA CREATIVE DIVERSITY TEST: 6 DIVERSE BUSINESS BRIEFS VIA REAL GEMINI PIPELINE");
  console.log("================================================================================\n");

  const results = [];

  for (let i = 0; i < TEST_BRIEFS.length; i++) {
    const test = TEST_BRIEFS[i];
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`[TEST ${i + 1}/6] ${test.name.toUpperCase()}`);
    console.log(`Prompt: "${test.brief}"`);
    console.log(`--------------------------------------------------------------------------------`);

    const start = Date.now();
    try {
      const pageConfig = await generateLandingPageWithGemini({
        prompt: test.brief,
        direction: "auto",
        themePreference: "auto",
        motionStyle: "auto",
        requestId: `test_${i + 1}`,
      });

      const durationMs = Date.now() - start;
      const heroSec = pageConfig.sections.find((s) => s.type === "hero");
      const heroVariant = heroSec?.content?.layoutVariant || "default";
      const sectionSequence = pageConfig.sections.map((s) => s.type);
      const sectionVariants = pageConfig.sections
        .map((s) => `${s.type}${s.content?.layoutVariant ? `(${s.content.layoutVariant})` : ""}`)
        .join(" -> ");

      const result = {
        name: test.name,
        durationMs,
        title: pageConfig.metadata.title,
        direction: pageConfig.metadata.creativeDirection,
        heroVariant,
        paletteName: pageConfig.theme.name,
        bg: pageConfig.theme.bg,
        accent: pageConfig.theme.accent,
        headingFont: pageConfig.typography.headingFont,
        bodyFont: pageConfig.typography.bodyFont,
        motionPreset: pageConfig.motion.preset,
        sectionCount: pageConfig.sections.length,
        sectionSequence,
        sectionVariants,
      };

      results.push(result);

      console.log(`\n✓ GENERATED IN ${durationMs}ms:`);
      console.log(`  - Title: "${result.title}"`);
      console.log(`  - Visual Direction: ${result.direction}`);
      console.log(`  - Hero Composition: [${result.heroVariant}]`);
      console.log(`  - Color Palette: "${result.paletteName}" (bg: ${result.bg}, accent: ${result.accent})`);
      console.log(`  - Typography: Heading=${result.headingFont}, Body=${result.bodyFont}`);
      console.log(`  - Motion Preset: ${result.motionPreset}`);
      console.log(`  - Total Sections: ${result.sectionCount}`);
      console.log(`  - Section Architecture: ${result.sectionVariants}`);
    } catch (err) {
      console.error(`✗ FAILED for ${test.name}:`, err.message);
    }
  }

  // Cross-test analysis
  console.log("\n================================================================================");
  console.log("CROSS-PROJECT CREATIVE VARIATION ANALYSIS MATRIX");
  console.log("================================================================================");
  console.table(
    results.map((r) => ({
      Project: r.name,
      Hero: r.heroVariant,
      HeadingFont: r.headingFont,
      AccentColor: r.accent,
      BgColor: r.bg,
      Sections: r.sectionCount,
      Direction: r.direction,
    }))
  );

  // Assertions
  const heroVariants = new Set(results.map((r) => r.heroVariant));
  const headingFonts = new Set(results.map((r) => r.headingFont));
  const accentColors = new Set(results.map((r) => r.accent));
  const sectionSequences = new Set(results.map((r) => r.sectionSequence.join(",")));

  console.log("\n--- DIVERSITY METRICS ---");
  console.log(`• Unique Hero Compositions: ${heroVariants.size} / ${results.length} (${Array.from(heroVariants).join(", ")})`);
  console.log(`• Unique Heading Fonts: ${headingFonts.size} (${Array.from(headingFonts).join(", ")})`);
  console.log(`• Unique Accent Colors: ${accentColors.size} (${Array.from(accentColors).join(", ")})`);
  console.log(`• Unique Section Sequences: ${sectionSequences.size} / ${results.length}`);

  if (heroVariants.size >= 3 && accentColors.size >= 4 && sectionSequences.size >= 3) {
    console.log("\n>>> SUCCESS: Forma produces genuinely diverse, bespoke art direction & layouts across business categories! <<<");
  } else {
    console.warn("\n>>> WARNING: Variation is below recommended thresholds. Inspect pipeline logs. <<<");
  }
}

runSixBriefDiversityTest();
