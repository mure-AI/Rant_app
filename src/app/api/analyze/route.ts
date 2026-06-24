import { NextResponse } from "next/server";
import { analysisModel, getOpenAIClient } from "@/lib/openai";
import { buildAnalysisPrompt, fallbackAnalysis } from "@/lib/prompts";
import { detectSafetyLevel, urgentSafetyAnalysis } from "@/lib/safety";
import { analysisSchema, analyzeRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const startedAt = performance.now();

  try {
    const body = await request.json();
    const payload = analyzeRequestSchema.parse(body);
    const safetyLevel = detectSafetyLevel(payload.inputText);

    if (safetyLevel === "urgent") {
      return NextResponse.json(urgentSafetyAnalysis(payload.inputText));
    }

    const openai = getOpenAIClient();

    if (!openai) {
      const fallback = fallbackAnalysis(payload.inputText);
      return NextResponse.json({ ...fallback, safetyLevel });
    }

    const completion = await openai.chat.completions.create({
      model: analysisModel,
      messages: buildAnalysisPrompt(payload),
      response_format: { type: "json_object" },
      temperature: 0.4
    });

    const rawContent = completion.choices[0]?.message.content;
    if (!rawContent) {
      throw new Error("The AI returned an empty response.");
    }

    const parsed = analysisSchema.parse(JSON.parse(rawContent));
    const elapsedMs = Math.round(performance.now() - startedAt);

    return NextResponse.json({
      ...parsed,
      safetyLevel: safetyLevel === "support" && parsed.safetyLevel === "normal" ? "support" : parsed.safetyLevel,
      metrics: {
        analysisLatencyMs: elapsedMs
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
