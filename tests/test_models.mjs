import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const env = fs.readFileSync("./.env.local", "utf8");
const keyMatch = env.match(/GEMINI_API_KEY=(.*)/);
const apiKey = keyMatch ? keyMatch[1].trim() : "";
console.log("Using API Key:", apiKey ? apiKey.slice(0, 10) + "..." : "MISSING");

const genAI = new GoogleGenerativeAI(apiKey);

const candidateModels = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
];

async function checkModels() {
  for (const m of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const res = await model.generateContent("Respond with single word: OK");
      console.log(`[PASS] ${m} -> ${res.response.text().trim()}`);
    } catch (err) {
      console.log(`[FAIL] ${m} -> ${err.message}`);
    }
  }
}

checkModels();
