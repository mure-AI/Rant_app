"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mic2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { createClientId } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis";
import { TextRantInput } from "./TextRantInput";
import { VoiceRecorder } from "./VoiceRecorder";
import { TranscriptEditor } from "./TranscriptEditor";
import { Disclaimer } from "./Disclaimer";
import { AudioPlayer } from "./AudioPlayer";

type Mode = "text" | "voice";

function describeSaveStage(stage: string | undefined) {
  switch (stage) {
    case "auth":
      return "authentication";
    case "validation":
      return "payload validation";
    case "entry_insert":
      return "saving the entry row";
    case "action_steps_insert":
      return "saving the action steps";
    default:
      return "saving the entry";
  }
}

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const canUseSupabase = useMemo(
    () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    []
  );

  async function analyzeText(inputText: string, inputType: Mode) {
    setError("");
    setStatus("Listening for the shape under the noise...");
    setIsBusy(true);
    setIsAnalyzing(true);

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
      setIsAnalyzing(false);
    }
  }

  /**
   * Called when VoiceRecorder finishes capturing audio.
   * If the browser provided a transcript via SpeechRecognition, use it directly.
   * Otherwise leave it blank for the user to type in TranscriptEditor.
   */
  function handleVoiceReady(blob: Blob, browserTranscript?: string) {
    setError("");
    setVoiceBlob(blob);
    setVoicePreviewUrl(URL.createObjectURL(blob));
    setIsBusy(true);

    if (browserTranscript) {
      // Browser generated a transcript — set it directly, no API call needed
      setTranscript(browserTranscript);
      setStatus("Transcript ready. Give it a quick look before analysis.");
      setIsBusy(false);
    } else {
      // No browser transcription (e.g. Firefox) — user types manually
      setTranscript("");
      setStatus("Recording ready. Type what you said below, then analyze.");
      setIsBusy(false);
    }
  }

  async function saveEntry(result: AnalysisResult, inputType: Mode, inputText: string) {
    if (!canUseSupabase) {
      setStatus("Analysis ready. Add Supabase env keys to save private history.");
      return;
    }

    let audioPath = "";

    if (inputType === "voice" && voiceBlob) {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus("Analysis ready. Log in to save this entry to your private history.");
        return;
      }

      // Generate a UUID for audio file path
      const tempId = crypto.randomUUID?.() || createClientId();
      audioPath = `${user.id}/${tempId}.webm`;
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
      credentials: "include",
      body: JSON.stringify({
        inputType,
        originalText: inputType === "text" ? inputText : undefined,
        transcript: inputType === "voice" ? inputText : undefined,
        audioUrl: audioPath || undefined,
        analysis: result
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        setError(data.error || "Log in to save this entry.");
        return;
      }

      const stage = describeSaveStage(data.stage);
      throw new Error(`${data.error || "Could not save entry."} (${stage})`);
    }

    router.push(`/results/${data.id}`);
  }

  if (isAnalyzing) {
    return (
      <main className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-3xl place-items-center px-4 pb-10 sm:px-6">
        <section className="grid w-full max-w-md justify-items-center gap-5 rounded-xl border border-line bg-white p-8 text-center">
          <span className="grid size-14 place-items-center rounded-md bg-maroon text-white animate-pulse">
            <Mic2 aria-hidden="true" size={28} />
          </span>
          <div className="grid gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Analyzing your rant...</h1>
            <p className="text-sm text-muted">Hang tight while Rant turns this into clarity.</p>
          </div>
          <p className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="animate-spin" size={16} aria-hidden="true" />
            {status || "Working on your result..."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-3xl gap-6 px-4 pb-10 pt-6 sm:px-6">
      <section className="grid gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-maroon">private beta</p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">How is today going?</h1>
        <p className="max-w-xl text-base leading-7 text-muted sm:text-lg">
          Drop the thought before it chews through your afternoon. Rant will turn it into a clearer summary and a few
          doable next steps.
        </p>
        <p className="max-w-xl text-sm leading-6 text-muted">
          Use text or voice. Once Rant has enough context, it will show the emotion, likely problem, and next steps.
        </p>
      </section>

      <section className="grid gap-6 rounded-xl border border-line bg-white p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-line bg-white p-1">
          {(["text", "voice"] as const).map((nextMode) => (
            <button
              className="focus-ring rounded-md px-4 py-3 text-sm font-semibold capitalize text-muted data-[active=true]:bg-cream data-[active=true]:text-maroon"
              data-active={mode === nextMode}
              key={nextMode}
              onClick={() => setMode(nextMode)}
              type="button"
            >
              {nextMode}
            </button>
          ))}
        </div>

        <div>
          {mode === "text" ? (
            <TextRantInput disabled={isBusy} onSubmit={(text) => analyzeText(text, "text")} />
          ) : (
            <div className="grid gap-4">
              <VoiceRecorder disabled={isBusy} onRecordingReady={handleVoiceReady} />
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

        <div className="grid gap-3 border-t border-line pt-5">
          {status ? (
            <p className="flex items-center gap-2 text-sm text-muted">
              {isBusy ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : null}
              {status}
            </p>
          ) : null}
          {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <Disclaimer />
        </div>
      </section>
    </main>
  );
}
