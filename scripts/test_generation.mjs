
const TEST_PROMPTS = [
  {
    domain: "Luxury Skincare",
    prompt: "Create a premium luxury skincare landing page for an organic skincare brand targeting women who prefer minimalist products.",
    direction: "editorial",
  },
  {
    domain: "AI Cybersecurity",
    prompt: "Build a bold futuristic landing page for an AI cybersecurity startup selling enterprise threat detection.",
    direction: "futuristic",
  },
  {
    domain: "Italian Restaurant",
    prompt: "Create a modern restaurant website for an Italian fine-dining restaurant with reservations and a seasonal menu.",
    direction: "editorial",
  },
  {
    domain: "Architectural Photography",
    prompt: "Design an editorial portfolio for a creative photographer specializing in architecture.",
    direction: "minimal",
  },
  {
    domain: "Delhi NCR Real Estate",
    prompt: "Build a real estate landing page that helps families discover premium homes in Delhi NCR.",
    direction: "editorial",
  },
];

async function runTestGenerations() {
  console.log("=== STARTING GENERATION TEST ACROSS 5 PROMPTS ===\n");
  const results = [];

  for (let i = 0; i < TEST_PROMPTS.length; i++) {
    const item = TEST_PROMPTS[i];
    console.log(`[TEST ${i + 1}/5] Prompt: "${item.prompt}"`);
    console.log(`Generating for ${item.domain}...`);

    try {
      const response = await fetch("http://localhost:3001/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: item.prompt,
          direction: item.direction,
          themePreference: "ai_suggested",
          motionStyle: "cinematic",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const config = data.project?.pageConfig || data.pageConfig;
      if (!config) {
        throw new Error(`No pageConfig returned in response: ${JSON.stringify(data)}`);
      }

      const hero = config.sections.find((s) => s.type === "hero");
      const showcase = config.sections.find((s) => s.type === "showcase");
      const cta = config.sections.find((s) => s.type === "cta");
      const features = config.sections.find((s) => s.type === "features");

      const summary = {
        domain: item.domain,
        title: config.metadata?.title,
        businessType: config.designConcept?.businessType || config.metadata?.designConcept?.businessType,
        targetAudience: config.designConcept?.targetAudience || config.metadata?.designConcept?.targetAudience,
        conversionGoal: config.designConcept?.conversionGoal || config.metadata?.designConcept?.conversionGoal,
        colorPalette: {
          name: config.theme?.name,
          bg: config.theme?.bg,
          accent: config.theme?.accent,
        },
        heroVariant: hero?.content?.layoutVariant || hero?.layoutVariant || "standard",
        heroHeadline: hero?.content?.headline,
        heroMediaUrl: hero?.content?.media?.url?.slice(0, 70) + "...",
        showcaseVariant: showcase?.content?.layoutVariant || showcase?.layoutVariant || "none",
        showcaseItemCount: showcase?.content?.items?.length || 0,
        featuresVariant: features?.content?.layoutVariant || features?.layoutVariant || "none",
        ctaVariant: cta?.content?.layoutVariant || cta?.layoutVariant || "none",
        sectionTypes: config.sections.map((s) => s.type),
        totalSections: config.sections.length,
      };

      results.push(summary);
      console.log(`✓ Successfully generated unique design for ${item.domain}`);
      console.log(JSON.stringify(summary, null, 2));
      console.log("--------------------------------------------------\n");
    } catch (err) {
      console.error(`✗ Error generating for ${item.domain}:`, err.message);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log("\n=== SUMMARY OF GENERATED VARIATIONS ===");
  console.table(
    results.map((r) => ({
      Domain: r.domain,
      Title: r.title?.slice(0, 30),
      "Hero Variant": r.heroVariant,
      "Showcase Variant": r.showcaseVariant,
      "CTA Variant": r.ctaVariant,
      "Theme Accent": r.colorPalette.accent,
      "Section Count": r.totalSections,
    }))
  );
}

runTestGenerations().catch((err) => {
  console.error("FATAL RUNNER ERROR:", err);
  process.exit(1);
});
