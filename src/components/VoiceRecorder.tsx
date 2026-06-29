"use client";

import { useRef, useState, useCallback } from "react";
import { Mic, RotateCcw, Square, Loader2 } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";

type VoiceRecorderProps = {
  disabled?: boolean;
  /** Called when recording is ready with the audio blob and an optional transcript from browser speech recognition */
  onRecordingReady: (blob: Blob, transcript?: string) => void;
};

/**
 * VoiceRecorder uses the browser's built-in MediaRecorder for audio capture
 * AND the Web Speech API (SpeechRecognition) for live transcription — no API key needed.
 *
 * - Chrome / Edge / Safari: records audio + generates a transcript automatically
 * - Firefox: records audio only; user types the transcript manually in TranscriptEditor
 */
export function VoiceRecorder({ disabled, onRecordingReady }: VoiceRecorderProps) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);

  // Check if the browser supports SpeechRecognition
  const supportsSpeechRecognition =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startRecording = useCallback(async () => {
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const nextBlob = new Blob(chunks.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        setBlob(nextBlob);
        setAudioUrl(URL.createObjectURL(nextBlob));
      };

      mediaRecorder.current = recorder;
      recorder.start();
      setIsRecording(true);

      // --- Browser-based Speech Recognition ---
      if (supportsSpeechRecognition) {
        const SpeechRecognitionAPI =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();

        // Live transcription settings
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        let finalTranscript = "";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript + " ";
            }
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.warn("Speech recognition error:", event.error);
          // Don't fail entirely — user can still type the transcript manually
        };

        recognition.onend = () => {
          // Speech recognition ended (usually when recording stops)
          const trimmed = finalTranscript.trim();
          if (trimmed) {
            // Store transcript temporarily so we can pass it when user clicks "Use this recording"
            (window as any).__rant_last_transcript = trimmed;
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch {
      setError("Microphone access was blocked. You can still type what you want to say.");
    }
  }, [supportsSpeechRecognition]);

  const stopRecording = useCallback(() => {
    // Stop speech recognition first
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    // Stop media recorder
    mediaRecorder.current?.stop();
    setIsRecording(false);
    setIsProcessing(true);

    // Give speech recognition a moment to finalize, then mark processing done
    setTimeout(() => {
      setIsProcessing(false);
    }, 500);
  }, []);

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl("");
    setBlob(null);
    chunks.current = [];
    (window as any).__rant_last_transcript = "";
  }, [audioUrl]);

  const handleUseRecording = useCallback(() => {
    if (!blob) return;
    // Retrieve any transcript that was captured during recording
    const transcript: string | undefined = (window as any).__rant_last_transcript;
    onRecordingReady(blob, transcript || undefined);
    (window as any).__rant_last_transcript = "";
  }, [blob, onRecordingReady]);

  return (
    <div className="grid gap-4 rounded-lg border border-line bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-maroon px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a1f2a] disabled:opacity-60"
            disabled={disabled || isProcessing}
            onClick={startRecording}
            type="button"
          >
            {isProcessing ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <Mic size={18} aria-hidden="true" />
            )}
            {isProcessing ? "Processing..." : "Tap to record"}
          </button>
        ) : (
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold text-charcoal"
            onClick={stopRecording}
            type="button"
          >
            <Square size={17} aria-hidden="true" />
            Stop recording
          </button>
        )}

        {blob ? (
          <>
            <button
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-semibold text-muted"
              onClick={resetRecording}
              type="button"
            >
              <RotateCcw size={16} aria-hidden="true" />
              Re-record
            </button>
            <button
              className="focus-ring rounded-md bg-maroon px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a1f2a] disabled:opacity-60"
              disabled={disabled}
              onClick={handleUseRecording}
              type="button"
            >
              Use this recording
            </button>
          </>
        ) : null}
      </div>

      {/* Show a hint about browser transcription */}
      {!supportsSpeechRecognition && !error && (
        <p className="text-xs text-muted">
          Your browser does not support live transcription. Record audio, then type the transcript manually below.
        </p>
      )}

      {audioUrl ? <AudioPlayer src={audioUrl} /> : null}
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
