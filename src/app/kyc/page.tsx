"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { DashboardShell } from "@/components/DashboardShell";
import { ShieldCheck, ShieldAlert, ShieldX, Clock } from "lucide-react";

const darkInput =
  "w-full rounded-md border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 outline-none focus:border-violet-500";

export default function KycPage() {
  const router = useRouter();
  const { investor, kycStatus, loading: authLoading, refresh } = useAuth();
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!authLoading && !investor) {
    router.push("/sign-in");
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.submitKyc(fullName, country, address, idNumber, dateOfBirth);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-lg">
        <h1 className="text-xl font-semibold tracking-tight mb-1">Identity verification</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-500 mb-6">
          Required before investing. Note: this is a simplified verification flow for demonstration — reviewed manually
          by Yeshara, not an automated identity-document check.
        </p>

        <StatusBanner status={kycStatus} />

        {kycStatus === "unverified" || kycStatus === "rejected" ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Full legal name</label>
              <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={darkInput} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Country of residence</label>
              <input required placeholder="KE" value={country} onChange={(e) => setCountry(e.target.value)} className={darkInput} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Residential address</label>
              <input required value={address} onChange={(e) => setAddress(e.target.value)} className={darkInput} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">ID / passport number</label>
              <input required value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className={darkInput} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Date of birth</label>
              <input required type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={darkInput} />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit for verification"}
            </button>
          </form>
        ) : null}
      </div>
    </DashboardShell>
  );
}

function StatusBanner({ status }: { status: api.KycStatus | null }) {
  if (!status) return null;
  const map: Record<api.KycStatus, { icon: React.ReactNode; text: string; cls: string }> = {
    unverified: { icon: <ShieldAlert className="h-4 w-4" />, text: "Not yet submitted.", cls: "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10" },
    pending: { icon: <Clock className="h-4 w-4" />, text: "Submitted — awaiting review.", cls: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20" },
    verified: { icon: <ShieldCheck className="h-4 w-4" />, text: "Verified. You can invest in live offerings.", cls: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20" },
    rejected: { icon: <ShieldX className="h-4 w-4" />, text: "Rejected — please resubmit with correct details.", cls: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/20" },
  };
  const s = map[status];
  return (
    <div className={`mb-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${s.cls}`}>
      {s.icon}
      {s.text}
    </div>
  );
}
