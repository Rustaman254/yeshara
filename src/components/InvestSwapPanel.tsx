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

  const amountError = useMemo(() => {
    if (!kesPerUnit) return "KES checkout isn't available for this offering's currency yet.";
    if (!kesInput) return null;
    if (kesAmountParsed <= 0) return "Enter an amount";
    if (minKes && kesAmountParsed < minKes) return `Minimum purchase is ${Math.ceil(minKes).toLocaleString()} KES`;
    if (maxKes && kesAmountParsed > maxKes) return `Only ${Math.floor(maxKes).toLocaleString()} KES worth of units left`;
    return null;
  }, [kesPerUnit, kesInput, kesAmountParsed, minKes, maxKes]);

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
      <div className="rounded-xl border border-white/10 bg-[#141019] p-8 text-center">
        <Loader2 className="h-8 w-8 text-violet-400 animate-spin mx-auto mb-4" />
        <p className="font-semibold">Check your phone</p>
        <p className="mt-1 text-sm text-neutral-400">
          Approve the {provider === "mpesa" ? "M-Pesa" : "Airtel Money"} prompt for{" "}
          <span className="text-neutral-100 font-medium">{kesAmount.toLocaleString()} KES</span> to complete your
          purchase.
        </p>
        <p className="mt-3 text-xs text-neutral-500">This can take up to a minute — this page updates automatically.</p>
      </div>
    );
  }

  if (step === "success" && investment) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
        <p className="font-semibold text-emerald-300">Purchase complete</p>
        <p className="mt-1 text-sm text-neutral-300">
          {investment.units.toLocaleString()} units of {offering.symbol} minted to your wallet.
        </p>
        {investment.providerReference && (
          <p className="mt-2 text-xs text-neutral-500">
            Receipt: <code className="bg-black/30 px-1.5 py-0.5 rounded">{investment.providerReference}</code>
          </p>
        )}
        <button onClick={reset} className="mt-4 text-xs text-violet-400 hover:underline">
          Buy more
        </button>
      </div>
    );
  }

  if (step === "failed") {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <XCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
        <p className="font-semibold text-red-300">Payment failed</p>
        <p className="mt-1 text-sm text-neutral-400">{investment?.failureReason || "The payment wasn't completed."}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
        >
          Try again
        </button>
      </div>
    );
  }

  if (step === "checkout") {
    return (
      <div className="rounded-xl border border-white/10 bg-[#141019] p-6">
        <button onClick={() => setStep("amount")} className="text-xs text-neutral-500 hover:text-neutral-300 mb-4">
          ← Back
        </button>
        <p className="text-sm text-neutral-400 mb-3">
          Paying <span className="text-neutral-100 font-semibold">{kesAmountParsed.toLocaleString()} KES</span> for{" "}
          <span className="text-neutral-100 font-semibold">{units.toFixed(2)}</span> units
        </p>

        <p className="text-xs font-medium text-neutral-500 mb-2">Pay with</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(["mpesa", "airtel"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-colors ${
                provider === p
                  ? "border-violet-500 bg-violet-600/10 text-violet-300"
                  : "border-white/10 text-neutral-400 hover:bg-white/5"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              {p === "mpesa" ? "M-Pesa" : "Airtel Money"}
            </button>
          ))}
        </div>

        <label className="block text-xs font-medium text-neutral-500 mb-1">Phone number</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0712345678"
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-violet-500 mb-4"
        />

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full rounded-md bg-violet-600 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {submitting ? "Sending request…" : `Pay ${kesAmountParsed.toLocaleString()} KES`}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#141019] p-6">
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
          <span>You pay</span>
          <span>KES</span>
        </div>
        <input
          type="number"
          min={0}
          value={kesInput}
          onChange={(e) => setKesInput(e.target.value)}
          placeholder="0"
          className="w-full bg-transparent text-2xl font-semibold text-neutral-100 outline-none placeholder:text-neutral-600"
        />
        {minKes != null && (
          <p className="mt-1 text-[0.7rem] text-neutral-500">Minimum purchase: {Math.ceil(minKes).toLocaleString()} KES</p>
        )}
      </div>

      <div className="flex justify-center -my-2 relative z-10">
        <div className="rounded-full border-4 border-[#141019] bg-white/10 p-1.5">
          <ArrowDown className="h-3.5 w-3.5 text-neutral-400" />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
          <span>You receive</span>
          <span>{offering.symbol || "units"}</span>
        </div>
        <p className="text-2xl font-semibold text-neutral-100">{kesInput ? units.toFixed(4) : "0"}</p>
        <p className="mt-1 text-[0.7rem] text-neutral-500">
          Fractional ownership in {offering.title} ({offering.assetType.replace(/_/g, " ")})
        </p>
      </div>

      {amountError && kesInput && <p className="mt-3 text-sm text-red-400">{amountError}</p>}

      <button
        onClick={() => setStep("checkout")}
        disabled={!canContinue}
        className="mt-4 w-full rounded-md bg-violet-600 py-2.5 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-40"
      >
        Continue
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.7rem] text-neutral-600">
        <ShieldCheck className="h-3 w-3" /> Units are minted to your wallet the moment payment is confirmed.
      </p>
    </div>
  );
}
