import Link from "next/link";
import { History, LogIn, Mic2 } from "lucide-react";

export function AppHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <Link className="flex items-center gap-3 font-black tracking-tight text-ink" href="/">
        <span className="grid size-10 place-items-center rounded-full bg-ink text-white">
          <Mic2 size={19} aria-hidden="true" />
        </span>
        <span className="text-xl">Rant</span>
      </Link>

      <nav className="flex items-center gap-2">
        <Link
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-bold text-stone-700 shadow-sm transition hover:-translate-y-0.5"
          href="/history"
        >
          <History size={16} aria-hidden="true" />
          History
        </Link>
        <Link
          className="focus-ring inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
          href="/auth/login"
        >
          <LogIn size={16} aria-hidden="true" />
          Log in
        </Link>
      </nav>
    </header>
  );
}
