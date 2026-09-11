"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  ShoppingBag,
  Wallet as WalletIcon,
  Receipt,
  BarChart3,
  TrendingUp,
  Settings,
  Search,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  ChevronDown,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ShieldX,
  LogOut,
  UserRound,
} from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Marketplace", href: "/marketplace", icon: <ShoppingBag className="h-4 w-4" /> },
  { label: "My Portfolio", href: "/portfolio", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Yield", href: "/yield", icon: <TrendingUp className="h-4 w-4" /> },
  { label: "Wallet", icon: <WalletIcon className="h-4 w-4" /> },
  { label: "Transactions", href: "/transactions", icon: <Receipt className="h-4 w-4" /> },
];

export function DashboardShell({
  children,
  headerRight,
}: {
  children: ReactNode;
  headerRight?: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-ink text-ink-fg">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-card-border bg-ink-2 px-4 py-6">
        <Link href="/" className="flex items-center gap-2 px-2 mb-8">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-accent-dim bg-accent-soft-bg">
            <span className="h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="font-bold tracking-tight">Yeshara</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/marketplace" ? pathname.startsWith("/marketplace") : !!item.href && pathname.startsWith(item.href);
            if (!item.href) {
              return (
                <div
                  key={item.label}
                  title="Coming soon"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-faint cursor-default select-none"
                >
                  {item.icon}
                  {item.label}
                </div>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-accent-soft-bg text-accent" : "text-ink-muted hover:bg-card hover:text-ink-fg"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-card-border">
          <Link
            href="/profile"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === "/profile" ? "bg-accent-soft-bg text-accent" : "text-ink-muted hover:bg-card hover:text-ink-fg"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar headerRight={headerRight} />
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

function TopBar({ headerRight }: { headerRight?: ReactNode }) {
  return (
    <header className="flex items-center gap-3 sm:gap-4 border-b border-card-border bg-ink/90 backdrop-blur px-4 sm:px-6 h-16 sticky top-0 z-20">
      <div className="relative flex-1 max-w-xs hidden sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
        <input
          placeholder="Search…"
          className="w-full rounded-lg bg-card border border-card-border pl-9 pr-3 py-2 text-sm text-ink-fg placeholder:text-ink-faint outline-none focus:border-accent"
          disabled
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          title="Coming soon"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-card-border-strong px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-card"
        >
          <ArrowDownToLine className="h-3.5 w-3.5" />
          Deposit
        </button>
        <button
          type="button"
          title="Coming soon"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-card-border-strong px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-card"
        >
          <ArrowUpFromLine className="h-3.5 w-3.5" />
          Withdraw
        </button>
        <button
          type="button"
          title="No notifications yet"
          className="rounded-lg p-2 text-ink-muted hover:bg-card hover:text-ink-fg"
        >
          <Bell className="h-4 w-4" />
        </button>
        {headerRight}
        <ProfileMenu />
      </div>
    </header>
  );
}

function initials(name?: string, email?: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

const KYC_META: Record<string, { icon: ReactNode; label: string; cls: string }> = {
  unverified: { icon: <ShieldAlert className="h-3.5 w-3.5" />, label: "Unverified", cls: "text-ink-faint" },
  pending: { icon: <Clock className="h-3.5 w-3.5" />, label: "Pending review", cls: "text-amber" },
  verified: { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Verified", cls: "text-accent" },
  rejected: { icon: <ShieldX className="h-3.5 w-3.5" />, label: "Rejected", cls: "text-danger" },
};

function ProfileMenu() {
  const router = useRouter();
  const { investor, kycStatus, profile, signOut, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (loading) return null;

  if (!investor) {
    return (
      <Link href="/sign-in" className="yz-btn-primary px-3 py-1.5 text-xs">
        Sign in
      </Link>
    );
  }

  const kyc = kycStatus ? KYC_META[kycStatus] : null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-card"
      >
        <div className="h-8 w-8 rounded-full bg-accent-soft-bg border border-accent-dim flex items-center justify-center text-xs font-semibold text-accent">
          {initials(investor.fullName, investor.email)}
        </div>
        <div className="hidden sm:block text-left leading-tight">
          <p className="text-sm font-medium text-ink-fg">{investor.fullName}</p>
          <p className="text-[0.7rem] text-ink-faint">{investor.email}</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 yz-card shadow-xl py-2 z-30">
          <div className="px-4 py-3 border-b border-card-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent-soft-bg border border-accent-dim flex items-center justify-center text-sm font-semibold text-accent shrink-0">
                {initials(investor.fullName, investor.email)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-ink-fg">{investor.fullName}</p>
                <p className="text-xs text-ink-faint truncate">{investor.email}</p>
              </div>
            </div>
            {kyc && (
              <div className={`mt-3 flex items-center gap-1.5 text-xs ${kyc.cls}`}>
                {kyc.icon}
                {kyc.label}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-b border-card-border space-y-2 text-xs text-ink-faint">
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{profile?.address || "No address on file — add one from your profile."}</span>
            </div>
            {profile?.country && (
              <div className="pl-5 text-ink-faint">{profile.country}</div>
            )}
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                router.push("/profile");
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-ink-muted hover:bg-card-hover"
            >
              <UserRound className="h-4 w-4" />
              View full profile
            </button>
            <button
              onClick={() => {
                setOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-card-hover"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
