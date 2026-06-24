import { z } from "zod";

export const analysisSchema = z.object({
  emotion: z.string().min(1),
  problemType: z.enum([
    "overwhelm",
    "procrastination",
    "burnout",
    "stress",
    "conflict",
    "decision_fatigue",
    "unclear"
  ]),
  summary: z.string().min(1),
  likelyProblem: z.string().min(1),
  whyItMightBeHappening: z.string().min(1),
  nextSteps: z.array(z.string().min(1)).min(2).max(5),
  reflectiveQuestion: z.string().min(1),
  suggestedResourceType: z.enum(["person", "article", "website", "tool", "none"]),
  safetyLevel: z.enum(["normal", "support", "urgent"])
});

export const analyzeRequestSchema = z.object({
  inputText: z.string().trim().min(8, "Share at least a sentence so Rant has enough context."),
  inputType: z.enum(["text", "voice"])
});

export const createEntrySchema = z.object({
  id: z.string().uuid().optional(),
  inputType: z.enum(["text", "voice"]),
  originalText: z.string().optional(),
  transcript: z.string().optional(),
  audioUrl: z.string().optional(),
  analysis: analysisSchema
});

export type AnalysisSchema = z.infer<typeof analysisSchema>;
