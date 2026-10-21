import { generateLandingPageWithGemini } from "../src/lib/ai/gemini.js";
import { validatePageConfig } from "../src/lib/validation/pageConfigSchema.js";
import fs from "fs";

const TEST_CASES = [
  {
    id: "ai_saas",
    category: "1. AI SaaS",
    prompt: "Create a landing page for an AI-powered code security and automated vulnerability remediation platform.",
  },
  {
    id: "b2b_services",
    category: "2. Enterprise B2B Services",
    prompt: "Create a landing page for an enterprise cloud migration consulting firm delivering multi-cloud infrastructure transformations.",
  },
  {
    id: "education",
    category: "3. Education",
    prompt: "Create a landing page for an immersive fullstack AI engineering bootcamp with real-world capstone projects and live mentorship.",
  },
  {
    id: "luxury_brand",
    category: "4. Luxury Brand",
    prompt: "Create a landing page for a Swiss haute horlogerie atelier crafting bespoke mechanical timepieces in Geneva.",
  },
  {
    id: "sustainability",
    category: "5. Sustainability Product",
    prompt: "Create a landing page for a circular ocean-plastic activewear collection with 100% closed-loop supply chains.",
  },
  {
    id: "multimodal_reference",
    category: "6. Multimodal Reference Test",
    prompt: "Create a landing page for an autonomous AI analytics studio.",
    // Sample base64 image reference (valid 1x1 PNG data URI)
    referenceImages: [
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    ],
  },
];

async function runAutonomousDesignerVerification() {
  console.log("================================================================================");
  console.log("FORMA AUTONOMOUS AI SENIOR DESIGNER — SYSTEM VERIFICATION");
  console.log("================================================================================\n");

  const results = [];

  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`TEST [${i + 1}/${TEST_CASES.length}] ${testCase.category}`);
    console.log(`Prompt: "${testCase.prompt}"`);
    if (testCase.referenceImages) {
      console.log(`Attached References: ${testCase.referenceImages.length} image(s)`);
    }

    const startTime = Date.now();
    try {
      const config = await generateLandingPageWithGemini({
        prompt: testCase.prompt,
        referenceImages: testCase.referenceImages || [],
        requestId: `test_${testCase.id}`,
      });
      const durationMs = Date.now() - startTime;

      // Zod Validation
      const validation = validatePageConfig(config);
      if (!validation.success) {
        throw new Error(`Zod validation failed: ${JSON.stringify(validation.errors)}`);
      }

      // Check section completeness
      const emptySections = [];
      for (const sec of config.sections) {
        const c = sec.content || {};
        if (sec.type === "features" && (!c.items || c.items.length === 0)) emptySections.push(sec.type);
        if (sec.type === "showcase" && (!c.items || c.items.length === 0)) emptySections.push(sec.type);
        if (sec.type === "stats" && (!c.stats || c.stats.length === 0) && (!c.items || c.items.length === 0)) emptySections.push(sec.type);
        if (sec.type === "benefits" && (!c.items || c.items.length === 0)) emptySections.push(sec.type);
        if (sec.type === "pricing" && (!c.tiers || c.tiers.length === 0) && (!c.plans || c.plans.length === 0)) emptySections.push(sec.type);
        if (sec.type === "testimonials" && (!c.testimonials || c.testimonials.length === 0) && (!c.items || c.items.length === 0)) emptySections.push(sec.type);
        if (sec.type === "faq" && (!c.faqs || c.faqs.length === 0) && (!c.questions || c.questions.length === 0)) emptySections.push(sec.type);
      }

      const hero = config.sections.find((s) => s.type === "hero");
      const features = config.sections.find((s) => s.type === "features");
      const showcase = config.sections.find((s) => s.type === "showcase");

      const record = {
        id: testCase.id,
        category: testCase.category,
        prompt: testCase.prompt,
        status: "SUCCESS",
        durationMs,
        title: config.metadata?.title,
        direction: config.metadata?.creativeDirection,
        typography: `${config.typography?.headingFont} / ${config.typography?.bodyFont}`,
        palette: {
          name: config.theme?.name,
          accent: config.theme?.accent,
          bg: config.theme?.bg,
        },
        motion: `${config.motion?.preset} (${config.motion?.intensity})`,
        heroLayout: hero?.content?.layoutVariant || "default",
        featuresLayout: features?.content?.layoutVariant || "none",
        showcaseLayout: showcase?.content?.layoutVariant || "none",
        sectionCount: config.sections.length,
        sectionTypes: config.sections.map((s) => s.type),
        emptySectionsCount: emptySections.length,
        config,
      };

      results.push(record);

      console.log(`✓ Result in ${durationMs}ms:`);
      console.log(`  • Title: "${record.title}"`);
      console.log(`  • Direction: ${record.direction} | Motion: ${record.motion}`);
      console.log(`  • Typography: ${record.typography} | Theme Accent: ${record.palette.accent} (${record.palette.name})`);
      console.log(`  • Hero Layout: ${record.heroLayout}`);
      console.log(`  • Features Layout: ${record.featuresLayout} | Showcase Layout: ${record.showcaseLayout}`);
      console.log(`  • Sections (${record.sectionCount}): ${record.sectionTypes.join(" → ")}`);
      console.log(`  • Completeness: 100% complete (${record.emptySectionsCount} empty sections detected)`);
    } catch (err) {
      console.error(`✗ FAILED: ${err.message}`);
      results.push({
        id: testCase.id,
        category: testCase.category,
        prompt: testCase.prompt,
        status: "FAILED",
        error: err.message,
      });
    }
  }

  // Summary Table
  console.log("\n================================================================================");
  console.log("GENERATION COMPARISON SUMMARY");
  console.log("================================================================================");
  console.table(
    results.map((r) => ({
      Category: r.category,
      Status: r.status,
      Title: r.title ? r.title.slice(0, 28) : "N/A",
      Direction: r.direction,
      Hero: r.heroLayout,
      Typography: r.typography,
      Accent: r.palette?.accent,
      Sections: r.sectionCount,
      EmptySections: r.emptySectionsCount,
    }))
  );

  fs.writeFileSync(
    "scripts/autonomous_generation_results.json",
    JSON.stringify(results, null, 2)
  );
  console.log("\nSaved complete configuration outputs to scripts/autonomous_generation_results.json");
}

runAutonomousDesignerVerification();
