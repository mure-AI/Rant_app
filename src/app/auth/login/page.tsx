"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsBusy(true);

    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email"));
      const password = String(formData.get("password"));
      const supabase = createSupabaseBrowserClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

      if (loginError) {
        throw loginError;
      }

      // Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.refresh();
      router.push("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not log in.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4">
      <form className="grid w-full gap-4 rounded-lg border border-stone-300 bg-white/85 p-6 shadow-soft" onSubmit={handleSubmit}>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-clay">welcome back</p>
          <h1 className="mt-2 text-4xl font-black">Log in</h1>
        </div>
        <input className="focus-ring rounded-lg border border-stone-300 px-4 py-3" name="email" placeholder="Email" required type="email" />
        <input className="focus-ring rounded-lg border border-stone-300 px-4 py-3" name="password" placeholder="Password" required type="password" />
        {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
        <button className="focus-ring rounded-full bg-ink px-5 py-3 font-black text-white disabled:opacity-60" disabled={isBusy} type="submit">
          Log in
        </button>
        <Link className="text-sm font-bold text-tide" href="/auth/signup">
          Need an account? Sign up
        </Link>
      </form>
    </main>
  );
}
