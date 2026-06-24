import type { AnalysisResult } from "@/types/analysis";
import { ActionStepsList } from "./ActionStepsList";
import { CrisisSupportBanner } from "./CrisisSupportBanner";
import { SpeakResponseButton } from "./SpeakResponseButton";

type ResultsSummaryProps = {
  analysis: AnalysisResult;
};

export function ResultsSummary({ analysis }: ResultsSummaryProps) {
  return (
    <section className="grid gap-5">
      {analysis.safetyLevel === "urgent" ? <CrisisSupportBanner /> : null}

      <div className="rounded-lg border border-stone-300 bg-white/85 p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-clay/10 px-3 py-1 text-sm font-black text-clay">{analysis.emotion}</span>
          <span className="rounded-full bg-tide/10 px-3 py-1 text-sm font-black text-tide">
            {analysis.problemType.replace("_", " ")}
          </span>
        </div>

        <div className="mt-5 grid gap-5">
          <div>
            <h2 className="text-xl font-black">Summary</h2>
            <p className="mt-2 leading-7 text-stone-700">{analysis.summary}</p>
          </div>
          <div>
            <h2 className="text-xl font-black">What may be going on</h2>
            <p className="mt-2 leading-7 text-stone-700">{analysis.likelyProblem}</p>
          </div>
          <div>
            <h2 className="text-xl font-black">Why it might be happening</h2>
            <p className="mt-2 leading-7 text-stone-700">{analysis.whyItMightBeHappening}</p>
          </div>
          <div>
            <h2 className="text-xl font-black">Steps to take</h2>
            <div className="mt-3">
              <ActionStepsList steps={analysis.nextSteps} />
            </div>
          </div>
          <div className="rounded-lg bg-stone-100 p-4 font-bold text-stone-800">{analysis.reflectiveQuestion}</div>
          <SpeakResponseButton analysis={analysis} />
        </div>
      </div>
    </section>
  );
}
