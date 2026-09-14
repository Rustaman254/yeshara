"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { DashboardShell } from "@/components/DashboardShell";
import { InvestSwapPanel } from "@/components/InvestSwapPanel";
import { MapPin, ShieldCheck, ArrowLeft, FileText, ExternalLink } from "lucide-react";

export default function OfferingDetailPage() {
  const { offeringId } = useParams<{ offeringId: string }>();
  const { investor, kycStatus, loading: authLoading } = useAuth();

  const [detail, setDetail] = useState<api.OfferingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .getOffering(offeringId)
      .then(setDetail)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load offering"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offeringId]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="text-ink-faint text-sm">Loading…</div>
      </DashboardShell>
    );
  }
  if (!detail) {
    return (
      <DashboardShell>
        <div className="text-danger text-sm">{error || "Offering not found"}</div>
      </DashboardShell>
    );
  }

  const { offering, availableUnits, kesPerUnit, fundedPct } = detail;
  const d = offering.details || {};
  const totalAUM = offering.totalUnits * offering.pricePerUnit;
  const showKes = kesPerUnit != null && offering.currency !== "KES";
  const funded = fundedPct != null ? Math.min(100, Math.round(fundedPct)) : null;

  return (
    <DashboardShell>
      <div className="max-w-4xl">
        <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-ink-fg mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to marketplace
        </Link>

        <div className="yz-card overflow-hidden">
          <div className="aspect-[21/9] bg-card-border">
            {offering.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={offering.imageUrl} alt={offering.title} className="h-full w-full object-cover" />
            )}
          </div>
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="yz-pill">{offering.assetType.replace(/_/g, " ")}</span>
              {(d.tags || []).map((tag) => (
                <span key={tag} className="yz-badge-teal">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-fg">{offering.title}</h1>
            {offering.location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-ink-faint">
                <MapPin className="h-3.5 w-3.5" /> {offering.location}
              </p>
            )}
            <p className="mt-4 text-ink-muted text-sm leading-relaxed">{offering.description}</p>
            {offering.symbol && (
              <p className="mt-2 text-xs text-ink-faint">
                Token:{" "}
                {offering.assetUrl || offering.mintTxUrl ? (
                  <a
                    href={offering.assetUrl || offering.mintTxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-accent hover:underline"
                  >
                    {offering.symbol}
                  </a>
                ) : (
                  <span className="font-mono text-ink-muted">{offering.symbol}</span>
                )}
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
              <Stat
                label="Price / unit"
                value={`${offering.pricePerUnit.toLocaleString()} ${offering.currency}`}
                sub={showKes ? `≈ KES ${kesPerUnit!.toLocaleString()}` : undefined}
              />
              <Stat label="Total units" value={offering.totalUnits.toLocaleString()} />
              <Stat label="Available" value={availableUnits !== undefined ? availableUnits.toLocaleString() : "—"} />
              <Stat label="Expected yield" value={offering.expectedYieldPct != null ? `${offering.expectedYieldPct}%` : "—"} />
            </div>

            {funded != null && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-ink-faint mb-1">
                  <span>Funded</span>
                  <span>{funded}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-card-border-strong overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${funded}%` }} />
                </div>
              </div>
            )}

            {offering.minInvestmentUnits ? (
              <p className="mt-4 text-xs text-ink-faint">Minimum investment: {offering.minInvestmentUnits} units</p>
            ) : null}
            {offering.reservedUnits ? (
              <p className="mt-1 text-xs text-ink-faint">
                {offering.reservedUnits.toLocaleString()} units ({Math.round((offering.reservedUnits / offering.totalUnits) * 100)}%) reserved for the
                original owner — not part of this offering&apos;s public sale pool.
              </p>
            ) : null}
            {offering.mintTxUrl && (
              <a
                href={offering.mintTxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View {offering.symbol ? `${offering.symbol} ` : ""}on-chain
              </a>
            )}
          </div>
        </div>

        {/* Overview */}
        <Section title="Overview">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <OverviewStat
              label="Unit price"
              value={`${offering.pricePerUnit.toLocaleString()} ${offering.currency}`}
              sub={showKes ? `≈ KES ${kesPerUnit!.toLocaleString()}` : undefined}
            />
            <OverviewStat
              label="Total AUM"
              value={`${totalAUM.toLocaleString()} ${offering.currency}`}
              sub={showKes ? `≈ KES ${(offering.totalUnits * kesPerUnit!).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : undefined}
            />
            <OverviewStat
              label="1 year return"
              value={d.trailingOneYearReturnPct != null ? `${d.trailingOneYearReturnPct}%` : "—"}
            />
          </div>
        </Section>

        {/* Highlights: fees, subscription, redemption */}
        {(d.expenseRatioPct != null ||
          d.underlyingFundExpensesPct != null ||
          d.subscriptionFrequency ||
          d.subscriptionDeadline ||
          d.domicile ||
          d.liquidityPool ||
          d.redemptionWindow ||
          d.tokenTransferLockup) && (
          <Section title="Highlights">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FactCard title="Returns & fees">
                <Fact label="Expense ratio" value={d.expenseRatioPct != null ? `${d.expenseRatioPct}%` : undefined} />
                <Fact label="Underlying fund expenses" value={d.underlyingFundExpensesPct != null ? `${d.underlyingFundExpensesPct}%` : undefined} />
                <Fact label="Currency" value={offering.currency} />
              </FactCard>
              <FactCard title="Subscription">
                <Fact label="Frequency" value={d.subscriptionFrequency} />
                <Fact label="Deadline" value={d.subscriptionDeadline} />
                <Fact label="Domicile" value={d.domicile} />
              </FactCard>
              <FactCard title="Redemptions">
                <Fact label="Liquidity pool" value={d.liquidityPool} />
                <Fact label="Redemption window" value={d.redemptionWindow} />
                <Fact label="Token transfer lock-up" value={d.tokenTransferLockup} />
              </FactCard>
            </div>
          </Section>
        )}

        {/* Fund profile: risk/volatility/liquidity */}
        {(offering.riskLevel || d.volatilityLevel || d.liquidityLevel) && (
          <Section title="Fund profile">
            <div className="yz-card p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <LevelScale label="Risk / reward" level={offering.riskLevel} />
              <LevelScale label="Volatility" level={d.volatilityLevel} />
              <LevelScale label="Liquidity" level={d.liquidityLevel} />
            </div>
          </Section>
        )}

        {/* Performance history */}
        {d.performanceHistory && d.performanceHistory.length > 0 && (
          <Section title="Performance history">
            <div className="yz-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-ink-2 text-left text-xs uppercase tracking-wide text-ink-faint">
                  <tr>
                    <th className="px-5 py-3">Period</th>
                    <th className="px-5 py-3 text-right">Start</th>
                    <th className="px-5 py-3 text-right">End</th>
                    <th className="px-5 py-3 text-right">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {d.performanceHistory.map((p, i) => (
                    <tr key={i} className="border-t border-card-border">
                      <td className="px-5 py-3 text-ink-fg">{p.label}</td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-ink-muted">{p.startPrice.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-ink-muted">{p.endPrice.toLocaleString()}</td>
                      <td className={`px-5 py-3 text-right font-medium ${p.returnPct >= 0 ? "text-accent" : "text-danger"}`}>
                        {p.returnPct >= 0 ? "+" : ""}
                        {p.returnPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* The opportunity */}
        {d.highlights && d.highlights.length > 0 && (
          <Section title="The opportunity">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {d.highlights.map((h, i) => (
                <div key={i} className="yz-card p-5">
                  <p className="font-semibold text-ink-fg mb-1">{h.title}</p>
                  <p className="text-sm text-ink-muted leading-relaxed">{h.body}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Manager */}
        {(d.managerName || d.managerBio) && (
          <Section title={d.managerName ? `Who is ${d.managerName}?` : "Manager"}>
            <div className="yz-card p-6">
              {d.managerStats && d.managerStats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  {d.managerStats.map((s, i) => (
                    <div key={i}>
                      <p className="text-xl font-bold text-ink-fg">{s.value}</p>
                      <p className="text-xs text-ink-faint">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
              {d.managerBio && <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">{d.managerBio}</p>}
            </div>
          </Section>
        )}

        {/* Documents */}
        {d.documents && d.documents.length > 0 && (
          <Section title="Documents">
            <div className="yz-card divide-y divide-card-border">
              {d.documents.map((doc, i) => (
                <a
                  key={i}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 text-sm text-ink-muted hover:bg-card-hover hover:text-ink-fg"
                >
                  <FileText className="h-4 w-4 text-ink-faint" />
                  {doc.name}
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Disclosures */}
        {d.disclosures && (
          <Section title="Disclosures">
            <p className="text-xs text-ink-faint leading-relaxed whitespace-pre-line">{d.disclosures}</p>
          </Section>
        )}

        <div className="mt-8">
          <h2 className="font-bold text-ink-fg mb-4">Invest</h2>

          {authLoading ? null : !investor ? (
            <div className="yz-card p-8">
              <p className="text-sm text-ink-muted">
                <Link href="/sign-in" className="text-accent hover:text-accent-strong underline">
                  Sign in
                </Link>{" "}
                to invest in this offering.
              </p>
            </div>
          ) : kycStatus !== "verified" ? (
            <div className="yz-card p-8">
              <div className="flex items-start gap-2 rounded-lg bg-amber-soft-bg border border-amber-dim px-4 py-3 text-sm text-amber">
                <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Identity verification required before investing.{" "}
                  <Link href="/kyc" className="underline">
                    Complete verification →
                  </Link>{" "}
                  (current status: {kycStatus})
                </span>
              </div>
            </div>
          ) : offering.status !== "live" ? (
            <div className="yz-card p-8">
              <p className="text-sm text-ink-muted">This offering is not currently open for investment.</p>
            </div>
          ) : (
            <InvestSwapPanel offering={offering} availableUnits={availableUnits} kesPerUnit={kesPerUnit} onSettled={load} />
          )}
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </div>
      </div>
    </DashboardShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="font-bold text-ink-fg mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-ink-2 border border-card-border p-3">
      <p className="text-[0.65rem] uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 font-semibold text-ink-fg">{value}</p>
      {sub && <p className="text-[0.65rem] text-ink-faint">{sub}</p>}
    </div>
  );
}

function OverviewStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="yz-card p-5">
      <p className="text-xs uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink-fg">{value}</p>
      {sub && <p className="text-xs text-ink-faint mt-0.5">{sub}</p>}
    </div>
  );
}

function FactCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="yz-card p-5">
      <p className="text-xs uppercase tracking-wide text-ink-faint mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-faint">{label}</span>
      <span className="font-medium text-ink-fg text-right">{value}</span>
    </div>
  );
}

const LEVEL_ORDER: Record<string, number> = { low: 1, medium: 2, high: 3 };

function LevelScale({ label, level }: { label: string; level?: string }) {
  const n = level ? LEVEL_ORDER[level.toLowerCase()] || 0 : 0;
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-faint mb-2">{label}</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i <= n ? "bg-accent" : "bg-card-border-strong"}`} />
        ))}
      </div>
      <div className="flex justify-between text-[0.65rem] text-ink-faint mt-1">
        <span>Low</span>
        <span>Med</span>
        <span>High</span>
      </div>
    </div>
  );
}
