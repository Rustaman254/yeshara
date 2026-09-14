"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import * as api from "@/lib/api";
import { AuthLayout, authInput } from "@/components/AuthLayout";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePoll } from "@/hooks/usePoll";

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
      api.setAdminEmail(email);
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

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [offerings, setOfferings] = useState<api.Offering[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showStaff, setShowStaff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<api.Offering | null>(null);
  const [distOffering, setDistOffering] = useState<api.Offering | null>(null);
  const [detailsOffering, setDetailsOffering] = useState<api.Offering | null>(null);

  const load = () => {
    api
      .adminListOfferings()
      .then((r) => setOfferings(r.offerings))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  };

  usePoll(load, 3000);

  const revalue = async (o: api.Offering) => {
    const priceStr = prompt(`New price per unit (currently ${o.pricePerUnit} ${o.currency}):`);
    if (!priceStr) return;
    const price = Number(priceStr);
    if (!price || price <= 0) {
      alert("Enter a valid positive price.");
      return;
    }
    const reason = prompt("Reason for this revaluation (e.g. occupancy up, new development nearby, flood damage):");
    if (!reason) return;
    try {
      await api.adminRevalueOffering(o.offeringId, price, reason);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to revalue");
    }
  };

  const setOwnerAccount = async (o: api.Offering) => {
    const email = prompt("Owner's email (they must already have an owner account — /owner/sign-up):");
    if (!email) return;
    try {
      await api.adminSetOfferingOwnerAccount(o.offeringId, email);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to link owner");
    }
  };

  const delist = async (o: api.Offering) => {
    const reason = prompt(`Reason for delisting "${o.title}"? (The on-chain asset and any existing holdings are untouched — this only removes it from the public marketplace.)`);
    if (!reason) return;
    try {
      await api.adminDelistOffering(o.offeringId, api.getAdminEmail() || "admin", reason);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delist");
    }
  };

  const relist = async (o: api.Offering) => {
    try {
      await api.adminRelistOffering(o.offeringId);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to relist");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0912] text-neutral-900 dark:text-neutral-100">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-xs text-neutral-600 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
              ← Back to Yeshara
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight mt-1">Issuer dashboard</h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-500">Create, approve, and manage primary-market offerings.</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/staff"
              className="rounded-md border border-neutral-200 dark:border-white/10 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-white/5"
            >
              Staff review queue →
            </Link>
            <button
              onClick={() => setShowStaff((v) => !v)}
              className="rounded-md border border-neutral-200 dark:border-white/10 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-white/5"
            >
              {showStaff ? "Cancel" : "Staff accounts"}
            </button>
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
            >
              {showCreate ? "Cancel" : "New offering"}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>}

        {showStaff && <StaffAccountsPanel />}

        {showCreate && (
          <CreateOfferingForm
            onCreated={() => {
              setShowCreate(false);
              load();
            }}
          />
        )}

        <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 dark:bg-white/5 text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
              <tr>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Symbol</th>
                <th className="px-5 py-3">Tx</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Total units</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offerings.map((o) => (
                <tr key={o.id} className="border-t border-neutral-200 dark:border-white/5">
                  <td className="px-5 py-3">{o.title}</td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-600 dark:text-neutral-500">{o.symbol || "—"}</td>
                  <td className="px-5 py-3">
                    {o.mintTxUrl || o.assetUrl ? (
                      <a
                        href={o.assetUrl || o.mintTxUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={o.mintTxHash}
                        className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="text-neutral-400 dark:text-neutral-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded bg-neutral-100 dark:bg-white/10 px-2 py-0.5 text-xs">
                      {api.STAGE_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">{o.totalUnits.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right space-x-3">
                    {(o.status === "pending_manager_a" ||
                      o.status === "pending_manager_b" ||
                      o.status === "pending_trustee_a" ||
                      o.status === "pending_trustee_b") && (
                      <span className="text-xs text-neutral-500 dark:text-neutral-500">
                        Awaiting {api.STAGE_LABELS[o.status]} — see /staff
                      </span>
                    )}
                    {o.status === "live" && (
                      <>
                        <button onClick={() => setSelected(o)} className="text-violet-600 dark:text-violet-400 hover:underline">
                          Orders
                        </button>
                        <button onClick={() => setDistOffering(o)} className="text-violet-600 dark:text-violet-400 hover:underline">
                          Distributions
                        </button>
                      </>
                    )}
                    <button onClick={() => setDetailsOffering(o)} className="text-violet-600 dark:text-violet-400 hover:underline">
                      Details
                    </button>
                    {o.status === "live" && (
                      <>
                        <button onClick={() => revalue(o)} className="text-violet-600 dark:text-violet-400 hover:underline">
                          Revalue
                        </button>
                        <button onClick={() => setOwnerAccount(o)} className="text-violet-600 dark:text-violet-400 hover:underline">
                          {o.ownerAccountId ? "Owner linked" : "Set owner"}
                        </button>
                        <button onClick={() => delist(o)} className="text-amber-600 dark:text-amber-400 hover:underline">
                          Delist
                        </button>
                      </>
                    )}
                    {o.status === "closed" && (
                      <button onClick={() => relist(o)} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                        Relist
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {offerings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-neutral-600 dark:text-neutral-500">
                    No offerings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selected && <OfferingOrders offering={selected} onClose={() => setSelected(null)} />}
        {distOffering && <DistributionsPanel offering={distOffering} onClose={() => setDistOffering(null)} />}
        {detailsOffering && (
          <OfferingDetailsForm
            offering={detailsOffering}
            onClose={() => setDetailsOffering(null)}
            onSaved={() => {
              setDetailsOffering(null);
              load();
            }}
          />
        )}

        <RedemptionsQueue />
        <div className="mt-8">
          <PendingKyc />
        </div>
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
    <form onSubmit={submit} className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6 mb-8 grid grid-cols-2 gap-4">
      <TextField label="Offering ID (slug)" value={form.offeringId} onChange={set("offeringId")} placeholder="wuyi-plaza-nairobi" required />
      <TextField label="Title" value={form.title} onChange={set("title")} required />
      <div>
        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Asset type</label>
        <select
          value={form.assetType}
          onChange={(e) => setForm((f) => ({ ...f, assetType: e.target.value }))}
          className={authInput}
        >
          <option value="real_estate">Real Estate</option>
          <option value="private_credit">Private Credit</option>
          <option value="private_equity">Private Equity</option>
          <option value="infrastructure">Infrastructure</option>
          <option value="commodities">Commodities</option>
          <option value="receivables">Receivables</option>
          <option value="other">Other</option>
        </select>
      </div>
      <TextField label="Location" value={form.location} onChange={set("location")} />
      <TextField label="Image URL" value={form.imageUrl} onChange={set("imageUrl")} />
      <TextField label="Total units" value={form.totalUnits} onChange={set("totalUnits")} type="number" required />
      <TextField label="Price per unit" value={form.pricePerUnit} onChange={set("pricePerUnit")} type="number" required />
      <TextField label="Currency" value={form.currency} onChange={set("currency")} required />
      <TextField label="Min investment (units)" value={form.minInvestmentUnits} onChange={set("minInvestmentUnits")} type="number" />
      <TextField label="Expected yield (%)" value={form.expectedYieldPct} onChange={set("expectedYieldPct")} type="number" />
      <div>
        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Risk level</label>
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
        <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className={authInput}
          rows={3}
        />
      </div>
      {error && <p className="col-span-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
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

// StaffAccountsPanel provisions the four approval-chain seats (Manager A/B,
// Trustee A/B) — not self-service, an admin assigns them to real people.
function StaffAccountsPanel() {
  const [staff, setStaff] = useState<api.StaffMember[]>([]);
  const [form, setForm] = useState({ email: "", password: "", fullName: "", role: "manager_a" as api.StaffRole });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .adminListStaffAccounts()
      .then((r) => setStaff(r.staff))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load staff accounts"));
  };
  usePoll(load, 3000);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.adminCreateStaffAccount(form);
      setForm({ email: "", password: "", fullName: "", role: "manager_a" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create staff account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6 mb-8">
      <h2 className="text-sm font-semibold mb-1">Staff accounts</h2>
      <p className="text-xs text-neutral-600 dark:text-neutral-500 mb-4">
        Each seat is a distinct login — a Manager B account cannot also act as Trustee A. Assign exactly one person per role.
      </p>
      <form onSubmit={submit} className="grid grid-cols-2 gap-4 mb-6">
        <TextField label="Full name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required />
        <TextField
          label="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          type="email"
          required
        />
        <TextField
          label="Temporary password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          type="password"
          required
        />
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as api.StaffRole }))}
            className={authInput}
          >
            {(Object.keys(api.STAFF_ROLE_LABELS) as api.StaffRole[]).map((r) => (
              <option key={r} value={r}>
                {api.STAFF_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="col-span-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create staff account"}
          </button>
        </div>
      </form>

      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((st) => (
            <tr key={st.id} className="border-t border-neutral-200 dark:border-white/5">
              <td className="py-2">{st.fullName}</td>
              <td className="py-2 text-neutral-600 dark:text-neutral-500">{st.email}</td>
              <td className="py-2">
                <span className="rounded bg-neutral-100 dark:bg-white/10 px-2 py-0.5 text-xs">{api.STAFF_ROLE_LABELS[st.role]}</span>
              </td>
              <td className="py-2 text-right">
                <button
                  onClick={async () => {
                    if (!confirm(`Remove ${st.fullName} (${api.STAFF_ROLE_LABELS[st.role]})? This ends their session immediately.`)) return;
                    try {
                      await api.adminDeleteStaffAccount(st.id);
                      load();
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Failed to remove");
                    }
                  }}
                  className="text-red-600 dark:text-red-400 hover:underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {staff.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-neutral-600 dark:text-neutral-500">
                No staff accounts yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
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
      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">{label}</label>
      <input className={authInput} {...rest} />
    </div>
  );
}

function joinLines<T>(items: T[] | undefined, fmt: (item: T) => string): string {
  return (items || []).map(fmt).join("\n");
}

function parseLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function OfferingDetailsForm({
  offering,
  onClose,
  onSaved,
}: {
  offering: api.Offering;
  onClose: () => void;
  onSaved: () => void;
}) {
  const d = offering.details || {};
  const [tags, setTags] = useState((d.tags || []).join(", "));
  const [trailingOneYearReturnPct, setTrailingOneYearReturnPct] = useState(d.trailingOneYearReturnPct?.toString() || "");
  const [expenseRatioPct, setExpenseRatioPct] = useState(d.expenseRatioPct?.toString() || "");
  const [underlyingFundExpensesPct, setUnderlyingFundExpensesPct] = useState(d.underlyingFundExpensesPct?.toString() || "");
  const [subscriptionFrequency, setSubscriptionFrequency] = useState(d.subscriptionFrequency || "");
  const [subscriptionDeadline, setSubscriptionDeadline] = useState(d.subscriptionDeadline || "");
  const [domicile, setDomicile] = useState(d.domicile || "");
  const [liquidityPool, setLiquidityPool] = useState(d.liquidityPool || "");
  const [redemptionWindow, setRedemptionWindow] = useState(d.redemptionWindow || "");
  const [tokenTransferLockup, setTokenTransferLockup] = useState(d.tokenTransferLockup || "");
  const [volatilityLevel, setVolatilityLevel] = useState(d.volatilityLevel || "");
  const [liquidityLevel, setLiquidityLevel] = useState(d.liquidityLevel || "");
  const [highlights, setHighlights] = useState(joinLines(d.highlights, (h) => `${h.title}|${h.body}`));
  const [performanceHistory, setPerformanceHistory] = useState(
    joinLines(d.performanceHistory, (p) => `${p.label}|${p.startPrice}|${p.endPrice}|${p.returnPct}`)
  );
  const [documents, setDocuments] = useState(joinLines(d.documents, (doc) => `${doc.name}|${doc.url}`));
  const [managerName, setManagerName] = useState(d.managerName || "");
  const [managerBio, setManagerBio] = useState(d.managerBio || "");
  const [managerStats, setManagerStats] = useState(joinLines(d.managerStats, (s) => `${s.label}|${s.value}`));
  const [disclosures, setDisclosures] = useState(d.disclosures || "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const details: api.OfferingDetails = {
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        trailingOneYearReturnPct: trailingOneYearReturnPct ? Number(trailingOneYearReturnPct) : undefined,
        expenseRatioPct: expenseRatioPct ? Number(expenseRatioPct) : undefined,
        underlyingFundExpensesPct: underlyingFundExpensesPct ? Number(underlyingFundExpensesPct) : undefined,
        subscriptionFrequency: subscriptionFrequency || undefined,
        subscriptionDeadline: subscriptionDeadline || undefined,
        domicile: domicile || undefined,
        liquidityPool: liquidityPool || undefined,
        redemptionWindow: redemptionWindow || undefined,
        tokenTransferLockup: tokenTransferLockup || undefined,
        volatilityLevel: volatilityLevel || undefined,
        liquidityLevel: liquidityLevel || undefined,
        highlights: parseLines(highlights).map((l) => {
          const [title, ...rest] = l.split("|");
          return { title: title?.trim() || "", body: rest.join("|").trim() };
        }),
        performanceHistory: parseLines(performanceHistory).map((l) => {
          const [label, start, end, ret] = l.split("|").map((s) => s.trim());
          return { label: label || "", startPrice: Number(start) || 0, endPrice: Number(end) || 0, returnPct: Number(ret) || 0 };
        }),
        documents: parseLines(documents).map((l) => {
          const [name, url] = l.split("|").map((s) => s.trim());
          return { name: name || "", url: url || "" };
        }),
        managerName: managerName || undefined,
        managerBio: managerBio || undefined,
        managerStats: parseLines(managerStats).map((l) => {
          const [label, value] = l.split("|").map((s) => s.trim());
          return { label: label || "", value: value || "" };
        }),
        disclosures: disclosures || undefined,
      };
      await api.adminUpdateOfferingDetails(offering.offeringId, details);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save details");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Fact sheet — {offering.title}</h2>
        <button onClick={onClose} className="text-sm text-neutral-600 dark:text-neutral-500 hover:underline">
          Close
        </button>
      </div>
      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <TextField label="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Qualified Purchasers, Evergreen, Senior Credit" />
        </div>
        <TextField label="1 year return (%)" value={trailingOneYearReturnPct} onChange={(e) => setTrailingOneYearReturnPct(e.target.value)} type="number" />
        <TextField label="Expense ratio (%)" value={expenseRatioPct} onChange={(e) => setExpenseRatioPct(e.target.value)} type="number" />
        <TextField label="Underlying fund expenses (%)" value={underlyingFundExpensesPct} onChange={(e) => setUnderlyingFundExpensesPct(e.target.value)} type="number" />
        <TextField label="Subscription frequency" value={subscriptionFrequency} onChange={(e) => setSubscriptionFrequency(e.target.value)} placeholder="On-demand" />
        <TextField label="Subscription deadline" value={subscriptionDeadline} onChange={(e) => setSubscriptionDeadline(e.target.value)} placeholder="2pm ET" />
        <TextField label="Domicile" value={domicile} onChange={(e) => setDomicile(e.target.value)} placeholder="Delaware" />
        <TextField label="Liquidity pool" value={liquidityPool} onChange={(e) => setLiquidityPool(e.target.value)} placeholder="On-demand" />
        <TextField label="Redemption window" value={redemptionWindow} onChange={(e) => setRedemptionWindow(e.target.value)} placeholder="Monthly" />
        <TextField label="Token transfer lock-up" value={tokenTransferLockup} onChange={(e) => setTokenTransferLockup(e.target.value)} placeholder="None" />
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Volatility</label>
          <select value={volatilityLevel} onChange={(e) => setVolatilityLevel(e.target.value)} className={authInput}>
            <option value="">—</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Liquidity</label>
          <select value={liquidityLevel} onChange={(e) => setLiquidityLevel(e.target.value)} className={authInput}>
            <option value="">—</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">
            Highlights — one per line, &quot;Title|Body&quot;
          </label>
          <textarea value={highlights} onChange={(e) => setHighlights(e.target.value)} className={authInput} rows={3} placeholder={"Seasoned asset manager|Decades of experience sourcing opportunities."} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">
            Performance history — one per line, &quot;Label|Start price|End price|Return %&quot;
          </label>
          <textarea value={performanceHistory} onChange={(e) => setPerformanceHistory(e.target.value)} className={authInput} rows={3} placeholder={"Aug 2025|1194.07|1200.60|0.53"} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Documents — one per line, &quot;Name|URL&quot;</label>
          <textarea value={documents} onChange={(e) => setDocuments(e.target.value)} className={authInput} rows={2} placeholder={"Private Placement Memorandum|https://example.com/ppm.pdf"} />
        </div>

        <TextField label="Manager name" value={managerName} onChange={(e) => setManagerName(e.target.value)} />
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Manager stats — one per line, &quot;Label|Value&quot;</label>
          <textarea value={managerStats} onChange={(e) => setManagerStats(e.target.value)} className={authInput} rows={2} placeholder={"Years in business|34"} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Manager bio</label>
          <textarea value={managerBio} onChange={(e) => setManagerBio(e.target.value)} className={authInput} rows={3} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Disclosures</label>
          <textarea value={disclosures} onChange={(e) => setDisclosures(e.target.value)} className={authInput} rows={4} />
        </div>

        {error && <p className="col-span-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save fact sheet"}
          </button>
        </div>
      </form>
    </div>
  );
}

function OfferingOrders({ offering, onClose }: { offering: api.Offering; onClose: () => void }) {
  const [orders, setOrders] = useState<api.Investment[]>([]);

  const load = () => {
    api.adminListOfferingInvestments(offering.offeringId).then((r) => setOrders(r.investments));
  };
  usePoll(load, 3000);

  const confirm = async (id: string) => {
    try {
      await api.adminConfirmInvestment(id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to confirm");
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Orders — {offering.title}</h2>
        <button onClick={onClose} className="text-sm text-neutral-600 dark:text-neutral-500 hover:underline">
          Close
        </button>
      </div>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
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
            <tr key={o.id} className="border-t border-neutral-200 dark:border-white/5">
              <td className="py-2">{o.units}</td>
              <td className="py-2">
                {o.amountDue.toLocaleString()} {o.currency}
              </td>
              <td className="py-2 font-mono text-xs">{o.paymentRef}</td>
              <td className="py-2">{o.status}</td>
              <td className="py-2 text-right">
                {o.status === "pending_payment" && (
                  <button onClick={() => confirm(o.id)} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                    Confirm payment
                  </button>
                )}
                {o.txHash && (
                  <span className="ml-2 font-mono text-xs text-neutral-600 dark:text-neutral-500" title={o.txHash}>
                    {o.txHash.slice(0, 8)}…
                  </span>
                )}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-center text-neutral-600 dark:text-neutral-500">
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DistributionsPanel({ offering, onClose }: { offering: api.Offering; onClose: () => void }) {
  const [distributions, setDistributions] = useState<api.Distribution[]>([]);
  const [entriesByDist, setEntriesByDist] = useState<Record<string, api.DistributionEntry[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    periodLabel: "",
    totalAmount: "",
    payoutMethod: "manual" as api.PayoutMethod,
    payoutAssetSymbol: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api
      .adminListOfferingDistributions(offering.offeringId)
      .then((r) => {
        setDistributions(r.distributions);
        r.distributions.forEach((d) => {
          api.adminListDistributionEntries(d.id).then((er) => setEntriesByDist((m) => ({ ...m, [d.id]: er.entries })));
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  };
  usePoll(load, 3000);

  const trigger = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const res = await api.adminTriggerDistribution(offering.offeringId, {
        periodLabel: form.periodLabel,
        totalAmount: Number(form.totalAmount),
        payoutMethod: form.payoutMethod,
        payoutAssetSymbol: form.payoutMethod === "onchain_token" ? form.payoutAssetSymbol : undefined,
        createdBy: api.getAdminEmail() || "admin",
      });
      if (res.status === "funding_required") {
        setNotice(res.message || `Treasury balance too low: has ${res.treasuryAvailable}, needs ${res.required}.`);
      }
      setForm({ periodLabel: "", totalAmount: "", payoutMethod: "manual", payoutAssetSymbol: "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger distribution");
    } finally {
      setSubmitting(false);
    }
  };

  const markPaid = async (entryId: string) => {
    const ref = prompt("Payment reference:");
    if (!ref) return;
    try {
      await api.adminMarkDistributionEntryPaid(entryId, ref);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to mark paid");
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Distributions — {offering.title}</h2>
        <button onClick={onClose} className="text-sm text-neutral-600 dark:text-neutral-500 hover:underline">
          Close
        </button>
      </div>

      <form onSubmit={trigger} className="grid grid-cols-2 gap-3 mb-6">
        <TextField
          label="Period label"
          value={form.periodLabel}
          onChange={(e) => setForm((f) => ({ ...f, periodLabel: e.target.value }))}
          placeholder="Q1 2026 rental income"
          required
        />
        <TextField
          label={`Total amount (${offering.currency})`}
          value={form.totalAmount}
          onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))}
          type="number"
          required
        />
        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-500 mb-1">Payout method</label>
          <select
            value={form.payoutMethod}
            onChange={(e) => setForm((f) => ({ ...f, payoutMethod: e.target.value as api.PayoutMethod }))}
            className={authInput}
          >
            <option value="manual">Manual (pay off-platform, mark paid)</option>
            <option value="mpesa_b2c">M-Pesa (automated — requires funded comet-engine treasury)</option>
            <option value="onchain_token">On-chain token (mints a registered asset)</option>
          </select>
        </div>
        {form.payoutMethod === "onchain_token" && (
          <TextField
            label="Payout asset symbol"
            value={form.payoutAssetSymbol}
            onChange={(e) => setForm((f) => ({ ...f, payoutAssetSymbol: e.target.value }))}
            placeholder="USDC"
            required
          />
        )}
        {error && <p className="col-span-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {notice && <p className="col-span-2 text-sm text-amber-600 dark:text-amber-400">{notice}</p>}
        <div className="col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {submitting ? "Distributing…" : "Trigger distribution"}
          </button>
        </div>
      </form>

      {distributions.map((d) => (
        <div key={d.id} className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm font-medium">{d.periodLabel}</p>
            <span className="rounded bg-neutral-100 dark:bg-white/10 px-2 py-0.5 text-xs">{d.status}</span>
            <span className="text-xs text-neutral-600 dark:text-neutral-500">
              {d.totalAmount.toLocaleString()} {d.currency} · {d.payoutMethod}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
              <tr>
                <th className="py-1">Investor</th>
                <th className="py-1">Amount</th>
                <th className="py-1">Status</th>
                <th className="py-1">Reference</th>
                <th className="py-1 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(entriesByDist[d.id] || []).map((e) => (
                <tr key={e.id} className="border-t border-neutral-200 dark:border-white/5">
                  <td className="py-1 font-mono text-xs">{e.investorId}</td>
                  <td className="py-1">
                    {e.amount.toLocaleString()} {e.currency}
                  </td>
                  <td className="py-1">{e.status}</td>
                  <td className="py-1 font-mono text-xs text-neutral-600 dark:text-neutral-500">{e.paymentRef || "—"}</td>
                  <td className="py-1 text-right">
                    {(e.status === "pending" || e.status === "processing") && (
                      <button onClick={() => markPaid(e.id)} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                        Mark paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {distributions.length === 0 && <p className="text-sm text-neutral-600 dark:text-neutral-500">No distributions yet.</p>}
    </div>
  );
}

function RedemptionsQueue() {
  const [redemptions, setRedemptions] = useState<api.RedemptionRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    api
      .adminListRedemptions()
      .then((r) => setRedemptions(r.redemptions))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  };
  usePoll(load, 3000);

  const approve = async (r: api.RedemptionRequest) => {
    try {
      await api.adminApproveRedemption(r.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve");
    }
  };
  const reject = async (r: api.RedemptionRequest) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
      await api.adminRejectRedemption(r.id, reason);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject");
    }
  };
  const markPaid = async (r: api.RedemptionRequest) => {
    const ref = prompt("Payment reference:");
    if (!ref) return;
    try {
      await api.adminMarkRedemptionPaid(r.id, ref);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to mark paid");
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6 mb-8">
      <h2 className="font-semibold mb-4">Redemptions</h2>
      {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
          <tr>
            <th className="py-2">Investor</th>
            <th className="py-2">Units</th>
            <th className="py-2">Payout</th>
            <th className="py-2">Method</th>
            <th className="py-2">Status</th>
            <th className="py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {redemptions.map((r) => (
            <tr key={r.id} className="border-t border-neutral-200 dark:border-white/5">
              <td className="py-2 font-mono text-xs">{r.investorId}</td>
              <td className="py-2">{r.units}</td>
              <td className="py-2">
                {r.payoutAmount.toLocaleString()} {r.currency}
              </td>
              <td className="py-2 text-xs text-neutral-600 dark:text-neutral-400">{r.payoutMethod}</td>
              <td className="py-2">{r.status}</td>
              <td className="py-2 text-right space-x-3">
                {r.status === "pending" && (
                  <>
                    <button onClick={() => approve(r)} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                      Approve
                    </button>
                    <button onClick={() => reject(r)} className="text-red-600 dark:text-red-400 hover:underline">
                      Reject
                    </button>
                  </>
                )}
                {r.status === "approved_burned" && (
                  <button onClick={() => markPaid(r)} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                    Mark paid
                  </button>
                )}
              </td>
            </tr>
          ))}
          {redemptions.length === 0 && (
            <tr>
              <td colSpan={6} className="py-4 text-center text-neutral-600 dark:text-neutral-500">
                Nothing pending.
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
  usePoll(load, 3000);

  const decide = async (investorId: string, approved: boolean) => {
    const reason = approved ? "" : prompt("Rejection reason:") || "";
    try {
      await api.adminDecideKyc(investorId, approved, api.getAdminEmail() || "admin", reason);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to record decision");
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#141019] p-6">
      <h2 className="font-semibold mb-4">Pending KYC reviews</h2>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-500">
          <tr>
            <th className="py-2">Name</th>
            <th className="py-2">Country</th>
            <th className="py-2">Submitted</th>
            <th className="py-2 text-right">Decision</th>
          </tr>
        </thead>
        <tbody>
          {pending.map((p) => (
            <tr key={p.investorId} className="border-t border-neutral-200 dark:border-white/5">
              <td className="py-2">{p.fullName}</td>
              <td className="py-2">{p.country}</td>
              <td className="py-2 text-neutral-600 dark:text-neutral-500">{new Date(p.submittedAt).toLocaleDateString()}</td>
              <td className="py-2 text-right space-x-3">
                <button onClick={() => decide(p.investorId, true)} className="text-emerald-600 dark:text-emerald-400 hover:underline">
                  Approve
                </button>
                <button onClick={() => decide(p.investorId, false)} className="text-red-600 dark:text-red-400 hover:underline">
                  Reject
                </button>
              </td>
            </tr>
          ))}
          {pending.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-neutral-600 dark:text-neutral-500">
                Nothing pending.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
