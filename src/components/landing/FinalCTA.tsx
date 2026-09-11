"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, User, Building2, Handshake } from "lucide-react";
import { Eyebrow, Script } from "./primitives";

const SELECTORS = [
  { key: "investor", icon: User, title: "Investor", body: "I want to buy fractional shares of real assets." },
  { key: "owner", icon: Building2, title: "Asset owner", body: "I want to raise capital against something I hold." },
  { key: "partner", icon: Handshake, title: "Institutional partner", body: "Bank, SACCO or technology partner inquiry." },
] as const;

export function FinalCTA() {
  const [kind, setKind] = useState<(typeof SELECTORS)[number]["key"]>("investor");
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitted(true);
  }

  return (
    <section className="dark relative overflow-hidden bg-ink py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-accent-dim/15 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-xl text-center">
          <div className="flex justify-center">
            <Eyebrow step="11" label="Get started" />
          </div>
          <h2 className="text-3xl font-bold leading-[1.15] tracking-tight text-ink-fg sm:text-4xl">
            Two minutes now, <Script>first in line later.</Script>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            The waitlist has limited slots. The register describes who trades first when they do, and if you fund at
            launch, your position gets priority access on every listing that opens next.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            <p className="text-[0.625rem] uppercase tracking-wide text-ink-faint">Step 01 — who are you</p>
            {SELECTORS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setKind(s.key)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                  kind === s.key ? "border-accent bg-accent-soft-bg" : "border-card-border-strong bg-card hover:border-accent-dim"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent-dim text-accent">
                  <s.icon className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-ink-fg">{s.title}</span>
                  <span className="block text-[0.6875rem] text-ink-faint">{s.body}</span>
                </span>
                <span className={`h-3 w-3 shrink-0 rounded-full border ${kind === s.key ? "border-accent bg-accent" : "border-card-border-strong"}`} />
              </button>
            ))}

            <p className="pt-3 text-[0.625rem] uppercase tracking-wide text-ink-faint">Already registered?</p>
            <Link href="/sign-in" className="block text-xs font-medium text-accent hover:text-accent-strong">
              Sign in to your account →
            </Link>
          </div>

          <div className="yz-card p-6 sm:p-8">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <p className="text-lg font-bold text-ink-fg">You&apos;re on the register.</p>
                <p className="mt-2 max-w-sm text-sm text-ink-muted">
                  We&apos;ll reach out at {email} once the next offering matching your interest opens.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="text-[0.625rem] uppercase tracking-wide text-ink-faint">For {SELECTORS.find((s) => s.key === kind)?.title.toLowerCase()}s</p>
                <p className="mt-1 text-base font-bold text-ink-fg">Join the investor register</p>

                <div className="mt-5 space-y-4">
                  <Field label="Full name">
                    <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="yz-input" />
                  </Field>
                  <Field label="Email address">
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="yz-input" />
                  </Field>
                  <Field label="Phone number">
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" className="yz-input" />
                  </Field>
                  <Field label="What are you interested in (optional)">
                    <textarea
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      rows={3}
                      placeholder="Property type, budget, timelines…"
                      className="yz-input resize-none"
                    />
                  </Field>
                </div>

                <button type="submit" className="yz-btn-primary mt-6 w-full">
                  Join the register <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 text-[0.6875rem] text-ink-faint">
                  No fees to register. This is not an offer to sell securities — actual investment requires KYC and,
                  where applicable, suitability review before funding.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.6875rem] text-ink-faint">{label}</span>
      {children}
    </label>
  );
}
