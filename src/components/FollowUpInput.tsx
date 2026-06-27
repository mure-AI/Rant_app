"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type FollowUpInputProps = {
  entryId: string;
  onSubmit?: (followUp: string) => void;
};

export function FollowUpInput({ entryId, onSubmit }: FollowUpInputProps) {
  const [followUpText, setFollowUpText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!followUpText.trim()) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/entries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: entryId,
          followUp: followUpText
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save follow-up");
      }

      setMessage("Thanks for the clarification! This helps Rant understand you better.");
      setFollowUpText("");
      onSubmit?.(followUpText);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
      <h2 className="text-xl font-semibold tracking-tight">Did I understand you?</h2>
      <p className="mt-2 text-sm text-muted">If not, please share more context to help refine the analysis.</p>
      
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
        <textarea
          value={followUpText}
          onChange={(e) => setFollowUpText(e.target.value)}
          disabled={isSubmitting}
          placeholder="Share more details or clarify what I might have missed..."
          className="focus-ring min-h-[100px] rounded-lg border border-line bg-white p-3 text-sm text-ink placeholder:text-slate-400 disabled:bg-slate-100"
        />
        
        <button
          type="submit"
          disabled={isSubmitting || !followUpText.trim()}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-tide px-4 py-2.5 text-sm font-semibold text-white disabled:bg-slate-400 sm:w-auto"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
          {isSubmitting ? "Saving..." : "Share More"}
        </button>

        {message && (
          <p className={`text-sm font-medium ${message.includes("Failed") || message.includes("wrong") ? "text-red-700" : "text-moss"}`}>
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
