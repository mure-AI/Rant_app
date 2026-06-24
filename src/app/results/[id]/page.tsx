import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AudioPlayer } from "@/components/AudioPlayer";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { ResultsSummary } from "@/components/ResultsSummary";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { AnalysisResult } from "@/types/analysis";

type ResultsPageProps = {
  params: {
    id: string;
  };
};

export default async function ResultsPage({ params }: ResultsPageProps) {
  let entry: any = null;
  let signedAudioUrl = "";
  let error = "";

  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      error = "Log in to view this saved entry.";
    } else {
      const { data, error: loadError } = await supabase
        .from("entries")
        .select("*, action_steps(*)")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (loadError) {
        throw loadError;
      }

      entry = data;

      if (entry.audio_url) {
        const { data: signed } = await supabase.storage.from("rant-audio").createSignedUrl(entry.audio_url, 60 * 30);
        signedAudioUrl = signed?.signedUrl || "";
      }
    }
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Could not load this entry.";
  }

  const analysis = entry?.ai_response as AnalysisResult | null;

  return (
    <>
      <AppHeader />
      <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 pb-10 sm:px-6">
        {error ? (
          <div className="rounded-lg border border-stone-300 bg-white/85 p-6">
            <p className="font-bold text-stone-700">{error}</p>
            <Link className="mt-4 inline-flex rounded-full bg-ink px-5 py-3 font-black text-white" href="/auth/login">
              Log in
            </Link>
          </div>
        ) : null}

        {analysis ? (
          <>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-clay">saved result</p>
              <h1 className="mt-2 text-5xl font-black">What Rant heard</h1>
            </div>

            {signedAudioUrl ? (
              <section className="rounded-lg border border-stone-300 bg-white/85 p-5">
                <h2 className="mb-3 text-xl font-black">Original recording</h2>
                <AudioPlayer src={signedAudioUrl} />
              </section>
            ) : null}

            <ResultsSummary analysis={analysis} />

            <section className="rounded-lg border border-stone-300 bg-white/85 p-5">
              <h2 className="text-xl font-black">Was this useful?</h2>
              <div className="mt-3">
                <FeedbackButtons />
              </div>
            </section>
          </>
        ) : null}
      </main>
    </>
  );
}
