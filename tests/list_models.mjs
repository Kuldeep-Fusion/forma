import fs from "fs";

const env = fs.readFileSync("./.env.local", "utf8");
const keyMatch = env.match(/GEMINI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : "";

async function listAllModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models) {
      console.log("AVAILABLE MODELS:");
      data.models.forEach((m) => {
        if (m.supportedGenerationMethods?.includes("generateContent")) {
          console.log(`- ${m.name.replace("models/", "")} (${m.displayName})`);
        }
      });
    } else {
      console.log("No models returned or error:", data);
    }
  } catch (err) {
    console.error("Failed to list models:", err.message);
  }
}

listAllModels();
