"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { SavedEntryCard } from "@/components/SavedEntryCard";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { SavedEntry } from "@/types/entry";

export default function HistoryPage() {
  const [entries, setEntries] = useState<SavedEntry[]>([]);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const loadEntries = async () => {
      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError("Log in to view your private history.");
          setIsLoading(false);
          return;
        }

        setUser(user);

        // Load entries for authenticated user
        const { data, error: loadError } = await supabase
          .from("entries")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (loadError) {
          throw loadError;
        }

        setEntries((data || []) as SavedEntry[]);
        setError("");
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load history.");
      } finally {
        setIsLoading(false);
      }
    };

    loadEntries();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadEntries();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-clay">saved clarity</p>
          <h1 className="mt-2 text-5xl font-black">History</h1>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-stone-300 bg-white/85 p-6">
            <p className="flex items-center gap-2 font-bold text-stone-700">
              <Loader2 className="animate-spin" size={16} />
              Loading your history...
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-stone-300 bg-white/85 p-6">
            <p className="font-bold text-stone-700">{error}</p>
            <Link className="mt-4 inline-flex rounded-full bg-ink px-5 py-3 font-black text-white" href="/auth/login">
              Log in
            </Link>
          </div>
        ) : null}

        {!error && !isLoading && entries.length === 0 ? (
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
