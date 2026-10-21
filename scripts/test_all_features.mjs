import { exportWebsiteZip } from "../src/lib/export/exportWebsiteZip.js";
import { validatePageConfig } from "../src/lib/validation/pageConfigSchema.js";

const BASE_URL = "http://localhost:3000";

async function runFeatureAudit() {
  console.log("================================================================================");
  console.log("FORMA COMPREHENSIVE END-TO-END FEATURE AUDIT & BUG DETECTION SUITE");
  console.log("================================================================================\n");

  let passedCount = 0;
  let failedCount = 0;

  async function testStep(name, fn) {
    process.stdout.write(`[TEST] ${name} ... `);
    const start = Date.now();
    try {
      await fn();
      const dur = Date.now() - start;
      console.log(`✓ PASSED (${dur}ms)`);
      passedCount++;
    } catch (err) {
      const dur = Date.now() - start;
      console.log(`✗ FAILED (${dur}ms)`);
      console.error(`  Error: ${err.message}\n`);
      failedCount++;
    }
  }

  let generatedProjectId = null;
  let generatedEditToken = null;
  let generatedPageConfig = null;
  let shareToken = null;

  // 1. Studio Landing Page
  await testStep("1. Studio Root Page (GET /)", async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const text = await res.text();
    if (!text.includes("Forma") && !text.includes("AI")) throw new Error("Root HTML missing expected studio markup");
  });

  // 2. Activity Ticker
  await testStep("2. Live Activity Telemetry (GET /api/activity)", async () => {
    const res = await fetch(`${BASE_URL}/api/activity`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.activities)) throw new Error("Missing activities array");
  });

  // 3. Community Showcase
  await testStep("3. Community Showcase (GET /api/community)", async () => {
    const res = await fetch(`${BASE_URL}/api/community`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.creations)) throw new Error("Missing creations array");
  });

  // 4. Presence Heartbeat
  await testStep("4. Active Presence Heartbeat (POST /api/presence)", async () => {
    const res = await fetch(`${BASE_URL}/api/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    if (typeof data.activeCreators !== "number" || data.activeCreators < 1) {
      throw new Error(`Invalid activeCreators count: ${data.activeCreators}`);
    }
  });

  // 5. AI Generation (Standard Brief)
  await testStep("5. Autonomous AI Page Generation (POST /api/generate)", async () => {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Create an autonomous AI medical diagnostic platform for clinical laboratories.",
        direction: "auto",
        themePreference: "auto",
        motionStyle: "auto",
      }),
    });
    if (res.status !== 201) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(`Expected HTTP 201, got ${res.status}: ${errBody.error || "Unknown error"}`);
    }
    const data = await res.json();
    if (!data.project || !data.project._id || !data.editToken) {
      throw new Error("Response missing project ID or editToken");
    }
    generatedProjectId = data.project._id;
    generatedEditToken = data.editToken;
    generatedPageConfig = data.project.pageConfig;

    // Validate pageConfig
    const validation = validatePageConfig(generatedPageConfig);
    if (!validation.success) {
      throw new Error(`Zod validation failed: ${JSON.stringify(validation.errors)}`);
    }
  });

  // 6. Multimodal Generation (With Image Reference)
  await testStep("6. Multimodal Reference Image Generation (POST /api/generate)", async () => {
    const res = await fetch(`${BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Create a luxury botanical perfume brand with organic extraction rituals.",
        referenceImages: [
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        ],
      }),
    });
    if (res.status !== 201) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(`Expected HTTP 201, got ${res.status}: ${errBody.error || "Unknown error"}`);
    }
    const data = await res.json();
    if (!data.project?.pageConfig?.sections?.length) {
      throw new Error("Multimodal generation returned empty sections");
    }
  });

  // 7. Project Retrieval
  await testStep("7. Project Retrieval by ID (GET /api/projects/[id])", async () => {
    if (!generatedProjectId) throw new Error("No generatedProjectId from previous test");
    const res = await fetch(`${BASE_URL}/api/projects/${generatedProjectId}`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    if (!data.project || data.project._id !== generatedProjectId) {
      throw new Error("Retrieved project ID does not match");
    }
  });

  // 8. Project Mutation Guard (Security: Token Check)
  await testStep("8. Project Mutation Guard Security (PUT /api/projects/[id])", async () => {
    if (!generatedProjectId) throw new Error("No generatedProjectId");

    // Attempt unauthorized update
    const unauthRes = await fetch(`${BASE_URL}/api/projects/${generatedProjectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-edit-token": "invalid_hacker_token",
      },
      body: JSON.stringify({
        pageConfig: generatedPageConfig,
      }),
    });
    if (unauthRes.status !== 401 && unauthRes.status !== 403) {
      throw new Error(`Expected 401/403 for unauthorized edit, got ${unauthRes.status}`);
    }

    // Authorized update with valid token
    const modifiedConfig = {
      ...generatedPageConfig,
      metadata: {
        ...generatedPageConfig.metadata,
        title: "Updated Title By Authorized Creator",
      },
    };
    const authRes = await fetch(`${BASE_URL}/api/projects/${generatedProjectId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-edit-token": generatedEditToken,
      },
      body: JSON.stringify({
        pageConfig: modifiedConfig,
      }),
    });
    if (authRes.status !== 200) {
      throw new Error(`Expected HTTP 200 for authorized update, got ${authRes.status}`);
    }
    const authData = await authRes.json();
    if (authData.project?.title !== "Updated Title By Authorized Creator") {
      throw new Error("Project title was not updated on server");
    }
  });

  // 9. Share Link Generation
  await testStep("9. 24-Hour Preview Share Link (POST /api/share)", async () => {
    if (!generatedProjectId || !generatedEditToken) throw new Error("Missing project credentials");
    const res = await fetch(`${BASE_URL}/api/share`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-edit-token": generatedEditToken,
      },
      body: JSON.stringify({
        projectId: generatedProjectId,
      }),
    });
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    if (!data.shareToken || !data.shareUrl) {
      throw new Error("Missing shareToken or shareUrl");
    }
    shareToken = data.shareToken;
  });

  // 10. Public Preview Verification
  await testStep("10. Public Preview by Token (GET /api/preview/[token])", async () => {
    if (!shareToken) throw new Error("No shareToken generated");
    const res = await fetch(`${BASE_URL}/api/preview/${shareToken}`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    if (!data.project || !data.project.pageConfig) {
      throw new Error("Preview endpoint missing project or pageConfig");
    }
  });

  // 11. Lead Capture Form Submission
  await testStep("11. Lead Capture Form Submission (POST /api/forms/submit)", async () => {
    if (!generatedProjectId) throw new Error("No generatedProjectId");
    const res = await fetch(`${BASE_URL}/api/forms/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: generatedProjectId,
        formId: "form-lead-test",
        submission: {
          fullName: "Dr. Jonathan Hayes",
          email: "j.hayes@medcenter.org",
          message: "Requesting evaluation for our clinical diagnostics lab.",
        },
      }),
    });
    if (res.status !== 200 && res.status !== 201) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Expected HTTP 200/201, got ${res.status}: ${err.error || ""}`);
    }
    const data = await res.json();
    if (!data.success) {
      throw new Error(`Form submission returned success: false`);
    }
  });

  // 12. Standalone ZIP Exporter
  await testStep("12. Standalone Website ZIP Package (exportWebsiteZip)", async () => {
    if (!generatedPageConfig) throw new Error("No generatedPageConfig available");
    const blob = await exportWebsiteZip(generatedPageConfig);
    if (!blob || blob.size < 500) {
      throw new Error(`Generated ZIP blob too small: ${blob?.size} bytes`);
    }
  });

  console.log("\n================================================================================");
  console.log(`AUDIT RESULTS: ${passedCount} PASSED, ${failedCount} FAILED (TOTAL ${passedCount + failedCount})`);
  console.log("================================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runFeatureAudit();
