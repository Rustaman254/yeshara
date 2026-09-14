"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as api from "@/lib/api";
import { OwnerShell } from "@/components/OwnerShell";
import { usePoll } from "@/hooks/usePoll";

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [owner, setOwner] = useState<api.Owner | null>(null);
  const [offerings, setOfferings] = useState<api.OwnerOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!api.getOwnerSessionToken()) router.push("/owner/sign-in");
  }, [router]);

  usePoll(
    () =>
      Promise.all([api.ownerMe(), api.ownerMyOfferings()])
        .then(([me, o]) => {
          setOwner(me.owner);
          setOfferings(o.offerings);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load");
          if (err instanceof api.ApiError && err.status === 401) {
            api.clearOwnerSessionToken();
            router.push("/owner/sign-in");
          }
        })
        .finally(() => setLoading(false)),
    3000,
    !!api.getOwnerSessionToken()
  );

  if (loading) {
    return (
      <OwnerShell>
        <div className="text-neutral-600 dark:text-neutral-500 text-sm">Loading…</div>
      </OwnerShell>
    );
  }

  const totalValue = offerings.reduce((sum, o) => sum + o.value, 0);
  const totalKesValue = offerings.reduce((sum, o) => sum + (o.kesValue ?? 0), 0);

  return (
    <OwnerShell>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Your reserved stake</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-8">
        {owner ? `Signed in as ${owner.fullName || owner.email}. ` : ""}
        The share of each offering's supply reserved for you as the original owner.
      </p>

      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}

      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6 mb-8">
        <p className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">Total value</p>
        <p className="text-3xl font-semibold mt-1">${totalValue.toLocaleString()}</p>
        {totalKesValue > 0 && (
          <p className="text-xs text-neutral-600 dark:text-neutral-500 mt-1">
            ≈ KES {totalKesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        )}
      </div>

      {offerings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 dark:border-white/10 py-12 text-center text-neutral-600 dark:text-neutral-500 text-sm">
          No offerings are linked to your account yet. An admin links your account once they've verified you own the
          asset being tokenized.
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 dark:bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
              <tr>
                <th className="px-5 py-3">Offering</th>
                <th className="px-5 py-3">Symbol</th>
                <th className="px-5 py-3 text-right">Reserved units</th>
                <th className="px-5 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {offerings.map((o) => (
                <tr key={o.offeringId} className="border-t border-neutral-200 dark:border-white/5">
                  <td className="px-5 py-3">
                    <Link href={`/marketplace/${o.offeringId}`} className="hover:underline">
                      {o.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-500">{o.symbol}</td>
                  <td className="px-5 py-3 text-right">{o.reservedUnits.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <p className="font-medium">
                      {o.value.toLocaleString()} {o.currency}
                    </p>
                    {o.kesValue != null && o.currency !== "KES" && (
                      <p className="text-[0.65rem] text-neutral-600 dark:text-neutral-500">
                        ≈ KES {o.kesValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OwnerShell>
  );
}
