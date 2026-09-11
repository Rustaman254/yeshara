"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Invest", href: "#calculator" },
  { label: "Tokenize your asset", href: "#raise" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "FAQ", href: "#faq" },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-accent-dim bg-accent-soft-bg">
        <span className="h-2 w-2 rounded-full bg-accent" />
      </span>
      <span className="text-base font-bold tracking-tight text-ink-fg">Yeshara</span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <div className="dark bg-ink">
      <div className="flex items-center justify-between gap-4 border-b border-card-border px-6 py-2 text-[0.6875rem] text-ink-faint">
        <span>Yeshara is now CMA-licensed for real estate tokenization.</span>
        <Link href="#how-it-works" className="hidden shrink-0 items-center gap-1 text-accent hover:text-accent-strong sm:flex">
          See how registration works <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <header className="sticky top-0 z-40 border-b border-card-border bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
          <Logo />

          <nav className="hidden flex-1 items-center gap-6 text-sm text-ink-muted lg:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="transition-colors hover:text-ink-fg">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <button type="button" className="yz-pill">
              KES
            </button>
            <Link href="/sign-in" className="text-sm font-medium text-ink-muted hover:text-ink-fg">
              Sign in
            </Link>
            <Link href="/sign-up" className="yz-btn-primary px-4 py-2 text-[0.8125rem]">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-auto rounded-lg border border-card-border p-2 text-ink-fg lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-card-border px-6 py-4 lg:hidden">
            <nav className="flex flex-col gap-3 text-sm text-ink-muted">
              {NAV_LINKS.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setOpen(false)} className="hover:text-ink-fg">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex items-center gap-3">
              <Link href="/sign-in" className="text-sm font-medium text-ink-muted hover:text-ink-fg">
                Sign in
              </Link>
              <Link href="/sign-up" className="yz-btn-primary px-4 py-2 text-[0.8125rem]">
                Get started <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
