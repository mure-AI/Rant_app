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
      <label className="grid gap-2 text-sm font-semibold text-charcoal" htmlFor="rant">
        What needs to get out?
        <textarea
          className="focus-ring min-h-44 resize-y rounded-lg border border-line bg-white p-4 text-base leading-7 text-charcoal placeholder:text-slate-400"
          disabled={disabled}
          id="rant"
          maxLength={4000}
          name="rant"
          placeholder="Type the thing. No polish required."
          required
        />
      </label>
      <button
        className="focus-ring rounded-md bg-maroon px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4a1f2a] disabled:opacity-60"
        disabled={disabled}
        type="submit"
      >
        Turn this into clarity
      </button>
    </form>
  );
}
