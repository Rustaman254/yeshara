"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { DashboardShell } from "@/components/DashboardShell";
import { InvestSwapPanel } from "@/components/InvestSwapPanel";
import { MapPin, ShieldCheck, ArrowLeft, FileText } from "lucide-react";

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
        <div className="text-neutral-600 dark:text-neutral-500 text-sm">Loading…</div>
      </DashboardShell>
    );
  }
  if (!detail) {
    return (
      <DashboardShell>
        <div className="text-red-600 dark:text-red-400 text-sm">{error || "Offering not found"}</div>
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
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to marketplace
        </Link>

        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] overflow-hidden">
          <div className="aspect-[21/9] bg-neutral-200 dark:bg-neutral-800">
            {offering.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={offering.imageUrl} alt={offering.title} className="h-full w-full object-cover" />
            )}
          </div>
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-block text-[0.65rem] font-semibold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-white/10 rounded px-2 py-0.5">
                {offering.assetType.replace(/_/g, " ")}
              </span>
              {(d.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="inline-block text-[0.65rem] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{offering.title}</h1>
            {offering.location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-500">
                <MapPin className="h-3.5 w-3.5" /> {offering.location}
              </p>
            )}
            <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{offering.description}</p>

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
                <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-500 mb-1">
                  <span>Funded</span>
                  <span>{funded}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-white/10 overflow-hidden">
                  <div className="h-full bg-violet-500" style={{ width: `${funded}%` }} />
                </div>
              </div>
            )}

            {offering.minInvestmentUnits ? (
              <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-500">Minimum investment: {offering.minInvestmentUnits} units</p>
            ) : null}
            {offering.reservedUnits ? (
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-500">
                {offering.reservedUnits.toLocaleString()} units ({Math.round((offering.reservedUnits / offering.totalUnits) * 100)}%) reserved for the
                original owner — not part of this offering&apos;s public sale pool.
              </p>
            ) : null}
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
            <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <LevelScale label="Risk / reward" level={offering.riskLevel} />
              <LevelScale label="Volatility" level={d.volatilityLevel} />
              <LevelScale label="Liquidity" level={d.liquidityLevel} />
            </div>
          </Section>
        )}

        {/* Performance history */}
        {d.performanceHistory && d.performanceHistory.length > 0 && (
          <Section title="Performance history">
            <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-neutral-100 dark:bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
                  <tr>
                    <th className="px-5 py-3">Period</th>
                    <th className="px-5 py-3 text-right">Start</th>
                    <th className="px-5 py-3 text-right">End</th>
                    <th className="px-5 py-3 text-right">Return</th>
                  </tr>
                </thead>
                <tbody>
                  {d.performanceHistory.map((p, i) => (
                    <tr key={i} className="border-t border-neutral-200 dark:border-white/5">
                      <td className="px-5 py-3">{p.label}</td>
                      <td className="px-5 py-3 text-right font-mono text-xs">{p.startPrice.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right font-mono text-xs">{p.endPrice.toLocaleString()}</td>
                      <td className={`px-5 py-3 text-right font-medium ${p.returnPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
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
                <div key={i} className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-5">
                  <p className="font-medium mb-1">{h.title}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{h.body}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Manager */}
        {(d.managerName || d.managerBio) && (
          <Section title={d.managerName ? `Who is ${d.managerName}?` : "Manager"}>
            <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6">
              {d.managerStats && d.managerStats.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  {d.managerStats.map((s, i) => (
                    <div key={i}>
                      <p className="text-xl font-semibold">{s.value}</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
              {d.managerBio && <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">{d.managerBio}</p>}
            </div>
          </Section>
        )}

        {/* Documents */}
        {d.documents && d.documents.length > 0 && (
          <Section title="Documents">
            <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] divide-y divide-neutral-200 dark:divide-white/5">
              {d.documents.map((doc, i) => (
                <a
                  key={i}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                >
                  <FileText className="h-4 w-4 text-neutral-600 dark:text-neutral-500" />
                  {doc.name}
                </a>
              ))}
            </div>
          </Section>
        )}

        {/* Disclosures */}
        {d.disclosures && (
          <Section title="Disclosures">
            <p className="text-xs text-neutral-400 dark:text-neutral-600 leading-relaxed whitespace-pre-line">{d.disclosures}</p>
          </Section>
        )}

        <div className="mt-8">
          <h2 className="font-semibold mb-4">Invest</h2>

          {authLoading ? null : !investor ? (
            <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-8">
              <p className="text-sm text-neutral-600 dark:text-neutral-500">
                <Link href="/sign-in" className="text-violet-600 dark:text-violet-400 underline">
                  Sign in
                </Link>{" "}
                to invest in this offering.
              </p>
            </div>
          ) : kycStatus !== "verified" ? (
            <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-8">
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
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
            <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-8">
              <p className="text-sm text-neutral-600 dark:text-neutral-500">This offering is not currently open for investment.</p>
            </div>
          ) : (
            <InvestSwapPanel offering={offering} availableUnits={availableUnits} kesPerUnit={kesPerUnit} onSettled={load} />
          )}
          {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>
    </DashboardShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-3">
      <p className="text-[0.65rem] uppercase tracking-wide text-neutral-600 dark:text-neutral-500">{label}</p>
      <p className="mt-1 font-semibold text-neutral-900 dark:text-neutral-100">{value}</p>
      {sub && <p className="text-[0.65rem] text-neutral-600 dark:text-neutral-500">{sub}</p>}
    </div>
  );
}

function OverviewStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-5">
      <p className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {sub && <p className="text-xs text-neutral-600 dark:text-neutral-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function FactCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-5">
      <p className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500 mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-600 dark:text-neutral-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

const LEVEL_ORDER: Record<string, number> = { low: 1, medium: 2, high: 3 };

function LevelScale({ label, level }: { label: string; level?: string }) {
  const n = level ? LEVEL_ORDER[level.toLowerCase()] || 0 : 0;
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500 mb-2">{label}</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-2 flex-1 rounded-full ${i <= n ? "bg-violet-500" : "bg-neutral-100 dark:bg-white/10"}`} />
        ))}
      </div>
      <div className="flex justify-between text-[0.65rem] text-neutral-400 dark:text-neutral-600 mt-1">
        <span>Low</span>
        <span>Med</span>
        <span>High</span>
      </div>
    </div>
  );
}
