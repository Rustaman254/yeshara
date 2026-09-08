"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { DashboardShell } from "@/components/DashboardShell";
import * as api from "@/lib/api";
import { ShieldCheck, ShieldAlert, ShieldX, Clock, MapPin, Mail, Calendar, Fingerprint, Wallet, Pencil, Check, Copy } from "lucide-react";
import type { KycStatus } from "@/lib/api";

const KYC_META: Record<KycStatus, { icon: React.ReactNode; label: string; cls: string }> = {
  unverified: { icon: <ShieldAlert className="h-4 w-4" />, label: "Not verified", cls: "bg-neutral-500/10 text-neutral-300 border-neutral-500/20" },
  pending: { icon: <Clock className="h-4 w-4" />, label: "Pending review", cls: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  verified: { icon: <ShieldCheck className="h-4 w-4" />, label: "Verified", cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  rejected: { icon: <ShieldX className="h-4 w-4" />, label: "Rejected", cls: "bg-red-500/10 text-red-300 border-red-500/20" },
};

function initials(name?: string, email?: string) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

export default function ProfilePage() {
  const router = useRouter();
  const { investor, kycStatus, profile, stellarAddress, loading, refresh } = useAuth();

  useEffect(() => {
    if (!loading && !investor) router.push("/sign-in");
  }, [loading, investor, router]);

  if (loading || !investor) {
    return (
      <DashboardShell>
        <div className="text-neutral-500 text-sm">Loading…</div>
      </DashboardShell>
    );
  }

  const kyc = kycStatus ? KYC_META[kycStatus] : null;

  return (
    <DashboardShell>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight mb-1">Profile</h1>
        <p className="text-sm text-neutral-500 mb-6">Your account and identity information.</p>

        <div className="rounded-xl border border-white/10 bg-[#141019] p-6 mb-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-violet-600/80 flex items-center justify-center text-xl font-semibold shrink-0">
            {initials(investor.fullName, investor.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold truncate">{investor.fullName}</p>
            <p className="text-sm text-neutral-500 truncate">{investor.email}</p>
          </div>
          {kyc && (
            <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${kyc.cls}`}>
              {kyc.icon}
              {kyc.label}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/10 bg-[#141019] p-6">
            <h2 className="font-semibold mb-4 text-sm">Personal information</h2>
            <dl className="space-y-4 text-sm">
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={investor.email} />
              <AddressRow address={profile?.address} onSaved={refresh} />
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Country" value={profile?.country || "Not provided"} />
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Date of birth"
                value={profile?.dateOfBirth || "Not provided"}
              />
              <InfoRow
                icon={<Fingerprint className="h-4 w-4" />}
                label="ID / passport number"
                value={profile?.idNumber ? maskId(profile.idNumber) : "Not provided"}
              />
            </dl>
            {(kycStatus === "unverified" || kycStatus === "rejected") && (
              <Link href="/kyc" className="mt-4 inline-block text-xs text-violet-400 hover:underline">
                Complete identity verification →
              </Link>
            )}
            {kycStatus === "pending" && <p className="mt-4 text-xs text-neutral-500">Verification pending review.</p>}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#141019] p-6">
            <h2 className="font-semibold mb-4 text-sm">Account</h2>
            <dl className="space-y-4 text-sm">
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Member since"
                value={new Date(investor.createdAt).toLocaleDateString()}
              />
              <WalletRow address={stellarAddress} />
            </dl>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function maskId(id: string) {
  if (id.length <= 4) return id;
  return `••••${id.slice(-4)}`;
}

function AddressRow({ address, onSaved }: { address?: string; onSaved: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(address || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <div className="flex items-start gap-3">
        <span className="text-neutral-500 mt-0.5">
          <MapPin className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <dt className="text-xs text-neutral-500 mb-1">Address</dt>
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-neutral-100 outline-none focus:border-violet-500"
            />
            <button
              disabled={saving || !value.trim()}
              onClick={async () => {
                setSaving(true);
                setError(null);
                try {
                  await api.updateAddress(value.trim());
                  await onSaved();
                  setEditing(false);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Failed to save");
                } finally {
                  setSaving(false);
                }
              }}
              className="rounded-md bg-violet-600 p-1.5 text-white hover:bg-violet-500 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 group">
      <span className="text-neutral-500 mt-0.5">
        <MapPin className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-neutral-500">Address</dt>
        <dd className="text-neutral-100 break-words">{address || "Not provided"}</dd>
      </div>
      <button
        onClick={() => {
          setValue(address || "");
          setEditing(true);
        }}
        className="text-neutral-600 hover:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity"
        title={address ? "Edit address" : "Add address"}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function WalletRow({ address }: { address: string | null }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-start gap-3">
      <span className="text-neutral-500 mt-0.5">
        <Wallet className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-neutral-500">Stellar wallet address</dt>
        {address ? (
          <div className="flex items-center gap-2">
            <dd className="text-neutral-100 font-mono text-xs break-all">{address}</dd>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(address);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  // clipboard access can be denied — non-critical
                }
              }}
              className="shrink-0 text-neutral-500 hover:text-violet-400"
              title="Copy address"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        ) : (
          <dd className="text-neutral-500 text-sm">Provisioning…</dd>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-neutral-500 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs text-neutral-500">{label}</dt>
        <dd className="text-neutral-100 break-words">{value}</dd>
      </div>
    </div>
  );
}
