import { FileText, Users, ShieldQuestion, Check, X } from "lucide-react";
import { SectionShell, Accent } from "./primitives";

const CARDS = [
  {
    icon: FileText,
    title: "The title deed",
    body: "Held by an independent trustee, not by Yeshara. It never moves out of the SPV that owns the property.",
    meta: "HELD BY: Corporate trustee",
  },
  {
    icon: Users,
    title: "The register of members",
    body: "The list of everyone who holds a share of that SPV, kept live on-chain. Your token is your entry on that list.",
    meta: "MAINTAINED BY: Registrar, updated on-chain",
  },
  {
    icon: ShieldQuestion,
    title: "Your token",
    body: "One entry on that register, expressed as a transferable digital asset. Sell it, and the register updates instantly.",
    meta: "HELD BY: You",
  },
];

const DOES = [
  "Entitles you to your share of net rental distributions",
  "Entitles you to your share of the sale proceeds if the asset sells",
  "Can be traded peer-to-peer or redeemed on our marketplace",
  "Is backed 1:1 against your registered share of the asset",
];

const DOES_NOT = [
  "It doesn't give you a claim on Yeshara itself, only the asset",
  "It isn't a loan you can call in early, it's ownership",
  "It isn't FX or crypto exposure, it's priced in KES on the asset",
  "It isn't guaranteed or principal-protected by anyone",
];

export function TokenExplainer() {
  return (
    <SectionShell
      id="how-it-works"
      eyebrowStep="01"
      eyebrowLabel="How it works"
      heading={
        <>
          A token is not a coin. It is a <Accent>recorded share</Accent> of a real asset.
        </>
      }
      lede="This is the question everybody asks first, and almost no tokenization platform answers plainly. Here is how the pieces fit, and what you own."
    >
      <div className="grid gap-5 sm:grid-cols-3">
        {CARDS.map((c) => (
          <div key={c.title} className="yz-card p-5">
            <c.icon className="h-4 w-4 text-accent" />
            <p className="mt-3 text-sm font-semibold text-ink-fg">{c.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">{c.body}</p>
            <p className="mt-4 border-t border-card-border pt-3 text-[0.625rem] uppercase tracking-wide text-ink-faint">{c.meta}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="yz-card p-6">
          <p className="text-sm font-semibold text-accent">What your token does</p>
          <ul className="mt-4 space-y-2.5 text-xs text-ink-muted">
            {DOES.map((d) => (
              <li key={d} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="yz-card p-6">
          <p className="text-sm font-semibold text-danger">What it doesn&apos;t do</p>
          <ul className="mt-4 space-y-2.5 text-xs text-ink-muted">
            {DOES_NOT.map((d) => (
              <li key={d} className="flex items-start gap-2">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
