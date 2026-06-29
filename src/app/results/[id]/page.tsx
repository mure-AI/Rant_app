import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { AudioPlayer } from "@/components/AudioPlayer";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { ResultsSummary } from "@/components/ResultsSummary";
import { FollowUpInput } from "@/components/FollowUpInput";
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
          <div className="rounded-xl border border-line bg-white p-6">
            <p className="text-sm text-charcoal/80">{error}</p>
            <Link className="mt-4 inline-flex rounded-md bg-maroon px-5 py-3 text-sm font-semibold text-white" href="/auth/login">
              Log in
            </Link>
          </div>
        ) : null}

        {analysis ? (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maroon">saved result</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">What Rant heard</h1>
            </div>

            {signedAudioUrl ? (
              <section className="rounded-xl border border-line bg-white p-5">
                <h2 className="mb-3 text-xl font-semibold tracking-tight">Original recording</h2>
                <AudioPlayer src={signedAudioUrl} />
              </section>
            ) : null}

            <ResultsSummary analysis={analysis} />

            <section className="rounded-xl border border-line bg-white p-5">
              <h2 className="text-xl font-semibold tracking-tight">Was this useful?</h2>
              <div className="mt-3">
                <FeedbackButtons />
              </div>
            </section>

            <FollowUpInput entryId={params.id} />
          </>
        ) : null}
      </main>
    </>
  );
}
