"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionShell, Script } from "./primitives";

const FAQS = [
  { q: "Is this legal?", a: "Yes. Yeshara operates as a licensed capital markets intermediary under the CMA, and every offering is structured through its own SPV with independent legal counsel." },
  { q: "What happens if the property is sold?", a: "Sale proceeds are distributed to token holders pro-rata against their registered share, net of the fees disclosed on that offering's listing." },
  { q: "What happens if Yeshara shuts down?", a: "Title stays with the independent trustee and the register of members is reconcilable independently of Yeshara's systems, so your claim does not depend on us continuing to operate." },
  { q: "How quickly can I get my money out?", a: "List on the secondary marketplace anytime — settlement typically clears same-day once a buyer takes your order. There is no lock-up beyond what's disclosed per offering." },
  { q: "Can I lose everything?", a: "Yes — this is real asset ownership, not a savings product. Values move with the underlying property and rental market, and nothing here is principal-protected." },
  { q: "Who sets the price?", a: "Primary issuance is priced at the independent valuer's appraisal. Secondary trades are priced by whatever buyers and sellers agree on the marketplace." },
  { q: "Do I get a title deed?", a: "No — the trustee holds the title deed. You hold a registered, tradeable share of the SPV that owns it, recorded on the register of members." },
  { q: "What is the minimum, really?", a: "KES 1,000 for most offerings — one token at par. Some raises set a higher minimum order, always shown on the listing before you commit." },
  { q: "What blockchain runs this?", a: "Stellar. Settlement is fast and fees are near-zero, and every token issuance is verifiable on a public ledger." },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SectionShell
      id="faq"
      eyebrowStep="07"
      eyebrowLabel="FAQ"
      heading={
        <>
          The questions you were <Script>going to ask anyway.</Script>
        </>
      }
      lede="Answered so we could answer them in as much detail, including where the answer to your question is."
    >
      <div className="divide-y divide-card-border border-t border-card-border">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-sm font-medium text-ink-fg">{f.q}</span>
                <Plus className={`h-4 w-4 shrink-0 text-accent transition-transform ${isOpen ? "rotate-45" : ""}`} />
              </button>
              {isOpen && <p className="pb-4 max-w-2xl text-sm leading-relaxed text-ink-muted">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
