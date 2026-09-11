"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { DashboardShell } from "@/components/DashboardShell";
import { MapPin, TrendingUp, SlidersHorizontal, Bookmark } from "lucide-react";

type SortKey = "featured" | "price_asc" | "price_desc" | "yield_desc";
type Risk = "low" | "medium" | "high";

const RISK_LEVELS: Risk[] = ["low", "medium", "high"];

export default function MarketplacePage() {
  const [offerings, setOfferings] = useState<api.Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assetType, setAssetType] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [showFilter, setShowFilter] = useState(false);
  const [riskFilter, setRiskFilter] = useState<Set<Risk>>(new Set());
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .listOfferings()
      .then((res) => setOfferings(res.offerings))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load offerings"))
      .finally(() => setLoading(false));

    try {
      const raw = localStorage.getItem("yeshara_favorites");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only localStorage read, mirrors the fetch-on-mount pattern used elsewhere in this file
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {
      // ignore — favorites are a local convenience only
    }
  }, []);

  const toggleFavorite = (offeringId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(offeringId)) next.delete(offeringId);
      else next.add(offeringId);
      try {
        localStorage.setItem("yeshara_favorites", JSON.stringify([...next]));
      } catch {
        // best-effort only
      }
      return next;
    });
  };

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const o of offerings) {
      if (!seen.has(o.assetType)) seen.set(o.assetType, o.assetType.replace(/_/g, " "));
    }
    return [{ key: "all", label: "All" }, ...[...seen.entries()].map(([key, label]) => ({ key, label }))];
  }, [offerings]);

  const visible = useMemo(() => {
    let list = offerings;
    if (assetType !== "all") list = list.filter((o) => o.assetType === assetType);
    if (riskFilter.size > 0) list = list.filter((o) => o.riskLevel && riskFilter.has(o.riskLevel as Risk));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) => o.title.toLowerCase().includes(q) || o.location.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sort === "price_asc") sorted.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    else if (sort === "price_desc") sorted.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    else if (sort === "yield_desc") sorted.sort((a, b) => (b.expectedYieldPct ?? 0) - (a.expectedYieldPct ?? 0));
    return sorted;
  }, [offerings, assetType, riskFilter, search, sort]);

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-fg">Asset Marketplace</h1>
          <p className="mt-1 text-ink-muted text-sm">Invest in tokenized real-world assets</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by title or location…"
            className="sm:hidden w-40 yz-input py-2"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="yz-input w-auto py-2 text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="yield_desc">Yield: High to Low</option>
          </select>
          <div className="relative">
            <button
              onClick={() => setShowFilter((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                riskFilter.size > 0 ? "border-accent text-accent" : "border-card-border-strong text-ink-muted hover:border-accent-dim"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter
              {riskFilter.size > 0 && <span className="ml-0.5 text-xs">({riskFilter.size})</span>}
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 w-44 yz-card p-3 z-30 shadow-xl">
                <p className="text-[0.65rem] uppercase tracking-wide text-ink-faint mb-2">Risk level</p>
                {RISK_LEVELS.map((r) => (
                  <label key={r} className="flex items-center gap-2 py-1 text-sm text-ink-muted capitalize">
                    <input
                      type="checkbox"
                      checked={riskFilter.has(r)}
                      onChange={() =>
                        setRiskFilter((prev) => {
                          const next = new Set(prev);
                          if (next.has(r)) next.delete(r);
                          else next.add(r);
                          return next;
                        })
                      }
                    />
                    {r}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setAssetType(c.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm capitalize transition-colors ${
              assetType === c.key ? "bg-accent text-ink font-semibold" : "border border-card-border-strong text-ink-muted hover:border-accent-dim"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger mb-6">{error}</div>
      )}

      {loading ? (
        <div className="text-ink-faint text-sm">Loading offerings…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-card-border-strong py-16 text-center text-ink-faint">
          {offerings.length === 0 ? "No offerings are live right now." : "No offerings match these filters."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((o) => (
            <OfferingCard
              key={o.id}
              offering={o}
              favorite={favorites.has(o.offeringId)}
              onToggleFavorite={() => toggleFavorite(o.offeringId)}
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

const RISK_STYLE: Record<string, string> = {
  low: "text-accent",
  medium: "text-amber",
  high: "text-danger",
};

function OfferingCard({
  offering,
  favorite,
  onToggleFavorite,
}: {
  offering: api.Offering;
  favorite: boolean;
  onToggleFavorite: () => void;
}) {
  const funded = offering.fundedPct != null ? Math.min(100, Math.round(offering.fundedPct)) : null;
  const minAmount = offering.minInvestmentUnits ? offering.minInvestmentUnits * offering.pricePerUnit : null;

  return (
    <div className="group yz-card overflow-hidden hover:border-accent-dim transition-colors">
      <div className="relative aspect-[4/3] bg-card-border">
        {offering.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={offering.imageUrl} alt={offering.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-ink-faint" />
          </div>
        )}
        <span className="absolute top-2 left-2 rounded-full bg-ink/70 backdrop-blur px-2.5 py-0.5 text-[0.625rem] font-medium capitalize text-ink-fg">
          {offering.assetType.replace(/_/g, " ")}
        </span>
        <button
          onClick={onToggleFavorite}
          className="absolute top-2 right-2 rounded-full bg-ink/70 backdrop-blur p-1.5 text-ink-muted hover:text-accent"
        >
          <Bookmark className={`h-3.5 w-3.5 ${favorite ? "fill-accent text-accent" : ""}`} />
        </button>
        {funded != null && (
          <div className="absolute bottom-0 inset-x-0 bg-ink/70 backdrop-blur px-2 py-1.5">
            <div className="flex items-center justify-between text-[0.625rem] text-ink-fg mb-1">
              <span>Funded</span>
              <span>{funded}%</span>
            </div>
            <div className="h-1 rounded-full bg-card-border-strong overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${funded}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-sm truncate text-ink-fg">{offering.title}</h3>
        {offering.location && (
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-faint">
            <MapPin className="h-3 w-3" /> {offering.location}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs">
          <div>
            <p className="text-ink-faint">Token Price</p>
            <p className="font-semibold text-ink-fg">
              {offering.pricePerUnit.toLocaleString()} {offering.currency}
            </p>
            {offering.kesPerUnit != null && offering.currency !== "KES" && (
              <p className="text-[0.625rem] text-ink-faint">≈ KES {offering.kesPerUnit.toLocaleString()}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-ink-faint">Expected Yield</p>
            <p className="font-semibold text-accent">
              {offering.expectedYieldPct != null ? `${offering.expectedYieldPct}%` : "—"}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={`font-medium capitalize ${offering.riskLevel ? RISK_STYLE[offering.riskLevel] ?? "text-ink-faint" : "text-ink-faint"}`}>
            {offering.riskLevel ? `${offering.riskLevel} risk` : "Risk n/a"}
          </span>
          <span className="text-ink-faint">
            Min. {minAmount != null ? `${minAmount.toLocaleString()} ${offering.currency}` : "—"}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link
            href={`/marketplace/${offering.offeringId}`}
            className="flex-1 rounded-lg border border-card-border-strong py-1.5 text-center text-xs font-medium text-ink-fg hover:border-accent-dim"
          >
            View details
          </Link>
          <Link
            href={`/marketplace/${offering.offeringId}`}
            className="flex-1 rounded-lg bg-accent py-1.5 text-center text-xs font-semibold text-ink hover:bg-accent-strong"
          >
            Invest Now
          </Link>
        </div>
      </div>
    </div>
  );
}
