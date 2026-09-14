"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as api from "@/lib/api";
import { ArrowDown, Smartphone, Loader2, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

type Step = "amount" | "checkout" | "processing" | "success" | "failed";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;

// normalizePhone accepts common Kenyan phone formats (07.., 01.., +254.., 254..)
// and returns the international format Mamlaka's API expects, or null if it
// doesn't look like a valid number.
function normalizePhone(raw: string): string | null {
  let p = raw.trim().replace(/[\s-]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0") && p.length === 10) p = "254" + p.slice(1);
  if (/^[71]\d{8}$/.test(p)) p = "254" + p;
  return /^254[71]\d{8}$/.test(p) ? p : null;
}

export function InvestSwapPanel({
  offering,
  availableUnits,
  kesPerUnit,
  onSettled,
}: {
  offering: api.Offering;
  availableUnits?: number;
  kesPerUnit?: number;
  onSettled: () => void;
}) {
  const [step, setStep] = useState<Step>("amount");
  const [kesInput, setKesInput] = useState("");
  const [provider, setProvider] = useState<api.PaymentProvider>("mpesa");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [investment, setInvestment] = useState<api.Investment | null>(null);
  const [kesAmount, setKesAmount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const minKes = offering.minInvestmentUnits && kesPerUnit ? offering.minInvestmentUnits * kesPerUnit : undefined;
  const maxKes = availableUnits != null && kesPerUnit ? availableUnits * kesPerUnit : undefined;

  const kesAmountParsed = Number(kesInput) || 0;
  const units = kesPerUnit ? kesAmountParsed / kesPerUnit : 0;

  const soldOut = availableUnits != null && availableUnits <= 0;

  // maxKes === 0 (sold out) must still be checked — `maxKes &&` alone would
  // treat 0 as falsy and silently skip this validation, letting a would-be
  // buyer type an amount and reach checkout for units that don't exist.
  const amountError = useMemo(() => {
    if (!kesPerUnit) return "KES checkout isn't available for this offering's currency yet.";
    if (soldOut) return "Sold out — no units left to buy.";
    if (!kesInput) return null;
    if (kesAmountParsed <= 0) return "Enter an amount";
    if (minKes && kesAmountParsed < minKes) return `Minimum purchase is ${Math.ceil(minKes).toLocaleString()} KES`;
    if (maxKes != null && kesAmountParsed > maxKes) return `Only ${Math.floor(maxKes).toLocaleString()} KES worth of units left`;
    return null;
  }, [kesPerUnit, soldOut, kesInput, kesAmountParsed, minKes, maxKes]);

  const canContinue = !!kesPerUnit && kesAmountParsed > 0 && !amountError;

  const startPolling = (id: string) => {
    const startedAt = Date.now();
    pollRef.current = setInterval(async () => {
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        if (pollRef.current) clearInterval(pollRef.current);
        return;
      }
      try {
        const { investment: updated } = await api.getInvestmentStatus(id);
        setInvestment(updated);
        if (updated.status === "completed") {
          if (pollRef.current) clearInterval(pollRef.current);
          setStep("success");
          onSettled();
        } else if (updated.status === "failed" || updated.status === "cancelled") {
          if (pollRef.current) clearInterval(pollRef.current);
          setStep("failed");
        }
      } catch {
        // transient — keep polling
      }
    }, POLL_INTERVAL_MS);
  };

  const submit = async () => {
    const normalized = normalizePhone(phone);
    if (!normalized) {
      setError("Enter a valid Safaricom/Airtel number, e.g. 0712345678");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.investMobileMoney(offering.offeringId, units, provider, normalized);
      setInvestment(res.investment);
      setKesAmount(res.kesAmount);
      setStep("processing");
      startPolling(res.investment.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start payment");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep("amount");
    setInvestment(null);
    setError(null);
  };

  if (step === "processing") {
    return (
      <div className="yz-card p-8 text-center">
        <Loader2 className="h-8 w-8 text-accent animate-spin mx-auto mb-4" />
        <p className="font-semibold text-ink-fg">Check your phone</p>
        <p className="mt-1 text-sm text-ink-muted">
          Approve the {provider === "mpesa" ? "M-Pesa" : "Airtel Money"} prompt for{" "}
          <span className="text-ink-fg font-medium">{kesAmount.toLocaleString()} KES</span> to complete your
          purchase.
        </p>
        <p className="mt-3 text-xs text-ink-faint">This can take up to a minute — this page updates automatically.</p>
      </div>
    );
  }

  if (step === "success" && investment) {
    return (
      <div className="rounded-2xl border border-accent-dim bg-accent-soft-bg p-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-4" />
        <p className="font-semibold text-accent">Purchase complete</p>
        <p className="mt-1 text-sm text-ink-muted">
          {investment.units.toLocaleString()} units of {offering.symbol} minted to your wallet.
        </p>
        {investment.providerReference && (
          <p className="mt-2 text-xs text-ink-faint">
            Receipt: <code className="bg-ink/60 px-1.5 py-0.5 rounded text-ink-muted">{investment.providerReference}</code>
          </p>
        )}
        <button onClick={reset} className="mt-4 text-xs text-accent hover:text-accent-strong">
          Buy more
        </button>
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div className="rounded-2xl border border-danger/40 bg-danger/10 p-8 text-center">
        <XCircle className="h-8 w-8 text-danger mx-auto mb-4" />
        <p className="font-semibold text-danger">Payment failed</p>
        <p className="mt-1 text-sm text-ink-muted">{investment?.failureReason || "The payment wasn't completed."}</p>
        <button onClick={reset} className="yz-btn-primary mt-4">
          Try again
        </button>
      </div>
    );
  }

  if (step === "checkout") {
    return (
      <div className="yz-card p-6">
        <button onClick={() => setStep("amount")} className="text-xs text-ink-faint hover:text-ink-fg mb-4">
          ← Back
        </button>
        <p className="text-sm text-ink-muted mb-3">
          Paying <span className="text-ink-fg font-semibold">{kesAmountParsed.toLocaleString()} KES</span> for{" "}
          <span className="text-ink-fg font-semibold">{units.toFixed(2)}</span> units
        </p>

        <p className="text-xs font-medium text-ink-faint mb-2">Pay with</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(["mpesa", "airtel"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors ${
                provider === p ? "border-accent bg-accent-soft-bg text-accent" : "border-card-border-strong text-ink-muted hover:border-accent-dim"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              {p === "mpesa" ? "M-Pesa" : "Airtel Money"}
            </button>
          ))}
        </div>

        <label className="block text-xs font-medium text-ink-faint mb-1.5">Phone number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0712345678"
          className="yz-input mb-4"
        />

        {error && <p className="text-sm text-danger mb-3">{error}</p>}

        <button onClick={submit} disabled={submitting} className="yz-btn-primary w-full disabled:opacity-50">
          {submitting ? "Sending request…" : `Pay ${kesAmountParsed.toLocaleString()} KES`}
        </button>
      </div>
    );
  }

  return (
    <div className="yz-card p-6">
      <div className="rounded-lg border border-card-border bg-ink-2 p-4">
        <div className="flex items-center justify-between text-xs text-ink-faint mb-1">
          <span>You pay</span>
          <span>KES</span>
        </div>
        <input
          type="number"
          min={0}
          value={kesInput}
          onChange={(e) => setKesInput(e.target.value)}
          placeholder="0"
          className="w-full bg-transparent text-2xl font-semibold text-ink-fg outline-none placeholder:text-ink-faint"
        />
        {minKes != null && (
          <p className="mt-1 text-[0.7rem] text-ink-faint">Minimum purchase: {Math.ceil(minKes).toLocaleString()} KES</p>
        )}
      </div>

      <div className="flex justify-center -my-2 relative z-10">
        <div className="rounded-full border-4 border-card bg-card-border-strong p-1.5">
          <ArrowDown className="h-3.5 w-3.5 text-ink-muted" />
        </div>
      </div>

      <div className="rounded-lg border border-card-border bg-ink-2 p-4">
        <div className="flex items-center justify-between text-xs text-ink-faint mb-1">
          <span>You receive</span>
          <span>{offering.symbol || "units"}</span>
        </div>
        <p className="text-2xl font-semibold text-ink-fg">{kesInput ? units.toFixed(4) : "0"}</p>
        <p className="mt-1 text-[0.7rem] text-ink-faint">
          Fractional ownership in {offering.title} ({offering.assetType.replace(/_/g, " ")})
        </p>
      </div>

      {amountError && (soldOut || kesInput) && <p className="mt-3 text-sm text-danger">{amountError}</p>}

      <button onClick={() => setStep("checkout")} disabled={!canContinue} className="yz-btn-primary mt-4 w-full disabled:opacity-40">
        Continue
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.7rem] text-ink-faint">
        <ShieldCheck className="h-3 w-3" /> Units are minted to your wallet the moment payment is confirmed.
      </p>
    </div>
  );
}
