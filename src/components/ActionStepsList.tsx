"use client";

import { CheckCircle2 } from "lucide-react";

type ActionStepsListProps = {
  steps: string[];
};

export function ActionStepsList({ steps }: ActionStepsListProps) {
  return (
    <ol className="grid gap-3">
      {steps.map((step, index) => (
        <li className="flex gap-3 rounded-lg border border-line bg-white p-4" key={`${step}-${index}`}>
          <CheckCircle2 className="mt-0.5 shrink-0 text-olive" size={20} aria-hidden="true" />
          <span className="leading-6 text-muted">{step}</span>
        </li>
      ))}
    </ol>
  );
}
