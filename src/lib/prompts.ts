import type { AnalyzeRequest } from "@/types/analysis";

export function buildAnalysisPrompt({ inputText, inputType }: AnalyzeRequest) {
  return [
    {
      role: "system" as const,
      content: `You are Rant, a supportive reflection assistant. You are not a therapist and must not diagnose. Convert a user's ${inputType} input into calm, structured understanding.

Rules:
- Return valid JSON only.
- Use supportive, non-clinical language.
- Prefer "it sounds like" and "this may be" instead of certainty.
- Keep the summary concise.
- Identify one likely problem category.
- Give 2 to 5 practical next steps the user can do today.
- If there is self-harm, abuse, immediate danger, or crisis language, set safetyLevel to "urgent".`
    },
    {
      role: "user" as const,
      content: `Analyze this user input and return exactly this JSON shape:
{
  "emotion": "string",
  "problemType": "overwhelm | procrastination | burnout | stress | conflict | decision_fatigue | unclear",
  "summary": "string",
  "likelyProblem": "string",
  "whyItMightBeHappening": "string",
  "nextSteps": ["string"],
  "reflectiveQuestion": "This is what I think is going on. Am I right?",
  "suggestedResourceType": "person | article | website | tool | none",
  "safetyLevel": "normal | support | urgent"
}

Input:
${inputText}`
    }
  ];
}

export function fallbackAnalysis(inputText: string) {
  const lower = inputText.toLowerCase();
  const problemType = lower.includes("tired") || lower.includes("burnout")
    ? "burnout"
    : lower.includes("procrastinat") || lower.includes("avoid")
      ? "procrastination"
      : lower.includes("too much") || lower.includes("overwhel")
        ? "overwhelm"
        : "stress";

  return {
    emotion: problemType === "burnout" ? "drained" : problemType === "overwhelm" ? "overwhelmed" : "stressed",
    problemType,
    summary: "It sounds like there is a lot on your mind and you are trying to sort what actually needs attention.",
    likelyProblem: "The core issue may be that your thoughts feel bigger than the next concrete step.",
    whyItMightBeHappening:
      "When several feelings and responsibilities pile up at once, the brain often treats everything as urgent.",
    nextSteps: [
      "Write down the one thing that feels heaviest right now.",
      "Pick a 10-minute action that would make that one thing slightly clearer.",
      "Pause before adding more tasks, and decide what can wait until tomorrow."
    ],
    reflectiveQuestion: "This is what I think is going on. Am I right?",
    suggestedResourceType: "tool",
    safetyLevel: "normal"
  } as const;
}
