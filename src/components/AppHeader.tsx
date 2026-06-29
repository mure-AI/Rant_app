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
    <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <Link className="flex items-center gap-3 font-semibold tracking-tight text-charcoal" href="/">
        <span className="grid size-9 place-items-center rounded-md bg-maroon text-white">
          <Mic2 size={19} aria-hidden="true" />
        </span>
        <span className="text-lg">Rant</span>
      </Link>

      <nav className="flex items-center gap-2">
        <Link
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-terracotta hover:text-terracotta"
          href="/history"
        >
          <History size={16} aria-hidden="true" />
          History
        </Link>
        
        {!isLoading && (
          <>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="focus-ring inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-terracotta hover:text-terracotta"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Log out
                </button>
              </div>
            ) : (
              <Link
                className="focus-ring inline-flex items-center gap-2 rounded-md bg-maroon px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a1f2a]"
                href="/auth/login"
              >
                <LogIn size={16} aria-hidden="true" />
                Log in
              </Link>
            )}
          </>
        )}
      </nav>
      </div>
    </header>
  );
}
