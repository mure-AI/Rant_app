export type ProblemType =
  | "overwhelm"
  | "procrastination"
  | "burnout"
  | "stress"
  | "conflict"
  | "decision_fatigue"
  | "unclear";

export type ResourceType = "person" | "article" | "website" | "tool" | "none";

export type SafetyLevel = "normal" | "support" | "urgent";

export type AnalysisResult = {
  emotion: string;
  problemType: ProblemType;
  summary: string;
  likelyProblem: string;
  whyItMightBeHappening: string;
  nextSteps: string[];
  reflectiveQuestion: string;
  suggestedResourceType: ResourceType;
  safetyLevel: SafetyLevel;
};

export type AnalyzeRequest = {
  inputText: string;
  inputType: "text" | "voice";
};
