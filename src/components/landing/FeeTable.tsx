import { SectionShell, Script } from "./primitives";

const FEES = [
  { fee: "Brokerage fee", rate: "1.5%", when: "Charged on your order value, deducted before tokens mint." },
  { fee: "Primary sale fee", rate: "2%", when: "Percentage of gross raise, charged to the asset owner at close." },
  { fee: "Trustee fee", rate: "0.4%/yr", when: "Charged on net asset value, paid quarterly, disclosed per offering." },
  { fee: "Secondary market fee", rate: "1%", when: "Charged on trade value, split evenly across buyer and seller." },
  { fee: "Redemption / exit fee", rate: "0%", when: "There is no charge to sell your tokens on the marketplace." },
];

export function FeeTable() {
  return (
    <SectionShell
      id="fees"
      eyebrowStep="05"
      eyebrowLabel="Pricing"
      heading={
        <>
          Every fee, <Script>on one page.</Script>
        </>
      }
      lede="Most platforms in this category do not publish fees. Below is every cost we take, including the one that's zero."
    >
      <div className="yz-card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-amber-dim bg-amber-soft-bg px-5 py-3 text-[0.6875rem] uppercase tracking-wide text-amber sm:grid-cols-[minmax(160px,1fr)_100px_1fr]">
          <span>Fee</span>
          <span>Rate</span>
          <span className="hidden sm:block">When it applies</span>
        </div>
        {FEES.map((f) => (
          <div
            key={f.fee}
            className="grid grid-cols-[1fr_auto] gap-4 border-b border-card-border px-5 py-4 last:border-0 sm:grid-cols-[minmax(160px,1fr)_100px_1fr]"
          >
            <span className="text-sm font-semibold text-ink-fg">{f.fee}</span>
            <span className={`text-sm font-semibold ${f.rate === "0%" ? "text-accent" : "text-amber"}`}>{f.rate}</span>
            <span className="col-span-2 text-xs text-ink-muted sm:col-span-1">{f.when}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 max-w-2xl text-xs text-ink-faint">
        Fees shown are current headline rates and can change per offering — the exact schedule for each asset is
        disclosed on its listing page before you commit funds.
      </p>
    </SectionShell>
  );
}
