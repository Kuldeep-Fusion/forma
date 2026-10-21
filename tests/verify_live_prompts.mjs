import fs from "fs";
import assert from "assert";

// Load environment variables from .env.local
const env = fs.readFileSync("./.env.local", "utf8");
for (const line of env.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
}

import { generateLandingPageWithGemini } from "../src/lib/ai/gemini.js";
import { createProject, getProjectById } from "../src/services/projectService.js";
import { validatePageConfig } from "../src/lib/validation/pageConfigSchema.js";

async function runLiveVerification() {
  console.log("================================================================================");
  console.log("FORMA LIVE GEMINI VERIFICATION: TEST A (SKINCARE) vs TEST B (CYBERSECURITY SAAS)");
  console.log("================================================================================\n");

  const promptA = "Create a luxury skincare landing page with editorial typography, full-width product imagery, and a minimal cream-and-black palette.";
  const promptB = "Create a futuristic AI cybersecurity SaaS landing page with a dark technical aesthetic, product visualization, enterprise features, and a demo CTA.";

  // --- TEST A: LUXURY SKINCARE ---
  console.log("--- Executing Test A (Luxury Skincare) ---");
  const startA = Date.now();
  const configA = await generateLandingPageWithGemini({
    prompt: promptA,
    direction: "editorial",
    themePreference: "ai_suggested",
    motionStyle: "cinematic",
    requestId: "test_a_skincare",
  });
  const durationA = Date.now() - startA;

  assert.ok(configA, "Test A: config must be generated");
  const validationA = validatePageConfig(configA);
  assert.strictEqual(validationA.success, true, "Test A: config must strictly validate against Zod schema");

  console.log(`✓ Test A completed in ${durationA}ms`);
  console.log(`  Title: "${configA.metadata.title}"`);
  console.log(`  Category: "${configA.metadata.category}"`);
  console.log(`  Creative Direction: "${configA.metadata.creativeDirection}"`);
  console.log(`  Heading Font: "${configA.typography.headingFont}"`);
  console.log(`  Theme: Accent=${configA.theme.accent}, BG=${configA.theme.bg}`);
  console.log(`  Sections (${configA.sections.length}): ${configA.sections.map(s => s.type).join(" -> ")}`);
  const heroA = configA.sections.find(s => s.type === "hero");
  console.log(`  Hero Headline: "${heroA?.content?.headline}"`);
  console.log(`  Hero Layout Variant: "${heroA?.content?.layoutVariant}"\n`);

  // Persist Test A project
  const { project: projA, editToken: tokenA } = await createProject({
    title: configA.metadata.title,
    ownerSessionId: "session_test_a",
    pageConfig: configA,
    prompt: promptA,
    creativeDirection: "editorial",
  });
  console.log(`✓ Test A project persisted to store with ID: ${projA._id || projA.id}`);

  // Reopen Test A project
  const reopenedA = await getProjectById(projA._id || projA.id, { editToken: tokenA });
  assert.ok(reopenedA, "Test A project must be retrievable");
  assert.strictEqual(reopenedA.pageConfig.metadata.title, configA.metadata.title);
  assert.strictEqual(reopenedA.canEdit, true);
  console.log(`✓ Test A project successfully reopened with canEdit: true\n`);

  // --- TEST B: FUTURISTIC AI CYBERSECURITY SAAS ---
  console.log("--- Executing Test B (Futuristic AI Cybersecurity SaaS) ---");
  const startB = Date.now();
  const configB = await generateLandingPageWithGemini({
    prompt: promptB,
    direction: "futuristic",
    themePreference: "electric_blue",
    motionStyle: "experimental",
    requestId: "test_b_cybersecurity",
  });
  const durationB = Date.now() - startB;

  assert.ok(configB, "Test B: config must be generated");
  const validationB = validatePageConfig(configB);
  assert.strictEqual(validationB.success, true, "Test B: config must strictly validate against Zod schema");

  console.log(`✓ Test B completed in ${durationB}ms`);
  console.log(`  Title: "${configB.metadata.title}"`);
  console.log(`  Category: "${configB.metadata.category}"`);
  console.log(`  Creative Direction: "${configB.metadata.creativeDirection}"`);
  console.log(`  Heading Font: "${configB.typography.headingFont}"`);
  console.log(`  Theme: Accent=${configB.theme.accent}, BG=${configB.theme.bg}`);
  console.log(`  Sections (${configB.sections.length}): ${configB.sections.map(s => s.type).join(" -> ")}`);
  const heroB = configB.sections.find(s => s.type === "hero");
  console.log(`  Hero Headline: "${heroB?.content?.headline}"`);
  console.log(`  Hero Layout Variant: "${heroB?.content?.layoutVariant}"\n`);

  // Persist Test B project
  const { project: projB, editToken: tokenB } = await createProject({
    title: configB.metadata.title,
    ownerSessionId: "session_test_b",
    pageConfig: configB,
    prompt: promptB,
    creativeDirection: "futuristic",
  });
  console.log(`✓ Test B project persisted to store with ID: ${projB._id || projB.id}`);

  // Reopen Test B project
  const reopenedB = await getProjectById(projB._id || projB.id, { editToken: tokenB });
  assert.ok(reopenedB, "Test B project must be retrievable");
  assert.strictEqual(reopenedB.pageConfig.metadata.title, configB.metadata.title);
  assert.strictEqual(reopenedB.canEdit, true);
  console.log(`✓ Test B project successfully reopened with canEdit: true\n`);

  // --- MEANINGFUL DIFFERENTIATION ASSERTIONS ---
  console.log("--- Asserting Meaningful Differentiation between Test A and Test B ---");
  assert.notStrictEqual(configA.metadata.title, configB.metadata.title, "Titles must differ");
  assert.notStrictEqual(configA.metadata.category, configB.metadata.category, "Categories must differ");
  assert.notStrictEqual(configA.theme.accent, configB.theme.accent, "Theme accents must differ");
  assert.notStrictEqual(heroA?.content?.headline, heroB?.content?.headline, "Hero headlines must differ");
  assert.notStrictEqual(configA.typography.headingFont, configB.typography.headingFont, "Heading fonts must reflect editorial vs technical");

  console.log("✓ Differentiation Confirmed:");
  console.log(`  - Category: "${configA.metadata.category}" vs "${configB.metadata.category}"`);
  console.log(`  - Theme Accent: ${configA.theme.accent} vs ${configB.theme.accent}`);
  console.log(`  - Heading Typography: ${configA.typography.headingFont} vs ${configB.typography.headingFont}`);
  console.log(`  - Creative Direction: ${configA.metadata.creativeDirection} vs ${configB.metadata.creativeDirection}`);
  console.log(`  - Hero Headlines: "${heroA?.content?.headline}" vs "${heroB?.content?.headline}"`);

  console.log("\n================================================================================");
  console.log("ALL REAL GEMINI AI VERIFICATION TESTS PASSED SUCCESSFULLY!");
  console.log("================================================================================");
}

runLiveVerification().catch((err) => {
  console.error("FATAL: Live verification failed:", err);
  process.exit(1);
});
