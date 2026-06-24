"use client";

import type { ResourceType } from "@/types/analysis";

type ResourceSelectorProps = {
  recommended: ResourceType;
  value: ResourceType;
  onChange: (value: ResourceType) => void;
};

const options: ResourceType[] = ["person", "article", "website", "tool"];

export function ResourceSelector({ recommended, value, onChange }: ResourceSelectorProps) {
  return (
    <div className="grid gap-3">
      <p className="text-sm font-bold text-stone-600">
        Recommended first: <span className="text-ink">{recommended === "none" ? "tool" : recommended}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            className="focus-ring rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-black capitalize text-stone-700 data-[active=true]:bg-ink data-[active=true]:text-white"
            data-active={value === option}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
