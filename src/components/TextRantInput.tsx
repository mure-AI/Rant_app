"use client";

type TextRantInputProps = {
  disabled?: boolean;
  onSubmit: (text: string) => void;
};

export function TextRantInput({ disabled, onSubmit }: TextRantInputProps) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const text = String(formData.get("rant") || "").trim();

        if (!text) {
          return;
        }

        onSubmit(text);
      }}
    >
      <label className="grid gap-2 text-sm font-black text-stone-900" htmlFor="rant">
        What needs to get out?
        <textarea
          className="focus-ring min-h-44 resize-y rounded-lg border border-stone-300 bg-white/95 p-4 text-base font-medium leading-7 text-stone-900 shadow-inner placeholder:text-stone-400"
          disabled={disabled}
          id="rant"
          maxLength={4000}
          name="rant"
          placeholder="Type the thing. No polish required."
          required
        />
      </label>
      <button
        className="focus-ring rounded-full bg-clay px-5 py-3 font-black text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60"
        disabled={disabled}
        type="submit"
      >
        Turn this into clarity
      </button>
    </form>
  );
}
