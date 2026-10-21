import assert from "assert";

async function testHttpEndpoints() {
  console.log("=== VERIFYING FORMA HTTP LIVE APP & RENDERER ===");

  // 1. Check Homepage
  console.log("\n[TEST 1] Fetching Homepage (http://localhost:3000)...");
  const homeRes = await fetch("http://localhost:3000");
  assert.strictEqual(homeRes.status, 200, "Homepage must return HTTP 200");
  const homeHtml = await homeRes.text();
  assert.ok(homeHtml.includes("Autonomous AI Senior Designer"), "Homepage must render Autonomous badge");
  assert.ok(homeHtml.includes("AI designs the rest"), "Homepage must render new headline");
  console.log("✓ Homepage renders with Autonomous Senior Designer branding & One-Prompt UX.");

  // 2. Test Live HTTP API Generation
  console.log("\n[TEST 2] Testing Autonomous Generation via HTTP POST /api/generate...");
  const prompt = "Create a landing page for an eco-friendly clothing brand with organic cotton and carbon-neutral shipping.";
  const genStart = Date.now();
  const genRes = await fetch("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      // Notice: direction, themePreference, and motionStyle are omitted to test 100% autonomous inference!
    }),
  });

  assert.ok(genRes.status === 200 || genRes.status === 201, `API generation returned ${genRes.status}`);
  const genData = await genRes.json();
  assert.ok(genData.success, "Response must indicate success");
  assert.ok(genData.project, "Response must return project");
  assert.ok(genData.editToken, "Response must return editToken");
  
  const proj = genData.project;
  const config = proj.pageConfig;
  const duration = ((Date.now() - genStart) / 1000).toFixed(1);

  console.log(`✓ HTTP API Generation succeeded in ${duration}s!`);
  console.log(`  - Project ID: ${proj._id || proj.id}`);
  console.log(`  - Inferred Direction: ${config.metadata.creativeDirection}`);
  console.log(`  - Inferred Palette: ${config.theme.name} (${config.theme.accent})`);
  console.log(`  - Inferred Motion: ${config.motion.preset}`);
  console.log(`  - Sections: ${config.sections.length} (${config.sections.map(s => s.type).join(" → ")})`);

  const projId = proj._id || proj.id;
  const editToken = genData.editToken;

  // 3. Test Share Token Generation (POST /api/share)
  console.log(`\n[TEST 3] Generating 24-Hour Share Token (POST /api/share)...`);
  const shareRes = await fetch(`http://localhost:3000/api/share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-edit-token": editToken,
    },
    body: JSON.stringify({ projectId: projId, editToken }),
  });
  assert.strictEqual(shareRes.status, 200, "Share endpoint must return HTTP 200");
  const shareData = await shareRes.json();
  assert.ok(shareData.shareToken, "Share response must return shareToken");
  console.log(`✓ 24-Hour Share token generated: ${shareData.shareToken.slice(0, 16)}...`);

  // 4. Test Public Preview Route (/preview/:token)
  console.log(`\n[TEST 4] Testing Public Preview Route (http://localhost:3000/preview/${shareData.shareToken})...`);
  const previewRes = await fetch(`http://localhost:3000/preview/${shareData.shareToken}`);
  assert.strictEqual(previewRes.status, 200, "Preview route must return HTTP 200");
  const previewHtml = await previewRes.text();
  assert.ok(previewHtml.length > 500, "Preview page must render HTML content");
  console.log(`✓ Preview page rendered successfully (${previewHtml.length} bytes HTML).`);

  // 5. Test Visual Editor Route (/editor/:id)
  console.log(`\n[TEST 5] Testing Visual Editor Route (http://localhost:3000/editor/${projId})...`);
  const editorRes = await fetch(`http://localhost:3000/editor/${projId}`);
  assert.strictEqual(editorRes.status, 200, "Editor route must return HTTP 200");
  console.log("✓ Visual Editor route loads successfully with HTTP 200.");

  console.log("\n========================================================");
  console.log("ALL HTTP ENDPOINTS, AUTONOMOUS API & RENDERERS VERIFIED!");
  console.log("========================================================");
}

testHttpEndpoints().catch((err) => {
  console.error("HTTP endpoint verification error:", err);
  process.exit(1);
});
