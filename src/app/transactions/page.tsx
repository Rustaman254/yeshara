"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { DashboardShell } from "@/components/DashboardShell";

// comet-engine defaults to Stellar testnet (STELLAR_HORIZON_URL) unless the
// engine deployment overrides it — set this to "public" once Yeshara moves
// to Stellar mainnet so transaction links resolve on the right network.
const STELLAR_EXPLORER_NETWORK = process.env.NEXT_PUBLIC_STELLAR_EXPLORER_NETWORK || "testnet";

function explorerUrl(txHash: string) {
  return `https://stellar.expert/explorer/${STELLAR_EXPLORER_NETWORK}/tx/${txHash}`;
}

export default function TransactionsPage() {
  const router = useRouter();
  const { investor, loading: authLoading } = useAuth();
  const [investments, setInvestments] = useState<api.Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!investor) {
      router.push("/sign-in");
      return;
    }
    api
      .myInvestments()
      .then((r) => setInvestments(r.investments))
      .finally(() => setLoading(false));
  }, [authLoading, investor, router]);

  if (authLoading || loading) {
    return (
      <DashboardShell>
        <div className="text-neutral-600 dark:text-neutral-500 text-sm">Loading…</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Transactions</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-8">Every order you've placed, with the on-chain transaction once it settles.</p>

      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 dark:bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
            <tr>
              <th className="px-5 py-3">Units</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Transaction</th>
              <th className="px-5 py-3">Placed</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => (
              <tr key={inv.id} className="border-t border-neutral-200 dark:border-white/5">
                <td className="px-5 py-3">{inv.units}</td>
                <td className="px-5 py-3">
                  {inv.amountDue.toLocaleString()} {inv.currency}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-5 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-500">{inv.paymentRef}</td>
                <td className="px-5 py-3 font-mono text-xs">
                  {inv.txHash ? (
                    <a
                      href={explorerUrl(inv.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                      title={inv.txHash}
                    >
                      {inv.txHash.slice(0, 8)}…{inv.txHash.slice(-6)}
                    </a>
                  ) : (
                    <span className="text-neutral-400 dark:text-neutral-600">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-neutral-600 dark:text-neutral-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {investments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-neutral-600 dark:text-neutral-500">
                  No transactions yet.
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
      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : status === "cancelled"
        ? "bg-neutral-100 dark:bg-neutral-500/10 text-neutral-600 dark:text-neutral-400"
        : status === "failed"
          ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300"
          : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{status.replace("_", " ")}</span>;
}
