"use client";

type TranscriptEditorProps = {
  disabled?: boolean;
  transcript: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function TranscriptEditor({ disabled, transcript, onChange, onSubmit }: TranscriptEditorProps) {
  if (!transcript) {
    return null;
  }

  return (
    <section className="grid gap-3 rounded-lg border border-stone-300 bg-white/80 p-4">
      <label className="grid gap-2 text-sm font-black text-stone-900" htmlFor="transcript">
        Review transcript
        <textarea
          className="focus-ring min-h-36 rounded-lg border border-stone-300 p-4 leading-7"
          disabled={disabled}
          id="transcript"
          onChange={(event) => onChange(event.target.value)}
          value={transcript}
        />
      </label>
      <button
        className="focus-ring rounded-full bg-clay px-5 py-3 font-black text-white disabled:opacity-60"
        disabled={disabled || transcript.trim().length < 8}
        onClick={onSubmit}
        type="button"
      >
        Analyze this transcript
      </button>
    </section>
  );
}
