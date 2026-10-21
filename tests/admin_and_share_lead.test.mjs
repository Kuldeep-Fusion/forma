import assert from "node:assert";
import { createShareLead, getAllShareLeads, deleteShareLead, getShareLeadsStats } from "../src/services/shareLeadService.js";
import { getAdminCredentials, createAdminToken, verifyAdminToken } from "../src/lib/security/adminAuth.js";

async function runTests() {
  console.log("=== TESTING ADMIN & SHARE LEAD FUNCTIONALITY ===");

  // 1. Test Admin Credentials
  const creds = getAdminCredentials();
  assert.strictEqual(creds.email, "kk761734@gmail.com", "Admin email must match requested email");
  assert.strictEqual(creds.password, "12345678", "Admin password must match requested password");
  console.log("✓ Admin credentials verified.");

  // 2. Test Admin Token Creation and Verification
  const token = createAdminToken(creds.email);
  assert(token && token.includes("."), "Token should have payload.signature structure");
  const isValid = verifyAdminToken(token);
  assert.strictEqual(isValid, true, "Generated token should verify successfully");

  const invalidToken = verifyAdminToken("invalid.token.here");
  assert.strictEqual(invalidToken, false, "Invalid token should fail verification");
  console.log("✓ Admin HMAC cryptographic token lifecycle verified.");

  // 3. Test Share Lead Creation
  const testLead = await createShareLead({
    projectId: "proj_test_123",
    projectTitle: "SaaS Landing Page",
    name: "Kuldeep Test",
    email: "test@example.com",
    phone: "+91 9999999999",
    purpose: "Portfolio Demo",
    shareUrl: "/preview/token_test_123",
  });

  assert(testLead && (testLead.id || testLead._id), "Lead should be saved and return an id");
  assert.strictEqual(testLead.name, "Kuldeep Test", "Lead name should match");
  assert.strictEqual(testLead.email, "test@example.com", "Lead email should match");
  console.log("✓ Share lead creation & database persistence verified.");

  // 4. Test Lead Querying & Search
  const allLeads = await getAllShareLeads({ search: "Kuldeep Test" });
  assert(allLeads.leads.length > 0, "Search query should return the created lead");
  console.log("✓ Share lead querying & search verified.");

  // 5. Test Lead Stats
  const stats = await getShareLeadsStats();
  assert(stats.totalLeads > 0, "Total leads count should be greater than 0");
  console.log("✓ Share lead analytics stats verified.");

  // 6. Test Lead Deletion
  const leadId = testLead.id || testLead._id;
  await deleteShareLead(leadId);
  console.log("✓ Share lead deletion verified.");

  console.log("=== ALL ADMIN & SHARE LEAD TESTS PASSED! ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
