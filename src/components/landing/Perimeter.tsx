"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { SectionShell, Script } from "./primitives";

const CARDS = [
  { status: "Live now", tone: "teal" as const, title: "CMA registration, live", body: "Yeshara Tokens Limited is a licensed capital markets intermediary, not an unregistered issuer testing the waters." },
  { status: "Live now", tone: "teal" as const, title: "Real estate first", body: "Our first regulated asset class, with independent valuers and a trustee structure already proven across live offerings." },
  { status: "Live now", tone: "teal" as const, title: "Escrow via a licensed partner", body: "Investor funds settle through a licensed escrow bank, verified independently of our own systems." },
  { status: "In progress", tone: "amber" as const, title: "Licensing beyond real estate", body: "Extending the same structure to private credit and infrastructure, pending separate regulatory sign-off." },
  { status: "In progress", tone: "amber" as const, title: "Trustee network expansion", body: "Onboarding additional independent trustees so no single relationship becomes a bottleneck." },
  { status: "In progress", tone: "amber" as const, title: "Secondary liquidity depth", body: "Market-making partnerships to tighten spreads as the marketplace's daily volume grows." },
];

const ROWS = [
  { label: "Minimum", tokenized: "KES 1,000", other: "Typically KES 500,000+" },
  { label: "Settlement", tokenized: "Same-day, on-chain", other: "T+3 or longer, off-chain" },
  { label: "Ownership record", tokenized: "Registered share, per asset", other: "Fund units, pooled" },
  { label: "Exit route", tokenized: "Marketplace, anytime", other: "Fund redemption windows" },
  { label: "Fee visibility", tokenized: "Published per offering", other: "Often bundled" },
  { label: "Asset selection", tokenized: "Choose the specific asset", other: "Whatever's in the fund" },
  { label: "Custody", tokenized: "Trustee-held, off-platform", other: "Fund manager-held" },
];

export function Perimeter() {
  const [compare, setCompare] = useState<"reit" | "outright">("reit");

  return (
    <SectionShell
      tone="ink-2"
      eyebrowStep="08"
      eyebrowLabel="Where we stand"
      heading={
        <>
          Built inside the perimeter, <Script>not ahead of it.</Script>
        </>
      }
      lede="Every claim below is either true today or explicitly marked as work in progress — nothing here gets ahead of the license."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.title} className="yz-card p-5">
            <span className={c.tone === "teal" ? "yz-badge-teal" : "yz-badge-live"}>{c.status}</span>
            <p className="mt-3 text-sm font-semibold text-ink-fg">{c.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCompare("reit")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              compare === "reit" ? "bg-accent text-ink" : "border border-card-border-strong text-ink-muted hover:border-accent-dim"
            }`}
          >
            Compared with a REIT
          </button>
          <button
            type="button"
            onClick={() => setCompare("outright")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              compare === "outright" ? "bg-accent text-ink" : "border border-card-border-strong text-ink-muted hover:border-accent-dim"
            }`}
          >
            Compared with buying outright
          </button>
        </div>

        <div className="yz-card overflow-hidden">
          <div className="grid grid-cols-[110px_1fr_1fr] border-b border-card-border">
            <span className="px-5 py-3 text-[0.6875rem] uppercase tracking-wide text-ink-faint">Criteria</span>
            <span className="bg-accent-soft-bg px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-wide text-accent">Tokenized property</span>
            <span className="px-5 py-3 text-[0.6875rem] uppercase tracking-wide text-ink-faint">
              {compare === "reit" ? "Traditional REIT" : "Buying outright"}
            </span>
          </div>
          {ROWS.map((r) => (
            <div key={r.label} className="grid grid-cols-[110px_1fr_1fr] border-b border-card-border text-xs last:border-0">
              <span className="px-5 py-3 text-ink-faint">{r.label}</span>
              <span className="flex items-start gap-2 bg-accent-soft-bg px-5 py-3 text-ink-fg">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
                {r.tokenized}
              </span>
              <span className="px-5 py-3 text-ink-muted">{compare === "reit" ? r.other : r.other.replace("Fund", "Whole-asset").replace("fund", "purchase")}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 max-w-2xl text-xs text-ink-faint">
          Comparisons are illustrative and describe typical structures in the Kenyan market as of 2026 — individual
          REITs, funds or private sales may differ from the general case shown above.
        </p>
      </div>
    </SectionShell>
  );
}
