"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SectionShell, Script } from "./primitives";
import { JourneyTimeline, type JourneyStep } from "./JourneyTimeline";

const MODES = [
  { key: "rental", label: "Rental income", sub: "Quarterly payout", rate: 0.065 },
  { key: "hold", label: "Buy and hold", sub: "Price appreciation only", rate: 0.09 },
  { key: "flex", label: "Flex exit", sub: "Sell on the marketplace", rate: 0.075 },
] as const;

function formatKES(n: number) {
  return `KES ${Math.round(n).toLocaleString()}`;
}

const STEPS: JourneyStep[] = [
  {
    title: "Create your account",
    description: "Register with your name, email, phone and a chosen password.",
    status: "Instant",
    statusTone: "accent",
    detail: {
      body: "Register with your name, email, phone and a chosen password. You're issued a custodial wallet on Stellar the moment your account is created, so you're ready to fund it right away.",
      note: "Next up",
      noteBody: "Identity verification (KYC/AML).",
      checks: ["Sponsored gas — no wallet setup or seed phrase required", "A personal reference code, unique to your account"],
    },
  },
  { title: "Complete identity verification (KYC/AML)", description: "Upload a government-issued ID we verify against real-time databases.", status: "Same-day, typically", statusTone: "accent" },
  { title: "Browse and reserve an asset", description: "Filter by asset type, expected yield, minimum order and tenor. Reserve an order in one tap.", status: "As long as you need" },
  { title: "Fund your account", description: "Send money via M-Pesa, Airtel Money, bank transfer, or crypto direct.", status: "Minutes to clear via mobile money" },
  { title: "Tokens land", description: "Once your order clears, tokens are minted directly into your registered wallet.", status: "Immediate, once funded" },
  { title: "Track your income and distributions", description: "See net rental income, distributions and redemptions on your dashboard.", status: "Ongoing, per distribution schedule" },
  { title: "Opt to trade or exit to liquidity event", description: "List on our marketplace or wait for the asset's own liquidity event.", status: "Whenever you're ready" },
];

export function IncomeCalculator() {
  const [amount, setAmount] = useState(50000);
  const [mode, setMode] = useState<(typeof MODES)[number]["key"]>("rental");
  const [years, setYears] = useState(3);

  const activeMode = MODES.find((m) => m.key === mode) ?? MODES[0];
  const projected = useMemo(() => amount * Math.pow(1 + activeMode.rate, years), [amount, activeMode.rate, years]);
  const totalReturn = projected - amount;

  return (
    <SectionShell
      id="calculator"
      eyebrowStep="02"
      eyebrowLabel="For investors"
      heading={
        <>
          Work out what your money <Script>actually buys.</Script>
        </>
      }
      lede="Set an amount and a tenor. This is the asset building, priced the way you'd see it in your account — not a marketing multiple."
    >
      <div className="yz-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[0.625rem] uppercase tracking-wide text-ink-faint">Passive income</p>
              <p className="text-sm font-semibold text-ink-fg">How much, and what for</p>
            </div>
            <span className="yz-badge-live">Calculator, not a guarantee</span>
          </div>

          <div className="space-y-6">
            <SliderField
              label="Your investment"
              value={amount}
              display={formatKES(amount)}
              min={1000}
              max={2000000}
              step={1000}
              onChange={setAmount}
            />

            <div>
              <p className="mb-2 text-xs text-ink-faint">Payout style</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMode(m.key)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      mode === m.key ? "border-accent bg-accent-soft-bg" : "border-card-border-strong hover:border-accent-dim"
                    }`}
                  >
                    <span className={`block text-xs font-semibold ${mode === m.key ? "text-accent" : "text-ink-fg"}`}>{m.label}</span>
                    <span className="block text-[0.625rem] text-ink-faint">{m.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <SliderField label="Holding period" value={years} display={`${years} year${years === 1 ? "" : "s"}`} min={1} max={10} step={1} onChange={setYears} />
          </div>
        </div>

        <div className="flex flex-col">
          <dl className="space-y-3 text-xs">
            <StatRow label="Est. gross yield" value={`${(activeMode.rate * 100).toFixed(2)}%`} />
            <StatRow label="Tokens" value={`${Math.floor(amount / 1000).toLocaleString()} units`} />
            <StatRow label="Value at end of period" value={formatKES(projected)} />
            <StatRow label="Frequency" value={mode === "rental" ? "Quarterly" : "At exit"} />
            <StatRow label="Est. total return" value={formatKES(totalReturn)} />
            <StatRow label="Fees deducted before payout" value="See fee page" />
          </dl>

          <div className="mt-4 rounded-xl border border-amber-dim bg-amber-soft-bg px-4 py-3 text-[0.6875rem] leading-relaxed text-amber">
            This is a projection, not a promise. Rental income depends on occupancy; exit price depends on demand on the
            marketplace. Past performance of one offering says nothing about the next.
          </div>

          <button type="button" className="yz-btn-primary mt-4 w-full">
            Join the investor register <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <JourneyTimeline
        title="The full investor journey: sign up to exit"
        lede="Nine stages, most of them one-time. This is the full sequence, including where to hand off nothing to anyone but the escrow bank."
        steps={STEPS}
      />
    </SectionShell>
  );
}

function SliderField({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-ink-faint">{label}</span>
        <span className="font-semibold text-ink-fg">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="yz-slider w-full"
      />
    </div>
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
