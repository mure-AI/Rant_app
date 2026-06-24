import { PhoneCall } from "lucide-react";

export function CrisisSupportBanner() {
  return (
    <section className="rounded-lg border border-red-300 bg-red-50 p-5 text-red-950">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-red-100">
          <PhoneCall size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-black">Immediate support may matter most right now</h2>
          <p className="mt-2 leading-6">
            If you are in immediate danger, call 911. In the U.S., call or text 988 for the Suicide & Crisis Lifeline,
            or text HOME to 741741 for the Crisis Text Line.
          </p>
        </div>
      </div>
    </section>
  );
}
