import { validatePageConfig } from "../src/lib/validation/pageConfigSchema.js";
import { exportWebsiteZip } from "../src/lib/export/exportWebsiteZip.js";

const BASE_URL = "http://localhost:3000";

async function verifyFullProductionSuite() {
  console.log("================================================================================");
  console.log("FORMA COMPREHENSIVE PRODUCTION ARCHITECTURE & WORKFLOW VERIFICATION");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  async function step(name, fn) {
    process.stdout.write(`[AUDIT] ${name} ... `);
    const start = Date.now();
    try {
      await fn();
      const dur = Date.now() - start;
      console.log(`✓ PASSED (${dur}ms)`);
      passed++;
    } catch (e) {
      const dur = Date.now() - start;
      console.log(`✗ FAILED (${dur}ms)`);
      console.error(`  Error: ${e.message}\n`);
      failed++;
    }
  }

  let testProjectId = null;
  let testEditToken = null;
  let testPageConfig = null;

  // 1. Dashboard Page
  await step("1. Main Application Dashboard (GET /dashboard)", async () => {
    const res = await fetch(`${BASE_URL}/dashboard`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const html = await res.text();
    if (!html.includes("Forma") || !html.includes("New Landing Page")) {
      throw new Error("Dashboard HTML missing expected branding or action buttons");
    }
  });

  // 2. Project Generation from Guided Brief
  await step("2. Autonomous Generation from Brief (POST /api/generate)", async () => {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Create an autonomous AI fitness coaching platform for busy professionals with custom nutrition plans.",
        direction: "auto",
        themePreference: "auto",
        motionStyle: "auto",
      }),
    });
    if (res.status !== 201) throw new Error(`Generation failed with HTTP ${res.status}`);
    const data = await res.json();
    if (!data.project || !data.editToken) throw new Error("Missing project or editToken");
    testProjectId = data.project._id || data.project.id;
    testEditToken = data.editToken;
    testPageConfig = data.project.pageConfig;

    const val = validatePageConfig(testPageConfig);
    if (!val.success) throw new Error("Generated pageConfig failed schema validation");
  });

  // 3. AI Refinement Endpoint
  await step("3. AI Surgical Refinement (POST /api/refine)", async () => {
    if (!testProjectId || !testPageConfig) throw new Error("No project available");
    const res = await fetch(`${BASE_URL}/api/refine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-edit-token": testEditToken,
      },
      body: JSON.stringify({
        projectId: testProjectId,
        pageConfig: testPageConfig,
        prompt: "Change the color palette to warm orange and cream, and reduce animation intensity.",
      }),
    });
    if (res.status !== 200) throw new Error(`Refine endpoint returned HTTP ${res.status}`);
    const data = await res.json();
    if (!data.pageConfig || !data.pageConfig.theme) throw new Error("Missing refined pageConfig");
    const val = validatePageConfig(data.pageConfig);
    if (!val.success) throw new Error("Refined pageConfig failed validation");
    testPageConfig = data.pageConfig;
  });

  // 4. Project Duplicate Endpoint
  await step("4. Project Duplication (POST /api/projects/[id]/duplicate)", async () => {
    if (!testProjectId) throw new Error("No project to duplicate");
    const res = await fetch(`${BASE_URL}/api/projects/${testProjectId}/duplicate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-edit-token": testEditToken,
      },
    });
    if (res.status !== 201) throw new Error(`Duplicate failed with HTTP ${res.status}`);
    const data = await res.json();
    if (!data.project || !data.project.title.includes("(Copy)")) {
      throw new Error("Cloned project missing expected copy title");
    }
  });

  // 5. Assets Media Library API
  await step("5. User Media Assets Library (GET /api/assets)", async () => {
    const res = await fetch(`${BASE_URL}/api/assets`);
    if (res.status !== 200) throw new Error(`Assets route returned HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.assets)) throw new Error("Missing assets array in response");
  });

  // 6. Form Submission Endpoint
  await step("6. Form Submission Capture (POST /api/forms/submit)", async () => {
    if (!testProjectId) throw new Error("No project available");
    const res = await fetch(`${BASE_URL}/api/forms/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: testProjectId,
        formId: "contact-form",
        data: {
          fullName: "Marcus Sterling",
          email: "marcus@athletic.io",
          fitnessGoal: "Endurance & strength conditioning",
        },
      }),
    });
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Form submit returned HTTP ${res.status}`);
    }
  });

  // 7. Project Submissions Lead Retrieval
  await step("7. Project Owner Submissions Query (GET /api/forms/submissions)", async () => {
    if (!testProjectId) throw new Error("No project available");
    const res = await fetch(`${BASE_URL}/api/forms/submissions?projectId=${testProjectId}`, {
      headers: {
        "x-edit-token": testEditToken,
      },
    });
    if (res.status !== 200) throw new Error(`Submissions returned HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.submissions) || data.submissions.length === 0) {
      throw new Error("Expected at least 1 captured submission");
    }
  });

  // 8. Editor Page Compilation & Rendering
  await step("8. Live Studio Editor Canvas (GET /editor/[id])", async () => {
    if (!testProjectId) throw new Error("No project ID");
    const res = await fetch(`${BASE_URL}/editor/${testProjectId}`);
    if (res.status !== 200) throw new Error(`Editor page returned HTTP ${res.status}`);
    const html = await res.text();
    if (html.includes("ReferenceError") || html.includes("Unhandled Runtime Error")) {
      throw new Error("Editor canvas threw a runtime exception");
    }
  });

  // 9. Standalone Website ZIP Export
  await step("9. Standalone Website ZIP Exporter (exportWebsiteZip)", async () => {
    if (!testPageConfig) throw new Error("No pageConfig");
    const zip = await exportWebsiteZip(testPageConfig);
    if (!zip || zip.size < 500) throw new Error(`Generated ZIP invalid or too small (${zip?.size} bytes)`);
  });

  console.log("\n================================================================================");
  console.log(`PRODUCTION SUITE RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL ${passed + failed})`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

verifyFullProductionSuite();
