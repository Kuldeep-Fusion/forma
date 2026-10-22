import assert from "assert";
import { validatePageConfig } from "../src/lib/validation/pageConfigSchema.js";
import { generateMockLandingPage } from "../src/lib/ai/mockGenerator.js";
import { generateSecureToken, hashToken, timingSafeEqual } from "../src/lib/security/crypto.js";
import {
  createProject,
  getProjectById,
  updateProject,
  createShareToken,
  getPublicPreviewByToken,
  getCreatedTodayCount,
} from "../src/services/projectService.js";
import {
  recordPresenceHeartbeat,
  getActiveCreatorsCount,
} from "../src/services/presenceService.js";

async function runTests() {
  console.log("=== RUNNING FORMA FULL-STACK TEST SUITE ===");

  // 1. Test Crypto Primitives
  console.log("\n[TEST 1] Testing Cryptographic Primitives...");
  const rawToken = generateSecureToken(32);
  assert.strictEqual(rawToken.length, 64, "Raw token must be 64 hex characters (32 bytes)");
  const hashed = hashToken(rawToken);
  assert.strictEqual(hashed.length, 64, "Hashed token must be 64 hex characters (SHA-256)");
  assert.strictEqual(timingSafeEqual(hashed, hashed), true, "Timing-safe equal should match same hash");
  assert.strictEqual(timingSafeEqual(hashed, "other"), false, "Timing-safe equal should reject different hash");
  console.log("✓ Crypto primitives verified.");

  // 2. Test Zod Page Configuration Schema
  console.log("\n[TEST 2] Testing Page Configuration Schema Validation...");
  const mockConfig = generateMockLandingPage({
    prompt: "Neural acoustic synthesizer workstation",
    direction: "experimental",
    themePreference: "electric_blue",
    motionStyle: "cinematic",
  });
  const validation = validatePageConfig(mockConfig);
  assert.strictEqual(validation.success, true, "Valid configuration must pass Zod schema");

  const invalidConfig = { ...mockConfig, sections: [{ id: "bad", type: "invalid_type", isVisible: true, content: {} }] };
  const invalidValidation = validatePageConfig(invalidConfig);
  assert.strictEqual(invalidValidation.success, false, "Invalid section type must be rejected");
  console.log("✓ Zod page configuration validation verified.");

  // 3. Test Project Creation & Authorization
  console.log("\n[TEST 3] Testing Project Persistence & Authorization...");
  const ownerSessionId = `test_sess_${generateSecureToken(8)}`;
  const { project, editToken } = await createProject({
    title: "Test Project Alfa",
    ownerSessionId,
    pageConfig: mockConfig,
    prompt: "Test prompt",
  });
  assert.ok(project._id || project.id, "Project must have an ID");
  assert.ok(editToken, "Edit capability token must be generated");

  // Retrieve as owner
  const retrievedAsOwner = await getProjectById(project._id || project.id, {
    ownerSessionId,
  });
  assert.strictEqual(retrievedAsOwner.canEdit, true, "Owner must have canEdit: true");

  // Retrieve as unauthorized stranger
  const retrievedAsStranger = await getProjectById(project._id || project.id, {
    ownerSessionId: "stranger_session",
  });
  assert.strictEqual(retrievedAsStranger.canEdit, false, "Stranger must have canEdit: false");

  // Retrieve with valid edit token
  const retrievedWithToken = await getProjectById(project._id || project.id, {
    editToken,
  });
  assert.strictEqual(retrievedWithToken.canEdit, true, "Possession of editToken must grant canEdit: true");
  console.log("✓ Project persistence & authorization verified.");

  // 4. Test Project Update
  console.log("\n[TEST 4] Testing Project Mutation Guard...");
  // Attempt unauthorized update
  let unauthorizedFailed = false;
  try {
    await updateProject(project._id || project.id, { title: "Hacked Title" }, { ownerSessionId: "stranger" });
  } catch (err) {
    unauthorizedFailed = true;
  }
  assert.strictEqual(unauthorizedFailed, true, "Unauthorized mutation must throw error");

  // Authorized update
  const updated = await updateProject(
    project._id || project.id,
    { title: "Updated Alfa Title" },
    { editToken }
  );
  assert.strictEqual(updated.title, "Updated Alfa Title", "Authorized update must succeed");
  console.log("✓ Mutation authorization guards verified.");

  // 5. Test 24-Hour Preview Expiration Lifecycle
  console.log("\n[TEST 5] Testing 24-Hour Preview Expiration Lifecycle...");
  const shareResult = await createShareToken(project._id || project.id, { editToken });
  assert.ok(shareResult.shareToken, "Share token must be generated");
  assert.ok(shareResult.shareUrl.includes(shareResult.shareToken), "Share URL must contain token");

  const expiresDate = new Date(shareResult.expiresAt);
  const now = new Date();
  const diffHours = (expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  assert.ok(diffHours >= 23.9 && diffHours <= 24.1, "Expiration must be set to exactly 24 hours in the future");

  // Verify active preview retrieval
  const activePreview = await getPublicPreviewByToken(shareResult.shareToken);
  assert.strictEqual(activePreview.status, "active", "Newly generated preview must be active");
  assert.strictEqual(activePreview.project.title, "Updated Alfa Title");
  assert.strictEqual(activePreview.project.ownerSessionId, undefined, "Owner session ID must NEVER leak");
  assert.strictEqual(activePreview.project.editTokenHash, undefined, "Edit token hash must NEVER leak");

  // Test expired link enforcement
  console.log("Testing expired link enforcement simulation...");
  // Force expiration in DB/fallback store
  await updateProject(project._id || project.id, { shareExpiresAt: new Date(Date.now() - 1000) }, { editToken });
  const expiredPreview = await getPublicPreviewByToken(shareResult.shareToken);
  assert.strictEqual(expiredPreview.status, "expired", "Expired preview must be rejected server-side with 'expired' status");
  console.log("✓ 24-Hour preview lifecycle & server-side expiration verified.");

  // 6. Test Presence & Telemetry
  console.log("\n[TEST 6] Testing Presence Telemetry & Real Counts...");
  const sessionA = `sess_a_${generateSecureToken(4)}`;
  const sessionB = `sess_b_${generateSecureToken(4)}`;
  await recordPresenceHeartbeat(sessionA, { ip: "127.0.0.1" });
  await recordPresenceHeartbeat(sessionB, { ip: "127.0.0.1" });

  const activeCount = await getActiveCreatorsCount();
  assert.ok(activeCount >= 2, "Active count must reflect unique active sessions");

  const createdCount = await getCreatedTodayCount();
  assert.ok(createdCount >= 1, "Created today count must reflect created records");
  // 7. Test Domain Detection & Image Resolver
  console.log("\n[TEST 7] Testing Domain Detection & Visual Art Direction...");
  const { detectDomainFromPrompt } = await import("../src/lib/ai/imageResolver.js");
  assert.strictEqual(detectDomainFromPrompt("Create a premium luxury skincare landing page"), "healthcare_wellness");
  assert.strictEqual(detectDomainFromPrompt("AI cybersecurity startup enterprise threat detection"), "ai_startup");
  assert.strictEqual(detectDomainFromPrompt("Italian fine-dining restaurant with reservations and seasonal menu"), "restaurants_hospitality");
  assert.strictEqual(detectDomainFromPrompt("Architectural photographer portfolio brutalist"), "portfolio_agency");
  assert.strictEqual(detectDomainFromPrompt("Real estate landing page premium homes in Delhi NCR"), "real_estate");
  console.log("✓ Domain detection verified across all target industries.");

  // 8. Test Prompt-to-Layout Diversity & Unique Composition Rules
  console.log("\n[TEST 8] Testing Prompt-Driven Layout Diversity & Non-Identical Compositions...");
  const prompts = [
    { prompt: "Create a premium luxury skincare landing page for an organic skincare brand targeting women who prefer minimalist products.", expectedDomain: "healthcare_wellness" },
    { prompt: "Build a bold futuristic landing page for an AI cybersecurity startup selling enterprise threat detection.", expectedDomain: "ai_startup" },
    { prompt: "Create a modern restaurant website for an Italian fine-dining restaurant with reservations and a seasonal menu.", expectedDomain: "restaurants_hospitality" },
    { prompt: "Design an editorial portfolio for a creative photographer specializing in architecture.", expectedDomain: "portfolio_agency" },
    { prompt: "Build a real estate landing page that helps families discover premium homes in Delhi NCR.", expectedDomain: "real_estate" },
  ];

  const generatedConfigs = [];
  for (const item of prompts) {
    const config = generateMockLandingPage({ prompt: item.prompt });
    const val = validatePageConfig(config);
    assert.strictEqual(val.success, true, `Generated config for ${item.expectedDomain} must be valid Zod schema: ${JSON.stringify(val.errors)}`);
    assert.ok(config.designConcept, `Config must contain designConcept for ${item.expectedDomain}`);
    assert.strictEqual(config.designConcept.businessType, item.expectedDomain, `BusinessType must match detected domain ${item.expectedDomain}`);
    generatedConfigs.push({ prompt: item.prompt, domain: item.expectedDomain, config });
  }

  // Verify that hero layout variants are genuinely different
  const heroVariants = new Set(generatedConfigs.map(c => {
    const hero = c.config.sections.find(s => s.type === "hero");
    return hero?.content?.layoutVariant || hero?.layoutVariant;
  }));
  assert.ok(heroVariants.size >= 3, `Expected at least 3 distinct hero layout variants across prompts, found: ${Array.from(heroVariants).join(", ")}`);

  // Verify that showcase variants adapt to the business
  const restaurantConfig = generatedConfigs.find(c => c.domain === "restaurants_hospitality").config;
  const restaurantShowcase = restaurantConfig.sections.find(s => s.type === "showcase");
  assert.strictEqual(restaurantShowcase?.content?.layoutVariant || restaurantShowcase?.layoutVariant, "menu", "Restaurant must use 'menu' showcase with culinary pricing");

  const realEstateConfig = generatedConfigs.find(c => c.domain === "real_estate").config;
  const realEstateShowcase = realEstateConfig.sections.find(s => s.type === "showcase");
  assert.strictEqual(realEstateShowcase?.content?.layoutVariant || realEstateShowcase?.layoutVariant, "properties", "Real estate must use 'properties' showcase with BHK/sqft specs");

  const restaurantCta = restaurantConfig.sections.find(s => s.type === "cta");
  assert.strictEqual(restaurantCta?.content?.layoutVariant || restaurantCta?.layoutVariant, "reservation", "Restaurant must have 'reservation' CTA layout");

  // Verify primary/accent colors are different
  const accentColors = new Set(generatedConfigs.map(c => c.config.theme?.accent));
  assert.ok(accentColors.size >= 4, `Expected at least 4 distinct accent colors across prompts, found: ${Array.from(accentColors).join(", ")}`);

  console.log(`✓ Verified genuine layout diversity: ${heroVariants.size} hero variants, domain-specific showcase/cta variants, and ${accentColors.size} distinct color themes.`);

  // 9. Test Domain Detection Across All 12 Industry Sectors
  console.log("\n[TEST 9] Testing Domain Detection Across All 12 Industry Sectors...");
  const twelveSectors = [
    { prompt: "Next-generation SaaS workflow analytics dashboard", expected: "saas" },
    { prompt: "Enterprise B2B global supply chain compliance", expected: "b2b" },
    { prompt: "Boutique intellectual property law agency & consulting", expected: "service_business" },
    { prompt: "Full-stack developer bootcamp curriculum and interactive masterclass courses", expected: "education" },
    { prompt: "Autonomous neural LLM agent framework with sub-millisecond execution", expected: "ai_startup" },
    { prompt: "Architectural monograph studio portfolio and gallery exhibitions", expected: "portfolio_agency" },
    { prompt: "Luxury botanical skincare serum and cold-pressed facial oils", expected: "healthcare_wellness" },
    { prompt: "Ultra-luxury Delhi NCR penthouses, diplomatic villas, and Golf Links estates", expected: "real_estate" },
    { prompt: "Holistic wellness medical clinic and private regenerative dermatology", expected: "healthcare_wellness" },
    { prompt: "Michelin-starred Italian fine dining with chef's tasting menu and vintage wine cellar", expected: "restaurants_hospitality" },
    { prompt: "Decentralized treasury wealth management and sovereign fintech assets", expected: "fintech_finance" },
    { prompt: "Global AI developer summit keynote conference and hackathon", expected: "events_community" },
  ];

  for (const item of twelveSectors) {
    const detected = detectDomainFromPrompt(item.prompt);
    assert.strictEqual(detected, item.expected, `Prompt "${item.prompt.slice(0, 30)}..." should detect domain "${item.expected}", got "${detected}"`);
  }
  console.log("✓ All 12 industry domain detections verified accurately.");

  // 10. Test Form Section Schema & Contextual Form Generator
  console.log("\n[TEST 10] Testing Form Section Schema & Generator Insertion...");
  const formConfig = generateMockLandingPage({
    prompt: "Luxury architecture studio inquiry form and commission consultation",
  });
  const formValidation = validatePageConfig(formConfig);
  assert.strictEqual(formValidation.success, true, "Config with form section must pass Zod schema validation");

  const formSec = formConfig.sections.find((s) => s.type === "form");
  assert.ok(formSec, "Prompt requesting inquiry form must generate a 'form' section");
  assert.ok(Array.isArray(formSec.content.fields), "Form section must contain fields array");
  assert.ok(formSec.content.fields.length >= 3, "Form section must contain at least 3 input fields");
  assert.ok(formSec.content.fields.some((f) => f.type === "email"), "Form section must contain an email field");
  console.log("✓ Form section schema and contextual generator insertion verified.");

  // 11. Test Standalone Website ZIP Exporter
  console.log("\n[TEST 11] Testing Standalone Website ZIP Exporter...");
  const { exportWebsiteZip } = await import("../src/lib/export/exportWebsiteZip.js");
  const zipBlob = await exportWebsiteZip(formConfig);
  assert.ok(zipBlob, "ExportWebsiteZip must produce a valid ZIP blob");
  console.log("✓ Standalone website ZIP export generated successfully without errors.");

  // Cleanup test artifacts
  try {
    const { connectToDatabase } = await import("../src/lib/db/mongodb.js");
    const Project = (await import("../src/models/Project.js")).default;
    const db = await connectToDatabase();
    if (db) {
      await Project.deleteMany({ title: { $regex: /Alfa/i } });
    }
  } catch (e) {
    // ignore
  }

  try {
    const fs = await import("fs");
    const path = await import("path");
    const fallbackPath = path.join(process.cwd(), ".data", "projects.json");
    if (fs.existsSync(fallbackPath)) {
      const data = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
      const filtered = data.filter((p) => !p.title?.includes("Alfa"));
      fs.writeFileSync(fallbackPath, JSON.stringify(filtered, null, 2), "utf-8");
    }
  } catch (e) {
    // ignore
  }

  console.log("\n========================================================");
  console.log("ALL 11 FORMA 2.0 INTEGRATION, ENGINE & BUILD TESTS PASSED!");
  console.log("========================================================");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});

