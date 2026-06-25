"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History, LogIn, LogOut, Mic2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export function AppHeader() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error("Failed to get user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

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
        
        {!isLoading && (
          <>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-stone-700">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-clay px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Log out
                </button>
              </div>
            ) : (
              <Link
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5"
                href="/auth/login"
              >
                <LogIn size={16} aria-hidden="true" />
                Log in
              </Link>
            )}
          </>
        )}
      </nav>
    </header>
  );
}
