import { ReactNode } from "react";

/** The cursive "highlighter" emphasis used inside a handful of headlines. */
export function Script({ children }: { children: ReactNode }) {
  return <span className="yz-script text-accent">{children}</span>;
}

/** Plain (non-cursive) teal emphasis inside a headline. */
export function Accent({ children }: { children: ReactNode }) {
  return <span className="text-accent">{children}</span>;
}

/** The small-caps "01 · SECTION NAME" label every major section opens with. */
export function Eyebrow({ step, label }: { step: string; label: string }) {
  return (
    <div className="yz-eyebrow mb-4">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {step}
      <span className="text-ink-faint">&middot;</span>
      {label}
    </div>
  );
}

export function SectionShell({
  id,
  eyebrowStep,
  eyebrowLabel,
  heading,
  lede,
  tone = "ink",
  children,
}: {
  id?: string;
  eyebrowStep: string;
  eyebrowLabel: string;
  heading: ReactNode;
  lede?: ReactNode;
  tone?: "ink" | "ink-2";
  children: ReactNode;
}) {
  return (
    <section id={id} className={`${tone === "ink-2" ? "bg-ink-2" : "bg-ink"} py-20 sm:py-28`}>
      <div className="mx-auto max-w-6xl px-6">
        <Eyebrow step={eyebrowStep} label={eyebrowLabel} />
        <h2 className="max-w-2xl text-3xl font-bold leading-[1.15] tracking-tight text-ink-fg sm:text-4xl">
          {heading}
        </h2>
        {lede && <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted">{lede}</p>}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
