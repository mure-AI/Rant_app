"use client";

import { useState } from "react";

export function FeedbackButtons() {
  const [choice, setChoice] = useState("");

  return (
    <div className="flex flex-wrap gap-2">
      {["Helpful", "Somewhat", "Not quite"].map((label) => (
        <button
          className="focus-ring rounded-lg border border-line bg-white px-4 py-2 text-sm font-black text-muted data-[active=true]:bg-maroon data-[active=true]:text-white"
          data-active={choice === label}
          key={label}
          onClick={() => setChoice(label)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
