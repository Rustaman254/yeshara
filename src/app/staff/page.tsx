"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { AuthLayout, authInput } from "@/components/AuthLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePoll } from "@/hooks/usePoll";

// The seat-by-seat next action a staff member takes to clear their own
// stage — same label across every role, since "Review" always means "I've
// looked at this, forward it," except Trustee B where it's the actual
// mint. Server-side dispatch (see staff_handlers.go's staffReview) is what
// actually enforces which transition a given role can trigger; this page
// never has to know that, it just calls the one shared endpoint.
const REVIEW_ACTION_LABEL: Record<api.StaffRole, string> = {
  manager_a: "Clear & forward to Manager B",
  manager_b: "Countersign & forward to Trustee A",
  trustee_a: "Approve issuance & forward to Trustee B",
  trustee_b: "Tokenize (mint on-chain)",
};

export default function StaffPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [me, setMe] = useState<api.StaffMember | null>(null);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    if (!api.getStaffSessionToken()) {
      setCheckedSession(true);
      return;
    }
    api
      .staffMe()
      .then((r) => setMe(r.staff))
      .catch(() => api.clearStaffSessionToken())
      .finally(() => setCheckedSession(true));
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token, staff } = await api.staffLogin(email, password);
      api.setStaffSessionToken(token);
      setMe(staff);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  if (!checkedSession) return null;

  if (!me) {
    return (
      <AuthLayout title="Staff sign-in" subtitle="Manager A, Manager B, Trustee A, and Trustee B each sign in with their own credentials.">
        <form onSubmit={login} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Staff email"
            className={authInput}
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={authInput}
          />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <StaffDashboard
      me={me}
      onLogout={() => {
        api.staffLogout().catch(() => {});
        api.clearStaffSessionToken();
        setMe(null);
      }}
    />
  );
}

function StaffDashboard({ me, onLogout }: { me: api.StaffMember; onLogout: () => void }) {
  const [queue, setQueue] = useState<api.Offering[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    api
      .staffQueue()
      .then((r) => setQueue(r.offerings))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load queue"));
  };
  usePoll(load, 3000);

  const review = async (o: api.Offering) => {
    setBusyId(o.id);
    setError(null);
    try {
      const r = await api.staffReviewOffering(o.offeringId);
      if (r.mintTxUrl) {
        alert(`Tokenized on-chain: ${r.mintTxUrl}`);
      }
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to review");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (o: api.Offering) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    setBusyId(o.id);
    setError(null);
    try {
      await api.staffRejectOffering(o.offeringId, reason);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0912] text-neutral-900 dark:text-neutral-100">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-xs text-neutral-600 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
              ← Back to Yeshara
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight mt-1">{api.STAFF_ROLE_LABELS[me.role]} queue</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-500">
              Signed in as {me.fullName} ({me.email})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onLogout}
              className="rounded-md border border-neutral-200 dark:border-white/10 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}

        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 dark:bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Symbol</th>
                <th className="px-5 py-3 text-right">Total units</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((o) => (
                <tr key={o.id} className="border-t border-neutral-200 dark:border-white/5">
                  <td className="px-5 py-3">{o.title}</td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-500">{o.symbol || "—"}</td>
                  <td className="px-5 py-3 text-right">{o.totalUnits.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <button
                      onClick={() => review(o)}
                      disabled={busyId === o.id}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
                    >
                      {busyId === o.id ? "Working…" : REVIEW_ACTION_LABEL[me.role]}
                    </button>
                    <button
                      onClick={() => reject(o)}
                      disabled={busyId === o.id}
                      className="text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {queue.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-neutral-600 dark:text-neutral-500">
                    Nothing waiting on your desk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
