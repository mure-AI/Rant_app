"use client";

import { useState } from "react";

export function NotesEditor() {
  const [notes, setNotes] = useState("");

  return (
    <label className="grid gap-2 text-sm font-black text-stone-900">
      Notes for later
      <textarea
        className="focus-ring min-h-28 rounded-lg border border-stone-300 bg-white p-4 font-medium leading-7"
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Add anything you want to remember after this settles."
        value={notes}
      />
    </label>
  );
}
