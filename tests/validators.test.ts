import { describe, expect, it } from "vitest";
import { analysisSchema } from "@/lib/validators";

describe("analysisSchema", () => {
  it("accepts complete structured AI output", () => {
    expect(() =>
      analysisSchema.parse({
        emotion: "overwhelmed",
        problemType: "overwhelm",
        summary: "A lot is competing for attention.",
        likelyProblem: "Too many open loops.",
        whyItMightBeHappening: "Everything feels urgent at once.",
        nextSteps: ["Write it down", "Pick one task"],
        reflectiveQuestion: "This is what I think is going on. Am I right?",
        suggestedResourceType: "tool",
        safetyLevel: "normal"
      })
    ).not.toThrow();
  });

  it("rejects missing next steps", () => {
    expect(() =>
      analysisSchema.parse({
        emotion: "stressed",
        problemType: "stress",
        summary: "Stress.",
        likelyProblem: "Too much.",
        whyItMightBeHappening: "Pressure.",
        nextSteps: [],
        reflectiveQuestion: "Am I right?",
        suggestedResourceType: "tool",
        safetyLevel: "normal"
      })
    ).toThrow();
  });
});
