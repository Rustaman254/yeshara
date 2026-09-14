"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { DashboardShell } from "@/components/DashboardShell";
import { usePoll } from "@/hooks/usePoll";

export default function PortfolioPage() {
  const router = useRouter();
  const { investor, loading: authLoading } = useAuth();
  const [holdings, setHoldings] = useState<api.Holding[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalKesValue, setTotalKesValue] = useState(0);
  const [redemptions, setRedemptions] = useState<api.RedemptionRequest[]>([]);
  const [earnedByCurrency, setEarnedByCurrency] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [cashOutHolding, setCashOutHolding] = useState<api.Holding | null>(null);

  function reload() {
    return Promise.all([api.myPortfolio(), api.myRedemptions(), api.myYield()]).then(([p, r, y]) => {
      setHoldings(p.holdings);
      setTotalValue(p.totalValue);
      setTotalKesValue(p.totalKesValue);
      setRedemptions(r.redemptions);
      setEarnedByCurrency(y.earnedByCurrency || {});
    });
  }

  useEffect(() => {
    if (authLoading) return;
    if (!investor) router.push("/sign-in");
  }, [authLoading, investor, router]);

  usePoll(() => reload().finally(() => setLoading(false)), 3000, !authLoading && !!investor);

  if (authLoading || loading) {
    return (
      <DashboardShell>
        <div className="text-neutral-600 dark:text-neutral-500 text-sm">Loading…</div>
      </DashboardShell>
    );
  }

  const totalEarned = Object.entries(earnedByCurrency).filter(([, v]) => v !== 0);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Portfolio</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-8">Your on-chain holdings across Yeshara offerings.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6">
          <p className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">Total value</p>
          <p className="text-3xl font-semibold mt-1">${totalValue.toLocaleString()}</p>
          {totalKesValue > 0 && (
            <p className="text-xs text-neutral-600 dark:text-neutral-500 mt-1">≈ KES {totalKesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          )}
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6">
          <p className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">Yield earned</p>
          {totalEarned.length === 0 ? (
            <p className="text-3xl font-semibold mt-1 text-neutral-400 dark:text-neutral-600">—</p>
          ) : (
            totalEarned.map(([currency, amount]) => (
              <p key={currency} className="text-3xl font-semibold mt-1">
                {amount.toLocaleString()} <span className="text-base font-normal text-neutral-600 dark:text-neutral-500">{currency}</span>
              </p>
            ))
          )}
          <Link href="/yield" className="text-xs text-violet-600 dark:text-violet-400 hover:underline mt-2 inline-block">
            View yield history →
          </Link>
        </div>
      </div>

      {holdings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 dark:border-white/10 py-12 text-center text-neutral-600 dark:text-neutral-500 text-sm mb-10">
          No holdings yet.{" "}
          <Link href="/marketplace" className="underline text-violet-600 dark:text-violet-400">
            Browse the marketplace
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] overflow-hidden mb-10">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 dark:bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
              <tr>
                <th className="px-5 py-3">Offering</th>
                <th className="px-5 py-3">Symbol</th>
                <th className="px-5 py-3 text-right">Units</th>
                <th className="px-5 py-3 text-right">Value</th>
                <th className="px-5 py-3 text-right">Cash out</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.offeringId} className="border-t border-neutral-200 dark:border-white/5">
                  <td className="px-5 py-3">
                    <Link href={`/marketplace/${h.offeringId}`} className="hover:underline">
                      {h.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-500">{h.symbol}</td>
                  <td className="px-5 py-3 text-right">{h.units.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <p className="font-medium">
                      {h.value.toLocaleString()} {h.currency}
                    </p>
                    {h.kesValue != null && h.currency !== "KES" && (
                      <p className="text-[0.65rem] text-neutral-600 dark:text-neutral-500">
                        ≈ KES {h.kesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setCashOutHolding(h)}
                      className="rounded-md bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 text-xs font-medium"
                    >
                      Cash out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Redemptions</h2>
        <Link href="/transactions" className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
          View all transactions →
        </Link>
      </div>
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 dark:bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
            <tr>
              <th className="px-5 py-3">Units</th>
              <th className="px-5 py-3">Payout</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Burn tx</th>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Requested</th>
            </tr>
          </thead>
          <tbody>
            {redemptions.map((r) => (
              <tr key={r.id} className="border-t border-neutral-200 dark:border-white/5">
                <td className="px-5 py-3">{r.units}</td>
                <td className="px-5 py-3">
                  {r.payoutAmount.toLocaleString()} {r.currency}
                </td>
                <td className="px-5 py-3">
                  <RedemptionStatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-500">
                  {r.burnTxHash ? `${r.burnTxHash.slice(0, 10)}…` : "—"}
                </td>
                <td className="px-5 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-500">{r.paymentRef || "—"}</td>
                <td className="px-5 py-3 text-neutral-600 dark:text-neutral-500">{new Date(r.requestedAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {redemptions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-neutral-600 dark:text-neutral-500">
                  No redemptions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {cashOutHolding && (
        <CashOutModal
          holding={cashOutHolding}
          onClose={() => setCashOutHolding(null)}
          onDone={() => {
            setCashOutHolding(null);
            reload();
          }}
        />
      )}
    </DashboardShell>
  );
}

function CashOutModal({
  holding,
  onClose,
  onDone,
}: {
  holding: api.Holding;
  onClose: () => void;
  onDone: () => void;
}) {
  const [units, setUnits] = useState(String(holding.units));
  const [method, setMethod] = useState<api.PayoutMethod>("manual");
  const [phone, setPhone] = useState("");
  const [payoutAssetSymbol, setPayoutAssetSymbol] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const n = Number(units);
    if (!n || n <= 0 || n > holding.units) {
      setError("Enter a valid unit amount up to your current holding.");
      return;
    }
    if (method === "mpesa_b2c" && !phone.trim()) {
      setError("A phone number is required for the M-Pesa rail.");
      return;
    }
    if (method === "onchain_token" && !payoutAssetSymbol.trim()) {
      setError("A payout asset symbol is required for the on-chain rail.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.requestRedemption(holding.offeringId, n, method, {
        phone: method === "mpesa_b2c" ? phone.trim() : undefined,
        payoutAssetSymbol: method === "onchain_token" ? payoutAssetSymbol.trim() : undefined,
      });
      onDone();
    } catch (e) {
      setError(e instanceof api.ApiError ? e.message : "Failed to request redemption.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#151020] p-6">
        <h3 className="text-lg font-semibold mb-1">Cash out — {holding.title}</h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-500 mb-4">
          Requests a redemption. An admin reviews it, burns the tokens on-chain, and settles the payout.
        </p>

        <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Units (max {holding.units.toLocaleString()})</label>
        <input
          value={units}
          onChange={(e) => setUnits(e.target.value)}
          className="w-full rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-3 py-2 text-sm mb-3 outline-none focus:border-violet-500"
        />

        <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Payout method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as api.PayoutMethod)}
          className="w-full rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-3 py-2 text-sm mb-3 outline-none focus:border-violet-500"
        >
          <option value="manual">Manual (admin pays off-platform)</option>
          <option value="mpesa_b2c">M-Pesa (automated)</option>
          <option value="onchain_token">On-chain token payout</option>
        </select>

        {method === "mpesa_b2c" && (
          <>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX — leave blank to use your saved payout phone"
              className="w-full rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-3 py-2 text-sm mb-3 outline-none focus:border-violet-500"
            />
          </>
        )}
        {method === "onchain_token" && (
          <>
            <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Payout asset symbol</label>
            <input
              value={payoutAssetSymbol}
              onChange={(e) => setPayoutAssetSymbol(e.target.value)}
              placeholder="e.g. USDC"
              className="w-full rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-3 py-2 text-sm mb-3 outline-none focus:border-violet-500"
            />
          </>
        )}

        {error && <p className="text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="rounded-md px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-2 text-sm font-medium"
          >
            {submitting ? "Requesting…" : "Request redemption"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RedemptionStatusBadge({ status }: { status: api.RedemptionStatus }) {
  const cls =
    status === "paid"
      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : status === "rejected" || status === "failed"
        ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300"
        : status === "approved_burned"
          ? "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300"
          : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{status.replace("_", " ")}</span>;
}
