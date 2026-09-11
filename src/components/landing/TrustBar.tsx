const ITEMS = [
  { label: "CMA regulated", desc: "Licensed capital markets intermediary" },
  { label: "KRA PIN verified", desc: "Every investor is KYC'd before funding" },
  { label: "1,000+ investors", desc: "Trusted across our first offerings" },
  { label: "Escrow-held funds", desc: "Never touch Yeshara's operating account" },
];

export function TrustBar() {
  return (
    <div className="dark border-y border-card-border bg-ink py-4">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-3 px-6 text-xs">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="font-semibold text-accent">{item.label}</span>
            <span className="text-ink-faint">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
