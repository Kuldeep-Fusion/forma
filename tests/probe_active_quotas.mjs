import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const env = fs.readFileSync("./.env.local", "utf8");
const keyMatch = env.match(/GEMINI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : "";
const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTest = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.7-flash",
];

async function check() {
  for (const m of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent("Respond with single word: READY");
      console.log(`[AVAILABLE & ACTIVE QUOTA] -> ${m}: "${res.response.text().trim()}"`);
    } catch (err) {
      console.log(`[QUOTA/ERROR] -> ${m}: ${err.message.slice(0, 120)}`);
    }
  }
}

check();
