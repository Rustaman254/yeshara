import { Check } from "lucide-react";
import { Eyebrow } from "./primitives";

const COMPANY_DATA = [
  "Incorporated in Kenya as Yeshara Tokens Limited",
  "Licensed by the Capital Markets Authority, registered 2026",
  "Backed by asset owners, independent trustees and licensed counsel",
  "Registered under the Capital Markets Act, 2026",
  "Founding year: 2025",
];

const MINI_STATS = [
  { title: "Simplicity", body: "The minimum order gets smaller as the platform matures, not larger. Fees are per-transaction, never subscription-based." },
  { title: "Compliance", body: "The registration is live before the marketing is. Every regulatory filing runs ahead of the product, not alongside it." },
  { title: "Democracy", body: "Advocates property investment can be started by anyone, not gated by the size of the first check." },
];

export function AboutSection() {
  return (
    <section className="dark bg-ink-2 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Eyebrow step="10" label="About us" />
        <h2 className="text-3xl font-bold tracking-tight text-ink-fg sm:text-4xl">Yeshara Tokens Limited</h2>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
              A Kenyan company, co-founded by real estate and financial markets professionals, turning secure,
              tradeable tokens into a real distribution channel for property investment. Title sits with an
              independent trustee, not with Yeshara, and every offering operates inside its own asset-specific SPV.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-muted">
              Kenya&apos;s middle class has held out of real estate for one reason more than any other: the ticket
              size. Our thesis is that the market underserved isn&apos;t appetite for property, it&apos;s access,
              without changing what it means to own the underlying asset.
            </p>

            <p className="yz-eyebrow mt-8 !mb-2">Company data</p>
            <ul className="space-y-2 text-xs text-ink-muted">
              {COMPANY_DATA.map((d) => (
                <li key={d} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                  {d}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-baseline gap-8">
              <div>
                <p className="text-3xl font-bold text-ink-fg">5+</p>
                <p className="text-[0.625rem] uppercase tracking-wide text-ink-faint">Live offerings</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-ink-fg">24</p>
                <p className="text-[0.625rem] uppercase tracking-wide text-ink-faint">Months operating</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber">1,847+</p>
                <p className="text-[0.625rem] uppercase tracking-wide text-ink-faint">Registered investors</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-dim bg-amber-soft-bg p-5">
            <p className="text-[0.625rem] font-semibold uppercase tracking-wide text-accent">Compliance</p>
            <p className="mt-3 text-xs leading-relaxed text-amber">
              Our aims, goals and methodology are published in full in the offering memorandum for every asset —
              request a copy before you invest.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {MINI_STATS.map((s) => (
            <div key={s.title} className="border-t-2 border-accent pt-4">
              <p className="text-sm font-bold text-ink-fg">{s.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">{s.body}</p>
            </div>
          ))}
        </div>

        <blockquote className="mt-12 border-l-2 border-accent pl-6">
          <p className="max-w-2xl text-xl font-medium leading-snug text-ink-fg">
            &ldquo;Democratizing real estate investment: empowering a new class of investors by reducing prohibitively
            large minimum investment sizes and reducing geographic constraints.&rdquo;
          </p>
          <footer className="mt-4 text-xs text-ink-faint">Founding thesis &middot; Yeshara Tokens Limited</footer>
        </blockquote>
      </div>
    </section>
  );
}
