import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { SavedEntryCard } from "@/components/SavedEntryCard";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { SavedEntry } from "@/types/entry";

export default async function HistoryPage() {
  let entries: SavedEntry[] = [];
  let error = "";

  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      error = "Log in to view your private history.";
    } else {
      const { data, error: loadError } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (loadError) {
        throw loadError;
      }

      entries = (data || []) as SavedEntry[];
    }
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Could not load history.";
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-clay">saved clarity</p>
          <h1 className="mt-2 text-5xl font-black">History</h1>
        </div>

        {error ? (
          <div className="rounded-lg border border-stone-300 bg-white/85 p-6">
            <p className="font-bold text-stone-700">{error}</p>
            <Link className="mt-4 inline-flex rounded-full bg-ink px-5 py-3 font-black text-white" href="/auth/login">
              Log in
            </Link>
          </div>
        ) : null}

        {!error && entries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-white/70 p-8 text-center">
            <h2 className="text-2xl font-black">No saved entries yet.</h2>
            <Link className="mt-4 inline-flex rounded-full bg-clay px-5 py-3 font-black text-white" href="/">
              Start a rant
            </Link>
          </div>
        ) : null}

        <div className="grid gap-4">
          {entries.map((entry) => (
            <SavedEntryCard entry={entry} key={entry.id} />
          ))}
        </div>
      </main>
    </>
  );
}
