import Link from "next/link";
import type { SavedEntry } from "@/types/entry";
import { formatDate } from "@/lib/utils";

type SavedEntryCardProps = {
  entry: SavedEntry;
};

export function SavedEntryCard({ entry }: SavedEntryCardProps) {
  return (
    <Link
      className="focus-ring block rounded-lg border border-stone-300 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
      href={`/results/${entry.id}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm font-black text-stone-500">
        <span>{formatDate(entry.created_at)}</span>
        {entry.problem_type ? <span>{entry.problem_type.replace("_", " ")}</span> : null}
        <span>{entry.input_type}</span>
      </div>
      <h2 className="mt-3 text-xl font-black text-ink">{entry.emotion || "Entry"}</h2>
      <p className="mt-2 line-clamp-3 leading-6 text-stone-700">{entry.summary || entry.transcript || entry.original_text}</p>
    </Link>
  );
}
