"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { AuthLayout, authInput } from "@/components/AuthLayout";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (api.getAdminToken()) setUnlocked(true);
  }, []);

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token } = await api.adminLogin(email, password);
      api.setAdminToken(token);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  if (!unlocked) {
    return (
      <AuthLayout
        title="Issuer / admin"
        subtitle="Sign in with the admin email and password to manage offerings. This is a single super-admin account for this MVP — not a per-user admin role system."
      >
        <form onSubmit={unlock} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            className={authInput}
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className={authInput}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
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

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [offerings, setOfferings] = useState<api.Offering[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<api.Offering | null>(null);

  const load = () => {
    api
      .adminListOfferings()
      .then((r) => setOfferings(r.offerings))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  };

  useEffect(load, []);

  const approve = async (o: api.Offering) => {
    const approvedBy = prompt("Approved by (name):");
    if (!approvedBy) return;
    try {
      await api.adminApproveOffering(o.offeringId, approvedBy);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve");
    }
  };

  const reject = async (o: api.Offering) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
      await api.adminRejectOffering(o.offeringId, reason);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0912] text-neutral-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300">
              ← Back to Yeshara
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight mt-1">Issuer dashboard</h1>
            <p className="text-sm text-neutral-500">Create, approve, and manage primary-market offerings.</p>
          </div>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            {showCreate ? "Cancel" : "New offering"}
          </button>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        {showCreate && (
          <CreateOfferingForm
            onCreated={() => {
              setShowCreate(false);
              load();
            }}
          />
        )}

        <div className="rounded-xl border border-white/10 bg-[#141019] overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Symbol</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Total units</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offerings.map((o) => (
                <tr key={o.id} className="border-t border-white/5">
                  <td className="px-5 py-3">{o.title}</td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-500">{o.symbol || "—"}</td>
                  <td className="px-5 py-3">
                    <span className="rounded bg-white/10 px-2 py-0.5 text-xs">{o.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">{o.totalUnits.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right space-x-3">
                    {o.status === "pending_approval" && (
                      <>
                        <button onClick={() => approve(o)} className="text-emerald-400 hover:underline">
                          Approve
                        </button>
                        <button onClick={() => reject(o)} className="text-red-400 hover:underline">
                          Reject
                        </button>
                      </>
                    )}
                    {o.status === "live" && (
                      <button onClick={() => setSelected(o)} className="text-violet-400 hover:underline">
                        Orders
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {offerings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-neutral-500">
                    No offerings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && <OfferingOrders offering={selected} onClose={() => setSelected(null)} />}

        <PendingKyc />
      </div>
    </div>
  );
}

function CreateOfferingForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({
    offeringId: "",
    title: "",
    assetType: "real_estate",
    location: "",
    description: "",
    imageUrl: "",
    totalUnits: "",
    pricePerUnit: "",
    currency: "USD",
    minInvestmentUnits: "",
    expectedYieldPct: "",
    riskLevel: "medium",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.adminCreateOffering({
        offeringId: form.offeringId,
        title: form.title,
        assetType: form.assetType,
        location: form.location,
        description: form.description,
        imageUrl: form.imageUrl || undefined,
        totalUnits: Number(form.totalUnits),
        pricePerUnit: Number(form.pricePerUnit),
        currency: form.currency,
        minInvestmentUnits: form.minInvestmentUnits ? Number(form.minInvestmentUnits) : undefined,
        expectedYieldPct: form.expectedYieldPct ? Number(form.expectedYieldPct) : undefined,
        riskLevel: form.riskLevel || undefined,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create offering");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-white/10 bg-[#141019] p-6 mb-8 grid grid-cols-2 gap-4">
      <TextField label="Offering ID (slug)" value={form.offeringId} onChange={set("offeringId")} placeholder="wuyi-plaza-nairobi" required />
      <TextField label="Title" value={form.title} onChange={set("title")} required />
      <TextField label="Asset type" value={form.assetType} onChange={set("assetType")} required />
      <TextField label="Location" value={form.location} onChange={set("location")} />
      <TextField label="Image URL" value={form.imageUrl} onChange={set("imageUrl")} />
      <TextField label="Total units" value={form.totalUnits} onChange={set("totalUnits")} type="number" required />
      <TextField label="Price per unit" value={form.pricePerUnit} onChange={set("pricePerUnit")} type="number" required />
      <TextField label="Currency" value={form.currency} onChange={set("currency")} required />
      <TextField label="Min investment (units)" value={form.minInvestmentUnits} onChange={set("minInvestmentUnits")} type="number" />
      <TextField label="Expected yield (%)" value={form.expectedYieldPct} onChange={set("expectedYieldPct")} type="number" />
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">Risk level</label>
        <select
          value={form.riskLevel}
          onChange={(e) => setForm((f) => ({ ...f, riskLevel: e.target.value }))}
          className={authInput}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="col-span-2">
        <label className="block text-xs font-medium text-neutral-500 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={authInput}
          rows={3}
        />
      </div>
      {error && <p className="col-span-2 text-sm text-red-400">{error}</p>}
      <div className="col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {submitting ? "Depositing to comet-engine…" : "Create offering"}
        </button>
      </div>
    </form>
  );
}

function TextField(props: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-500 mb-1">{label}</label>
      <input className={authInput} {...rest} />
    </div>
  );
}

function OfferingOrders({ offering, onClose }: { offering: api.Offering; onClose: () => void }) {
  const [orders, setOrders] = useState<api.Investment[]>([]);

  const load = () => {
    api.adminListOfferingInvestments(offering.offeringId).then((r) => setOrders(r.investments));
  };
  useEffect(load, [offering.offeringId]);

  const confirm = async (id: string) => {
    try {
      await api.adminConfirmInvestment(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to confirm");
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#141019] p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Orders — {offering.title}</h2>
        <button onClick={onClose} className="text-sm text-neutral-500 hover:underline">
          Close
        </button>
      </div>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="py-2">Units</th>
            <th className="py-2">Amount</th>
            <th className="py-2">Reference</th>
            <th className="py-2">Status</th>
            <th className="py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-white/5">
              <td className="py-2">{o.units}</td>
              <td className="py-2">
                {o.amountDue.toLocaleString()} {o.currency}
              </td>
              <td className="py-2 font-mono text-xs">{o.paymentRef}</td>
              <td className="py-2">{o.status}</td>
              <td className="py-2 text-right">
                {o.status === "pending_payment" && (
                  <button onClick={() => confirm(o.id)} className="text-emerald-400 hover:underline">
                    Confirm payment
                  </button>
                )}
                {o.txHash && (
                  <span className="ml-2 font-mono text-xs text-neutral-500" title={o.txHash}>
                    {o.txHash.slice(0, 8)}…
                  </span>
                )}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-neutral-500">
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

interface KycPendingRecord {
  investorId: string;
  fullName: string;
  country: string;
  submittedAt: string;
}

function PendingKyc() {
  const [pending, setPending] = useState<KycPendingRecord[]>([]);

  const load = () => {
    api.adminListPendingKyc().then((r) => setPending(r.pending as KycPendingRecord[]));
  };
  useEffect(load, []);

  const decide = async (investorId: string, approved: boolean) => {
    const decidedBy = prompt("Your name:");
    if (!decidedBy) return;
    const reason = approved ? "" : prompt("Rejection reason:") || "";
    try {
      await api.adminDecideKyc(investorId, approved, decidedBy, reason);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to record decision");
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#141019] p-6">
      <h2 className="font-semibold mb-4">Pending KYC reviews</h2>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Country</th>
            <th className="py-2">Submitted</th>
            <th className="py-2 text-right">Decision</th>
          </tr>
        </thead>
        <tbody>
          {pending.map((p) => (
            <tr key={p.investorId} className="border-t border-white/5">
              <td className="py-2">{p.fullName}</td>
              <td className="py-2">{p.country}</td>
              <td className="py-2 text-neutral-500">{new Date(p.submittedAt).toLocaleDateString()}</td>
              <td className="py-2 text-right space-x-3">
                <button onClick={() => decide(p.investorId, true)} className="text-emerald-400 hover:underline">
                  Approve
                </button>
                <button onClick={() => decide(p.investorId, false)} className="text-red-400 hover:underline">
                  Reject
                </button>
              </td>
            </tr>
          ))}
          {pending.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-neutral-500">
                Nothing pending.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
