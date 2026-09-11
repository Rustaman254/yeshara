import Link from "next/link";
import { ArrowRight, Check, LayoutGrid, ShieldCheck } from "lucide-react";
import { Accent } from "./primitives";

const BADGES = ["CMA LICENSED", "SPV STRUCTURE", "STELLAR-SETTLED", "ESCROW-HELD"];

const CHECKS = ["Fully collateralized tokens, one asset per SPV", "Redeemable directly at market value"];

export function Hero() {
  return (
    <section className="dark relative overflow-hidden bg-ink">
      <div className="pointer-events-none absolute -right-40 top-0 h-[560px] w-[560px] rounded-full bg-accent-dim/20 blur-[140px]" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-6 flex flex-wrap gap-2">
            {BADGES.map((b) => (
              <span key={b} className="yz-pill">
                {b}
              </span>
            ))}
          </div>

          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-ink-fg sm:text-6xl">
            Own property from
            <br />
            <Accent>KES 1,000.</Accent>
          </h1>

          <p className="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
            Yeshara turns real estate and financial instruments into secure, tradeable tokens. An independent trustee
            holds the title. You hold a registered share of the asset, and you can sell that share without waiting
            for the whole building to change hands.
          </p>

          <div className="mt-6 space-y-2">
            {CHECKS.map((c) => (
              <div key={c} className="flex items-center gap-2 text-sm text-ink-muted">
                <Check className="h-4 w-4 shrink-0 text-accent" />
                {c}
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="yz-card p-5">
              <LayoutGrid className="h-4 w-4 text-accent" />
              <p className="mt-3 text-sm font-semibold text-ink-fg">Tokenized Asset</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                Each offering sits in its own SPV, so one unit of risk never leaks into another.
              </p>
              <Link href="#how-it-works" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-strong">
                See how it works <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="yz-card p-5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <p className="mt-3 text-sm font-semibold text-ink-fg">Place an order</p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                Fund with M-Pesa, Airtel Money or a bank transfer — settlement lands on-chain the same day.
              </p>
              <Link href="/marketplace" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-strong">
                See open orders <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <p className="mt-6 text-xs text-ink-faint">
            No hidden spread on entry.{" "}
            <Link href="#fees" className="text-accent hover:text-accent-strong">
              See every fee on one page
            </Link>
          </p>
        </div>

        <aside className="yz-card h-fit p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.625rem] uppercase tracking-wide text-ink-faint">Property of Westlands</p>
              <p className="text-[0.625rem] uppercase tracking-wide text-ink-faint">Live offering</p>
            </div>
            <span className="yz-badge-live">Live offering</span>
          </div>

          <p className="mt-6 text-xs uppercase tracking-wide text-ink-faint">Your target stake</p>
          <p className="mt-1 text-2xl font-bold leading-tight text-ink-fg">
            0.42% of<br />a Westlands block
          </p>

          <dl className="mt-6 space-y-3 border-t border-card-border pt-4 text-xs">
            <Row label="Token price" value="KES 1,000" />
            <Row label="Total raise target" value="KES 84,000,000" />
            <Row label="Min. order" value="KES 1,000 · 1 unit" />
            <Row label="Tenor" value="Perpetual, until sale" />
          </dl>

          <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4">
            <span className="text-[0.6875rem] text-ink-faint">Set a price alert or exit anytime</span>
            <Link href="/marketplace" className="text-xs font-semibold text-accent hover:text-accent-strong">
              View listing →
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="font-semibold text-ink-fg">{value}</dd>
    </div>
  );
}
