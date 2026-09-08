"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { DashboardShell } from "@/components/DashboardShell";
import { InvestSwapPanel } from "@/components/InvestSwapPanel";
import { MapPin, ShieldCheck, ArrowLeft } from "lucide-react";

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
        <div className="text-neutral-500 text-sm">Loading…</div>
      </DashboardShell>
    );
  }
  if (!detail) {
    return (
      <DashboardShell>
        <div className="text-red-400 text-sm">{error || "Offering not found"}</div>
      </DashboardShell>
    );
  }

  const { offering, availableUnits, kesPerUnit } = detail;

  return (
    <DashboardShell>
      <div className="max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-200 mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to marketplace
        </Link>

        <div className="rounded-xl border border-white/10 bg-[#141019] overflow-hidden">
          <div className="aspect-[21/9] bg-neutral-800">
            {offering.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={offering.imageUrl} alt={offering.title} className="h-full w-full object-cover" />
            )}
          </div>
          <div className="p-8">
            <span className="inline-block text-[0.65rem] font-semibold uppercase tracking-wide text-neutral-300 bg-white/10 rounded px-2 py-0.5 mb-3">
              {offering.assetType.replace(/_/g, " ")}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">{offering.title}</h1>
            {offering.location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
                <MapPin className="h-3.5 w-3.5" /> {offering.location}
              </p>
            )}
            <p className="mt-4 text-neutral-400 text-sm leading-relaxed">{offering.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
              <Stat label="Price / unit" value={`${offering.pricePerUnit.toLocaleString()} ${offering.currency}`} />
              <Stat label="Total units" value={offering.totalUnits.toLocaleString()} />
              <Stat label="Available" value={availableUnits !== undefined ? availableUnits.toLocaleString() : "—"} />
              <Stat label="Expected yield" value={offering.expectedYieldPct != null ? `${offering.expectedYieldPct}%` : "—"} />
            </div>

            {offering.minInvestmentUnits ? (
              <p className="mt-4 text-xs text-neutral-500">Minimum investment: {offering.minInvestmentUnits} units</p>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold mb-4">Invest</h2>

          {authLoading ? null : !investor ? (
            <div className="rounded-xl border border-white/10 bg-[#141019] p-8">
              <p className="text-sm text-neutral-500">
                <Link href="/sign-in" className="text-violet-400 underline">
                  Sign in
                </Link>{" "}
                to invest in this offering.
              </p>
            </div>
          ) : kycStatus !== "verified" ? (
            <div className="rounded-xl border border-white/10 bg-[#141019] p-8">
              <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-300">
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
            <div className="rounded-xl border border-white/10 bg-[#141019] p-8">
              <p className="text-sm text-neutral-500">This offering is not currently open for investment.</p>
            </div>
          ) : (
            <InvestSwapPanel offering={offering} availableUnits={availableUnits} kesPerUnit={kesPerUnit} onSettled={load} />
          )}
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
      <p className="text-[0.65rem] uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 font-semibold text-neutral-100">{value}</p>
    </div>
  );
}
