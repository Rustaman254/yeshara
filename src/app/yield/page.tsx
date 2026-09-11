"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { DashboardShell } from "@/components/DashboardShell";

export default function YieldPage() {
  const router = useRouter();
  const { investor, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<api.DistributionEntry[]>([]);
  const [earned, setEarned] = useState<Record<string, number>>({});
  const [pending, setPending] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!investor) {
      router.push("/sign-in");
      return;
    }
    api
      .myYield()
      .then((r) => {
        setEntries(r.entries);
        setEarned(r.earnedByCurrency || {});
        setPending(r.pendingByCurrency || {});
      })
      .finally(() => setLoading(false));
  }, [authLoading, investor, router]);

  async function savePhone() {
    if (!phone.trim()) return;
    setSavingPhone(true);
    try {
      await api.setPayoutPhone(phone.trim());
      setPhoneSaved(true);
    } finally {
      setSavingPhone(false);
    }
  }

  if (authLoading || loading) {
    return (
      <DashboardShell>
        <div className="text-neutral-600 dark:text-neutral-500 text-sm">Loading…</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Yield</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-8">Income distributed against the offerings you hold.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6">
          <p className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">Earned</p>
          <CurrencyTotals totals={earned} emptyLabel="Nothing paid out yet." />
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6">
          <p className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">Pending</p>
          <CurrencyTotals totals={pending} emptyLabel="Nothing pending." />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-5 mb-8">
        <p className="text-sm font-medium mb-1">Payout phone number</p>
        <p className="text-xs text-neutral-600 dark:text-neutral-500 mb-3">
          Where M-Pesa yield payouts and cash-outs are sent when that rail is used.
        </p>
        <div className="flex gap-2">
          <input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneSaved(false);
            }}
            placeholder="07XXXXXXXX"
            className="flex-1 rounded-lg bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-500"
          />
          <button
            onClick={savePhone}
            disabled={savingPhone || !phone.trim()}
            className="rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-2 text-sm font-medium"
          >
            {savingPhone ? "Saving…" : "Save"}
          </button>
        </div>
        {phoneSaved && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">Saved.</p>}
      </div>

      <h2 className="font-semibold mb-3">History</h2>
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 dark:bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
            <tr>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-neutral-200 dark:border-white/5">
                <td className="px-5 py-3 font-medium">
                  {e.amount.toLocaleString()} {e.currency}
                </td>
                <td className="px-5 py-3 text-neutral-600 dark:text-neutral-400">{methodLabel(e.payoutMethod)}</td>
                <td className="px-5 py-3">
                  <EntryStatusBadge status={e.status} />
                </td>
                <td className="px-5 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-500">{e.paymentRef || "—"}</td>
                <td className="px-5 py-3 text-neutral-600 dark:text-neutral-500">{new Date(e.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-neutral-600 dark:text-neutral-500">
                  No distributions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

function CurrencyTotals({ totals, emptyLabel }: { totals: Record<string, number>; emptyLabel: string }) {
  const entries = Object.entries(totals).filter(([, v]) => v !== 0);
  if (entries.length === 0) return <p className="text-3xl font-semibold mt-1 text-neutral-400 dark:text-neutral-600">—<span className="block text-xs font-normal text-neutral-600 dark:text-neutral-500 mt-1">{emptyLabel}</span></p>;
  return (
    <div className="mt-1 space-y-0.5">
      {entries.map(([currency, amount]) => (
        <p key={currency} className="text-3xl font-semibold">
          {amount.toLocaleString()} <span className="text-base font-normal text-neutral-600 dark:text-neutral-500">{currency}</span>
        </p>
      ))}
    </div>
  );
}

function methodLabel(m: api.PayoutMethod) {
  return m === "manual" ? "Manual" : m === "mpesa_b2c" ? "M-Pesa" : "On-chain token";
}

function EntryStatusBadge({ status }: { status: api.EntryStatus }) {
  const cls =
    status === "paid"
      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : status === "failed"
        ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300"
        : status === "processing"
          ? "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300"
          : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>;
}
