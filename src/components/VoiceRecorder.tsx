"use client";

import { useRef, useState } from "react";
import { Mic, RotateCcw, Square } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";

type VoiceRecorderProps = {
  disabled?: boolean;
  onRecordingReady: (blob: Blob) => void;
};

export function VoiceRecorder({ disabled, onRecordingReady }: VoiceRecorderProps) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);

  async function startRecording() {
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
    } catch {
      setError("Microphone access was blocked. You can still type what you want to say.");
    }
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  }

  function resetRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl("");
    setBlob(null);
    chunks.current = [];
  }

  return (
    <div className="grid gap-4 rounded-lg border border-line bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-maroon px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a1f2a] disabled:opacity-60"
            disabled={disabled}
            onClick={startRecording}
            type="button"
          >
            <Mic size={18} aria-hidden="true" />
            Tap to record
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
              onClick={() => onRecordingReady(blob)}
              type="button"
            >
              Use this recording
            </button>
          </>
        ) : null}
      </div>

      {audioUrl ? <AudioPlayer src={audioUrl} /> : null}
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
