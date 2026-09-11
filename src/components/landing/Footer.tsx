"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Mail } from "lucide-react";
import { Logo } from "./Header";

const COLUMNS = [
  { title: "About", links: [{ label: "What we do", href: "#how-it-works" }, { label: "Asset owners", href: "#raise" }, { label: "Careers", href: "/careers" }] },
  { title: "Invest through us", links: [{ label: "Marketplace", href: "/marketplace" }, { label: "Get started", href: "/sign-up" }, { label: "Fees", href: "#fees" }] },
  { title: "Contact", links: [{ label: "Help centre", href: "/help" }, { label: "Regulatory notices", href: "/legal/notices" }, { label: "Insights", href: "/blog" }, { label: "Contact us", href: "/contact" }] },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/legal/terms" },
      { label: "Privacy policy", href: "/legal/privacy", tag: "Updated 2026" },
      { label: "Disclosure policy", href: "/legal/disclosure", tag: "Updated 2026" },
      { label: "Risk disclosure", href: "/legal/risk" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="dark border-t border-card-border bg-ink-2">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-muted">
              Real estate ownership in Kenya, priced from KES 1,000 and settled on-chain.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setDone(true);
              }}
              className="mt-5 flex max-w-xs items-center gap-2"
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email address"
                className="yz-input py-2 text-xs"
              />
              <button type="submit" className="yz-btn-primary shrink-0 px-4 py-2 text-xs">
                Subscribe
              </button>
            </form>
            {done && <p className="mt-2 text-xs text-accent">You&apos;re subscribed.</p>}

            <div className="mt-5 flex gap-2">
              <a href="https://yeshara.co" target="_blank" rel="noreferrer" aria-label="Website" className="flex h-8 w-8 items-center justify-center rounded-full border border-card-border-strong text-ink-muted hover:border-accent-dim hover:text-accent">
                <Globe className="h-3.5 w-3.5" />
              </a>
              <a href="mailto:hello@yeshara.co" aria-label="Email" className="flex h-8 w-8 items-center justify-center rounded-full border border-card-border-strong text-ink-muted hover:border-accent-dim hover:text-accent">
                <Mail className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[0.625rem] uppercase tracking-wide text-ink-faint">{col.title}</p>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-xs text-ink-muted hover:text-ink-fg">
                        {l.label}
                      </Link>
                      {"tag" in l && l.tag && <span className="ml-1.5 text-[0.625rem] text-amber">{l.tag}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-card-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-4 text-[0.6875rem] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Yeshara Tokens Limited. All rights reserved.</span>
          <span>Regulated by the Capital Markets Authority, Kenya. Not a bank deposit.</span>
        </div>
      </div>
    </footer>
  );
}
