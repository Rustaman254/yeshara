"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { SectionShell, Script } from "./primitives";

const PLACEHOLDER: Pick<api.Offering, "offeringId" | "title" | "location" | "pricePerUnit" | "currency" | "fundedPct">[] = [
  { offeringId: "westlands-block-a", title: "Westlands office block, Block A", location: "Westlands, Nairobi", pricePerUnit: 1000, currency: "KES", fundedPct: 62 },
  { offeringId: "karen-villas", title: "Karen residential villas", location: "Karen, Nairobi", pricePerUnit: 2500, currency: "KES", fundedPct: 38 },
  { offeringId: "thika-warehouse", title: "Thika Road warehouse", location: "Thika Road, Nairobi", pricePerUnit: 1000, currency: "KES", fundedPct: 81 },
];

export function MarketplacePreview() {
  const [offerings, setOfferings] = useState<api.Offering[] | null>(null);

  useEffect(() => {
    api
      .listOfferings()
      .then((res) => setOfferings(res.offerings))
      .catch(() => setOfferings([]));
  }, []);

  const live = (offerings ?? []).filter((o) => o.status === "live").slice(0, 5);
  const showPlaceholders = live.length === 0;

  return (
    <SectionShell
      eyebrowStep="06"
      eyebrowLabel="The marketplace"
      heading={
        <>
          Where the assets <Script>will appear.</Script>
        </>
      }
      lede="Primary raises land here, next to secondary trades. Same layout, same valuation, updated live."
    >
      <div className="yz-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-amber-dim bg-amber-soft-bg px-5 py-2.5 text-[0.6875rem] text-amber">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
          Browse listings by asset type, location, yield or tenor — filter and sort live on the marketplace.
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-card-border px-5 py-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="yz-badge-teal">All</span>
            <span className="text-ink-faint">Featured &middot; Opening soon</span>
          </div>
          <Link href="/marketplace" className="text-xs font-semibold text-accent hover:text-accent-strong">
            View marketplace
          </Link>
        </div>

        <div className="grid gap-px bg-card-border sm:grid-cols-3">
          {showPlaceholders
            ? PLACEHOLDER.map((o) => <PreviewCard key={o.offeringId} offering={o} placeholder />)
            : live.map((o) => <PreviewCard key={o.offeringId} offering={o} />)}
          {(showPlaceholders ? PLACEHOLDER.length : live.length) < 6 && (
            <Link
              href="/marketplace"
              className="col-span-full flex min-h-[120px] flex-col items-center justify-center gap-2 bg-card p-5 text-center text-xs text-ink-faint hover:bg-card-hover"
            >
              <span className="text-2xl text-ink-faint">+</span>
              More offerings on the marketplace
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-card-border px-5 py-3 text-[0.6875rem] text-ink-faint">
          <span>{showPlaceholders ? "Illustrative listings — live offerings update automatically" : `${live.length} live offering${live.length === 1 ? "" : "s"}`}</span>
          <Link href="/marketplace" className="font-medium text-amber hover:text-accent-strong">
            See all live listings
          </Link>
        </div>
      </div>
    </SectionShell>
  );
}

function PreviewCard({
  offering,
  placeholder,
}: {
  offering: Pick<api.Offering, "offeringId" | "title" | "location" | "pricePerUnit" | "currency" | "fundedPct">;
  placeholder?: boolean;
}) {
  const funded = offering.fundedPct != null ? Math.min(100, Math.round(offering.fundedPct)) : 0;
  return (
    <div className="bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.625rem] uppercase tracking-wide text-ink-faint">{offering.location}</p>
        <span className="yz-badge-live">{placeholder ? "Illustrative" : "Live"}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-ink-fg">{offering.title}</p>
      <p className="mt-3 text-[0.625rem] uppercase tracking-wide text-ink-faint">Min. order</p>
      <p className="text-sm font-semibold text-ink-fg">
        {offering.pricePerUnit.toLocaleString()} {offering.currency}
      </p>

      <div className="mt-3 flex items-center justify-between text-[0.625rem] text-ink-faint">
        <span>Funded</span>
        <span className="font-semibold text-accent">{funded}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-card-border-strong">
        <div className="h-full rounded-full bg-accent" style={{ width: `${funded}%` }} />
      </div>

      <Link
        href={`/marketplace/${offering.offeringId}`}
        className="mt-4 block rounded-lg border border-card-border-strong py-1.5 text-center text-xs font-medium text-ink-fg hover:border-accent-dim"
      >
        View listing
      </Link>
    </div>
  );
}
