"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import * as api from "@/lib/api";
import { LogOut } from "lucide-react";

// Deliberately not DashboardShell — that component's nav is investor-shaped
// (Marketplace/Portfolio/Yield/Transactions), which doesn't apply to an
// owner account. Just enough chrome for a single-page dashboard.
export function OwnerShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  const signOut = async () => {
    try {
      await api.ownerLogout();
    } catch {
      // best-effort — clear locally regardless
    }
    api.clearOwnerSessionToken();
    router.push("/owner/sign-in");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0912] text-neutral-900 dark:text-neutral-100">
      <header className="flex items-center gap-3 border-b border-neutral-200 dark:border-white/5 bg-white/90 dark:bg-[#0b0912]/90 backdrop-blur px-4 sm:px-6 h-16 sticky top-0 z-20">
        <Link href="/owner/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center text-xs font-bold text-white">Y</div>
          <span className="font-semibold tracking-tight">Yeshara — Owner</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </header>
      <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-4xl mx-auto">{children}</main>
    </div>
  );
}
