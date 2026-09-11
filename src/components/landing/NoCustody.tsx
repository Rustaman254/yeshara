import { SectionShell, Accent } from "./primitives";

const CARDS = [
  { n: "01", title: "You custody the token", body: "Yeshara has no admin key over your wallet or the ability to move your tokens without your signature." },
  { n: "02", title: "Trustee holds the title", body: "Registered against the SPV, not us. Yeshara operates the marketplace and the registrar — it never sits in the ownership chain." },
  { n: "03", title: "Registrar records you", body: "The register of members is what makes your token a real claim, not a receipt. It's independently maintained." },
  { n: "04", title: "Escrow bank holds funds", body: "Money never lands in a Yeshara operating account before it clears to the SPV, verified by the escrow bank." },
];

export function NoCustody() {
  return (
    <SectionShell
      tone="ink-2"
      eyebrowStep="04"
      eyebrowLabel="Custody model"
      heading={
        <>
          Yeshara does not hold your asset, and does not hold <Accent>your money.</Accent>
        </>
      }
      lede="This is the structure every institutional investor checks first, and few investors think to check at all. Title and investor funds sit separate from the platform that operates the marketplace."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <div key={c.n} className="yz-card p-5">
            <p className="text-xs font-semibold text-accent">{c.n}</p>
            <p className="mt-2 text-sm font-semibold text-ink-fg">{c.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="yz-card mt-5 p-6 sm:p-8">
        <p className="yz-eyebrow">Straight answer</p>
        <p className="mt-3 text-base font-bold text-ink-fg">What happens to my investment if Yeshara stops operating?</p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Your claim does not depend on Yeshara existing. The title is registered to the trustee, not to us. The
          register of members is a live on-chain record, so it can be reconciled independently of our systems.
          Yeshara operates the platform and the marketplace, the ownership record and the asset itself stay put. That
          separation is the reason this structure is built this way.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-card-border pt-4 text-[0.6875rem] text-ink-faint">
          <span>Updated 2026 &middot; Reviewed by counsel</span>
          <a href="#faq" className="font-medium text-amber hover:text-accent-strong">
            Read the full answer
          </a>
        </div>
      </div>
    </SectionShell>
  );
}
