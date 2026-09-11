"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SectionShell, Script } from "./primitives";
import { JourneyTimeline, type JourneyStep } from "./JourneyTimeline";

function formatKES(n: number) {
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  return `KES ${Math.round(n).toLocaleString()}`;
}

const STEPS: JourneyStep[] = [
  {
    title: "Valuation and documentation",
    description: "An independent valuer prices the asset; you assemble the title chain.",
    status: "2–3 weeks",
    statusTone: "accent",
    detail: {
      body: "This is where you hand over title documents, valuation reports, and any existing encumbrances. We coordinate the independent valuer and run the first pass of legal due diligence in parallel, so nothing sits idle.",
      note: "Who's involved",
      noteBody: "Independent RICS-accredited valuer",
      checks: ["Bank statements and rent roll for the trailing 24 months", "Certificate of official search, current within 30 days"],
    },
  },
  { title: "Legal structuring", description: "We spin up the SPV that will hold title and issue tokens.", status: "In parallel with the above" },
  { title: "Trustee appointment and title transfer", description: "Legal title moves from you into the independent trustee's name.", status: "In escrow" },
  { title: "Compliance review and regulatory filing", description: "The offering is filed with our regulated agent and lodged for approval before it goes live.", status: "Compliance-gated, not skippable" },
  { title: "Token issuance", description: "Tokens are minted 1:1 against the appraised value, held pending sale.", status: "Same-day, once approved" },
  { title: "Marketplace listing", description: "Your asset appears in the marketplace for investors to browse and fund.", status: "Goes live immediately" },
  { title: "Raise tracking and disbursement", description: "Funds settle to escrow as orders clear; you draw down on milestones.", status: "Disbursed on agreed milestones" },
];

export function RaiseCalculator() {
  const [value, setValue] = useState(50_000_000);
  const [pct, setPct] = useState(35);

  const raiseAmount = useMemo(() => (value * pct) / 100, [value, pct]);
  const retainedPct = 100 - pct;
  const feeReserve = raiseAmount * 0.02;
  const netProceeds = raiseAmount - feeReserve;

  return (
    <SectionShell
      id="raise"
      eyebrowStep="03"
      eyebrowLabel="For asset owners"
      heading={
        <>
          Raise against the building. <Script>Keep the building.</Script>
        </>
      }
      lede="Selling isn't the only way to get cash out of a property. Tokenize a defined slice, keep the rest exactly where it is."
    >
      <div className="yz-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-6">
            <p className="text-[0.625rem] uppercase tracking-wide text-ink-faint">Raise calculator</p>
            <p className="text-sm font-semibold text-ink-fg">What you could raise, and what you keep</p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-ink-faint">Asset value</span>
                <span className="font-semibold text-ink-fg">{formatKES(value)}</span>
              </div>
              <input
                type="range"
                min={2_000_000}
                max={500_000_000}
                step={1_000_000}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="yz-slider w-full"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-ink-faint">Share to tokenize</span>
                <span className="font-semibold text-ink-fg">{pct}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={90}
                step={1}
                value={pct}
                onChange={(e) => setPct(Number(e.target.value))}
                className="yz-slider w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <dl className="space-y-3 text-xs">
            <StatRow label="Capital released" value={formatKES(raiseAmount)} />
            <StatRow label="You retain" value={`${retainedPct}% + operating control`} />
            <StatRow label="Token count" value={`${Math.round(raiseAmount / 1000).toLocaleString()} units`} />
            <StatRow label="Reserved fees (est.)" value={formatKES(feeReserve)} />
            <StatRow label="Net to escrow, per raise" value={formatKES(netProceeds)} />
          </dl>

          <div className="mt-4 rounded-xl border border-amber-dim bg-amber-soft-bg px-4 py-3 text-[0.6875rem] leading-relaxed text-amber">
            Estimate only, before valuation. Final raise size depends on the independent valuer&apos;s report and how much
            of the offering actually funds — undersubscribed raises settle at whatever cleared.
          </div>

          <button type="button" className="yz-btn-primary mt-4 w-full">
            Tell us about the asset <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <JourneyTimeline
        title="The full tokenization journey: enquiry to payout"
        lede="Eight stages, most of them ours to run. This is the full sequence, including the parts that happen in parallel to save you time."
        steps={STEPS}
      />
    </SectionShell>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-card-border pb-2">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="font-semibold text-ink-fg">{value}</dd>
    </div>
  );
}
