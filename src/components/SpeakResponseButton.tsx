"use client";

import { Volume2 } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

type SpeakResponseButtonProps = {
  analysis: AnalysisResult;
};

export function SpeakResponseButton({ analysis }: SpeakResponseButtonProps) {
  function speak() {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const text = [
      `Here is what I think is going on. ${analysis.summary}`,
      analysis.likelyProblem,
      "Next steps.",
      ...analysis.nextSteps
    ].join(" ");
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  return (
    <button
      className="focus-ring inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-charcoal"
      onClick={speak}
      type="button"
    >
      <Volume2 size={17} aria-hidden="true" />
      Read this aloud
    </button>
  );
}
