import assert from "assert";

async function testApiEndpoints() {
  console.log("=== TESTING LIVE HTTP /api/generate ENDPOINT ===");

  // 1. Test Empty Prompt
  console.log("\n[TEST 1] Testing Empty Prompt Guard...");
  const resEmpty = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "" }),
  });
  const dataEmpty = await resEmpty.json();
  assert.strictEqual(resEmpty.status, 400, "Empty prompt must return HTTP 400");
  assert.ok(dataEmpty.error.includes("at least 3 characters"), "Must report minimum character requirement");
  console.log("✓ Empty prompt returned HTTP 400 with message:", dataEmpty.error);

  // 2. Test Too Short Prompt
  console.log("\n[TEST 2] Testing Short Prompt Guard...");
  const resShort = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "hi" }),
  });
  const dataShort = await resShort.json();
  assert.strictEqual(resShort.status, 400, "Short prompt must return HTTP 400");
  console.log("✓ Short prompt returned HTTP 400 with message:", dataShort.error);

  // 3. Test Live AI Generation via HTTP Endpoint
  console.log("\n[TEST 3] Testing Live AI Generation via /api/generate...");
  const prompt = "Artisanal Kyoto ceramic teaware atelier with private masterclass booking";
  const start = Date.now();
  const resGen = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      direction: "editorial",
      themePreference: "ai_suggested",
      motionStyle: "cinematic",
    }),
  });
  const duration = Date.now() - start;
  const dataGen = await resGen.json();

  assert.strictEqual(resGen.status, 201, "Successful generation must return HTTP 201");
  assert.strictEqual(dataGen.success, true, "Must return success: true");
  assert.strictEqual(dataGen.provider, "gemini", "Provider must strictly be 'gemini'");
  assert.ok(dataGen.project, "Project must be returned");
  assert.ok(dataGen.project.pageConfig, "Project must include pageConfig");
  assert.ok(dataGen.project.pageConfig.sections.length >= 6, "Must have comprehensive sections");
  assert.strictEqual(Boolean(dataGen.editToken), true, "Edit token must be returned");

  console.log(`✓ Real Gemini AI generation completed via HTTP /api/generate in ${duration}ms!`);
  console.log(`  Project ID: ${dataGen.project._id || dataGen.project.id}`);
  console.log(`  Title: "${dataGen.project.pageConfig.metadata.title}"`);
  console.log(`  Provider: "${dataGen.provider}" (VERIFIED NO MOCK FALLBACK)`);
  console.log(`  Sections: ${dataGen.project.pageConfig.sections.length}`);
  console.log(`  Diagnostics duration: ${dataGen.diagnostics?.durationMs}ms`);

  // 4. Test Fetching the Generated Project via /api/projects/:id
  console.log("\n[TEST 4] Testing Reopening Saved Project via /api/projects/:id...");
  const projId = dataGen.project._id || dataGen.project.id;
  const resProj = await fetch(`http://localhost:3000/api/projects/${projId}`, {
    headers: { "x-edit-token": dataGen.editToken },
  });
  const dataProj = await resProj.json();
  assert.strictEqual(resProj.status, 200, "Project fetch must return HTTP 200");
  assert.strictEqual(dataProj.project.title, dataGen.project.pageConfig.metadata.title);
  assert.strictEqual(dataProj.project.canEdit, true, "Owner with editToken must have canEdit: true");
  console.log(`✓ Project ${projId} successfully verified and retrieved from store!`);

  console.log("\n=== ALL HTTP API ENDPOINT INTEGRATION TESTS PASSED ===");
}

testApiEndpoints().catch((err) => {
  console.error("HTTP endpoint test failed:", err);
  process.exit(1);
});
