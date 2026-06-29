// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is missing from .env.local");
    return null;
  }

  console.log("✅ Gemini client initialized");
  return new GoogleGenerativeAI(apiKey);
}

// Current working model as of June 2026
export const geminiModel = "gemini-3.5-flash";