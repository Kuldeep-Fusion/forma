import fs from "fs";

// Load environment variables from .env.local
const env = fs.readFileSync("./.env.local", "utf8");
for (const line of env.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
}

import { generateLandingPageWithGemini } from "../src/lib/ai/gemini.js";

async function testGeneration() {
  console.log("Testing live generation with Gemini model:", process.env.GEMINI_MODEL);
  try {
    const pageConfig = await generateLandingPageWithGemini({
      prompt: "Boutique Italian architectural studio with contact and commission inquiry form",
      direction: "editorial",
      themePreference: "ai_suggested",
      motionStyle: "cinematic",
    });

    console.log("✓ Live Gemini generation successful!");
    console.log("Title:", pageConfig.metadata.title);
    console.log("Category:", pageConfig.metadata.category);
    console.log("Sections count:", pageConfig.sections.length);
    console.log("Section types:", pageConfig.sections.map(s => s.type).join(", "));
    console.log("Theme accent:", pageConfig.theme.accent);
  } catch (err) {
    console.error("✗ Live Gemini generation failed:", err);
  }
}

testGeneration();
