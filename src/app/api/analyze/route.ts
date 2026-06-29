import { NextResponse } from "next/server";
import { getGeminiClient, geminiModel } from "@/lib/gemini";
import { buildAnalysisPrompt, fallbackAnalysis } from "@/lib/prompts";
import { detectSafetyLevel, urgentSafetyAnalysis } from "@/lib/safety";
import { analysisSchema, analyzeRequestSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function POST(request: Request) {
  const startedAt = performance.now();

  try {
    const body = await request.json();
    const payload = analyzeRequestSchema.parse(body);
    const safetyLevel = detectSafetyLevel(payload.inputText);

    if (safetyLevel === "urgent") {
      return NextResponse.json(urgentSafetyAnalysis(payload.inputText));
    }

    const gemini = getGeminiClient();

    let parsed;

    if (gemini) {
      try {
        console.log(`🔍 Using Gemini model: ${geminiModel}`);

        const model = gemini.getGenerativeModel({
          model: geminiModel,
          systemInstruction: buildAnalysisPrompt(payload)[0].content,
        });

        const userPrompt = buildAnalysisPrompt(payload)[1].content;

        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.4,
          },
        });

        const rawText = result.response.text();

        if (!rawText) {
          throw new Error("Gemini returned an empty response.");
        }

        parsed = analysisSchema.parse(JSON.parse(rawText));
        console.log("✅ Gemini analysis successful");
      } catch (geminiError: any) {
        console.error("❌ Gemini failed:", geminiError.message);
        // Fall through to fallbackAnalysis below
      }
    }

    // If Gemini wasn't available or failed, use the built-in fallback
    if (!parsed) {
      console.log("Using built-in fallback analysis");
      const fallback = fallbackAnalysis(payload.inputText);
      return NextResponse.json({ ...fallback, safetyLevel });
    }

    const elapsedMs = Math.round(performance.now() - startedAt);

    return NextResponse.json({
      ...parsed,
      safetyLevel:
        safetyLevel === "support" && parsed.safetyLevel === "normal"
          ? "support"
          : parsed.safetyLevel,
      metrics: {
        analysisLatencyMs: elapsedMs,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error instanceof Error ? error.message : error);

    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      const message = firstIssue?.message || "Validation failed.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
