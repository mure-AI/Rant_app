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

      <div className="rounded-xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-line bg-white px-3 py-1 text-sm font-semibold text-tide">{analysis.emotion}</span>
          <span className="rounded-md border border-line bg-white px-3 py-1 text-sm font-semibold text-muted">
            {analysis.problemType.replace("_", " ")}
          </span>
        </div>

        <div className="mt-5 grid gap-5">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Summary</h2>
            <p className="mt-2 leading-7 text-muted">{analysis.summary}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">What may be going on</h2>
            <p className="mt-2 leading-7 text-muted">{analysis.likelyProblem}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Why it might be happening</h2>
            <p className="mt-2 leading-7 text-muted">{analysis.whyItMightBeHappening}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Steps to take</h2>
            <div className="mt-3">
              <ActionStepsList steps={analysis.nextSteps} />
            </div>
          </div>
          <div className="rounded-xl border border-line bg-white p-4 font-medium text-ink">{analysis.reflectiveQuestion}</div>
          <SpeakResponseButton analysis={analysis} />
        </div>
      </div>
    </section>
  );
}
