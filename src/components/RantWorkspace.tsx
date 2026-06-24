"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { createClientId } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";
import { TextRantInput } from "./TextRantInput";
import { VoiceRecorder } from "./VoiceRecorder";
import { TranscriptEditor } from "./TranscriptEditor";
import { ResultsSummary } from "./ResultsSummary";
import { Disclaimer } from "./Disclaimer";
import { AudioPlayer } from "./AudioPlayer";

type Mode = "text" | "voice";

export function RantWorkspace() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("text");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState("");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voicePreviewUrl, setVoicePreviewUrl] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const canUseSupabase = useMemo(
    () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    []
  );

  async function analyzeText(inputText: string, inputType: Mode) {
    setError("");
    setStatus("Listening for the shape under the noise...");
    setIsBusy(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputText, inputType })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setAnalysis(data);
      setSourceText(inputText);
      setStatus("Analysis ready.");
      await saveEntry(data, inputType, inputText);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setIsBusy(false);
    }
  }

  async function transcribeRecording(blob: Blob) {
    setError("");
    setVoiceBlob(blob);
    setVoicePreviewUrl(URL.createObjectURL(blob));
    setStatus("Transcribing your recording...");
    setIsBusy(true);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "rant.webm");
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed.");
      }

      setTranscript(data.transcript);
      setStatus("Transcript ready. Give it a quick look before analysis.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not transcribe this recording.");
    } finally {
      setIsBusy(false);
    }
  }

  async function saveEntry(result: AnalysisResult, inputType: Mode, inputText: string) {
    if (!canUseSupabase) {
      setStatus("Analysis ready. Add Supabase env keys to save private history.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("Analysis ready. Log in to save this entry to your private history.");
      return;
    }

    const entryId = createClientId();
    let audioPath = "";

    if (inputType === "voice" && voiceBlob) {
      audioPath = `${user.id}/${entryId}.webm`;
      const { error: uploadError } = await supabase.storage.from("rant-audio").upload(audioPath, voiceBlob, {
        contentType: "audio/webm",
        upsert: true
      });

      if (uploadError) {
        throw new Error(uploadError.message);
      }
    }

    const response = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: entryId,
        inputType,
        originalText: inputType === "text" ? inputText : undefined,
        transcript: inputType === "voice" ? inputText : undefined,
        audioUrl: audioPath || undefined,
        analysis: result
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not save entry.");
    }

    router.push(`/results/${data.id}`);
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-6xl gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-stone-300 bg-white/85 p-5 shadow-soft sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-clay">private beta</p>
        <h1 className="mt-3 text-5xl font-black leading-none tracking-tight sm:text-7xl">How is today going?</h1>
        <p className="mt-5 max-w-md text-lg leading-8 text-stone-700">
          Drop the thought before it chews through your afternoon. Rant will turn it into a clearer summary and a few
          doable next steps.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-2 rounded-full bg-stone-200 p-1">
          {(["text", "voice"] as const).map((nextMode) => (
            <button
              className="focus-ring rounded-full px-4 py-3 text-sm font-black capitalize data-[active=true]:bg-white data-[active=true]:shadow"
              data-active={mode === nextMode}
              key={nextMode}
              onClick={() => setMode(nextMode)}
              type="button"
            >
              {nextMode}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {mode === "text" ? (
            <TextRantInput disabled={isBusy} onSubmit={(text) => analyzeText(text, "text")} />
          ) : (
            <div className="grid gap-4">
              <VoiceRecorder disabled={isBusy} onRecordingReady={transcribeRecording} />
              {voicePreviewUrl ? <AudioPlayer src={voicePreviewUrl} /> : null}
              <TranscriptEditor
                disabled={isBusy}
                onChange={setTranscript}
                onSubmit={() => analyzeText(transcript, "voice")}
                transcript={transcript}
              />
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3">
          {status ? (
            <p className="flex items-center gap-2 text-sm font-bold text-stone-600">
              {isBusy ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : null}
              {status}
            </p>
          ) : null}
          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
          <Disclaimer />
        </div>
      </section>

      <section className="min-h-[420px] rounded-lg border border-stone-300 bg-white/70 p-5 shadow-soft sm:p-7">
        {analysis ? (
          <ResultsSummary analysis={analysis} />
        ) : (
          <div className="flex h-full min-h-[420px] items-center justify-center rounded-lg border border-dashed border-stone-300 p-8 text-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-tide">waiting room</p>
              <h2 className="mt-3 text-3xl font-black">Your clarity will land here.</h2>
              <p className="mt-3 max-w-md leading-7 text-stone-600">
                Use text or voice. Once Rant has enough context, it will show the emotion, likely problem, and next
                steps.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
