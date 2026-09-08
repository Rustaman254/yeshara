"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { DashboardShell } from "@/components/DashboardShell";

export default function PortfolioPage() {
  const router = useRouter();
  const { investor, loading: authLoading } = useAuth();
  const [holdings, setHoldings] = useState<api.Holding[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [investments, setInvestments] = useState<api.Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!investor) {
      router.push("/sign-in");
      return;
    }
    Promise.all([api.myPortfolio(), api.myInvestments()])
      .then(([p, i]) => {
        setHoldings(p.holdings);
        setTotalValue(p.totalValue);
        setInvestments(i.investments);
      })
      .finally(() => setLoading(false));
  }, [authLoading, investor, router]);

  if (authLoading || loading) {
    return (
      <DashboardShell>
        <div className="text-neutral-500 text-sm">Loading…</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Portfolio</h1>
      <p className="text-sm text-neutral-500 mb-8">Your on-chain holdings across Yeshara offerings.</p>

      <div className="rounded-xl border border-white/10 bg-[#141019] p-6 mb-8">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Total value</p>
        <p className="text-3xl font-semibold mt-1">${totalValue.toLocaleString()}</p>
      </div>

      {holdings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-neutral-500 text-sm mb-10">
          No holdings yet.{" "}
          <Link href="/" className="underline text-violet-400">
            Browse the marketplace
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-[#141019] overflow-hidden mb-10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-5 py-3">Offering</th>
                <th className="px-5 py-3">Symbol</th>
                <th className="px-5 py-3 text-right">Units</th>
                <th className="px-5 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.offeringId} className="border-t border-white/5">
                  <td className="px-5 py-3">
                    <Link href={`/marketplace/${h.offeringId}`} className="hover:underline">
                      {h.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-500">{h.symbol}</td>
                  <td className="px-5 py-3 text-right">{h.units.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-medium">
                    {h.value.toLocaleString()} {h.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="font-semibold mb-3">Order history</h2>
      <div className="rounded-xl border border-white/10 bg-[#141019] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-5 py-3">Units</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Placed</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => (
              <tr key={inv.id} className="border-t border-white/5">
                <td className="px-5 py-3">{inv.units}</td>
                <td className="px-5 py-3">
                  {inv.amountDue.toLocaleString()} {inv.currency}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-5 py-3 font-mono text-xs text-neutral-500">{inv.paymentRef}</td>
                <td className="px-5 py-3 text-neutral-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {investments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-neutral-500">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

function StatusBadge({ status }: { status: api.Investment["status"] }) {
  const cls =
    status === "completed"
      ? "bg-emerald-500/10 text-emerald-300"
      : status === "cancelled"
        ? "bg-neutral-500/10 text-neutral-400"
        : status === "failed"
          ? "bg-red-500/10 text-red-300"
          : "bg-amber-500/10 text-amber-300";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{status.replace("_", " ")}</span>;
}
