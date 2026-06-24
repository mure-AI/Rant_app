import type { AnalysisResult, SafetyLevel } from "@/types/analysis";

const urgentPatterns = [
  /\bkill myself\b/i,
  /\bsuicide\b/i,
  /\bend my life\b/i,
  /\bi want to die\b/i,
  /\bhurt myself\b/i,
  /\bhurt someone\b/i,
  /\bdomestic violence\b/i,
  /\babuse\b/i,
  /\bimmediate danger\b/i
];

const supportPatterns = [
  /\bpanic attack\b/i,
  /\bcan't cope\b/i,
  /\bcan not cope\b/i,
  /\bhopeless\b/i,
  /\bbreakdown\b/i
];

export function detectSafetyLevel(text: string): SafetyLevel {
  if (urgentPatterns.some((pattern) => pattern.test(text))) {
    return "urgent";
  }

  if (supportPatterns.some((pattern) => pattern.test(text))) {
    return "support";
  }

  return "normal";
}

export function urgentSafetyAnalysis(text: string): AnalysisResult {
  return {
    emotion: "distressed",
    problemType: "stress",
    summary:
      "It sounds like this may involve immediate safety or crisis-level distress. Your safety matters more than organizing the details right now.",
    likelyProblem: "You may need immediate human support and a safer environment.",
    whyItMightBeHappening:
      "When distress gets intense, it can become hard to think clearly or sort the next step alone.",
    nextSteps: [
      "If you are in immediate danger, call 911 now.",
      "Call or text 988 to reach the Suicide & Crisis Lifeline in the U.S.",
      "Text HOME to 741741 to reach the Crisis Text Line.",
      "If possible, move near another person you trust while you get support."
    ],
    reflectiveQuestion: "Are you safe right now, and can you contact a real person for support?",
    suggestedResourceType: "person",
    safetyLevel: "urgent"
  };
}
