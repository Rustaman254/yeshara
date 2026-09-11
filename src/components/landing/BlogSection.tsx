import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Script } from "./primitives";

const FEATURED = {
  tag: "Regulation",
  date: "3 Feb 2026",
  title: "What Kenya's CMP Regulations 2026 change for tokenized property",
  excerpt: "A working read of the licensing perimeter for asset-backed tokens, and where Yeshara sits inside it, well before the deadline.",
};

const POSTS = [
  { tag: "Markets", date: "17 Jan 2026", title: "Liquidity on a 90-day-old marketplace: what the data shows" },
  { tag: "Structure", date: "6 Jan 2026", title: "Why the trustee holds the title, not us" },
  { tag: "Investing", date: "22 Dec 2025", title: "A minimum order of KES 1,000, explained by the unit economics" },
];

export function BlogSection() {
  return (
    <section className="dark bg-ink py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-4 flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          09 <span className="text-ink-faint">&middot;</span> From the desk
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-2xl text-3xl font-bold leading-[1.15] tracking-tight text-ink-fg sm:text-4xl">
            Writing on property, tokenization <Script>and Kenyan regulation.</Script>
          </h2>
          <Link href="/blog" className="yz-btn-outline">
            View all posts
          </Link>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Link href="/blog/cmp-regulations-2026" className="yz-card group overflow-hidden">
            <div className="flex h-48 items-end bg-accent-soft-bg p-6">
              <svg viewBox="0 0 200 60" className="h-16 w-full text-accent opacity-70">
                <polyline
                  points="0,45 30,35 55,42 80,20 110,28 140,10 170,18 200,8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="p-6">
              <span className="yz-badge-teal">{FEATURED.tag}</span>
              <p className="mt-3 text-lg font-bold leading-snug text-ink-fg">{FEATURED.title}</p>
              <p className="mt-2 text-sm text-ink-muted">{FEATURED.excerpt}</p>
              <div className="mt-4 flex items-center justify-between text-[0.6875rem] text-ink-faint">
                <span>{FEATURED.date}</span>
                <span className="flex items-center gap-1 font-medium text-accent group-hover:text-accent-strong">
                  Read <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>

          <div className="divide-y divide-card-border">
            {POSTS.map((p) => (
              <Link key={p.title} href="/blog" className="block py-5 first:pt-0">
                <span className="text-[0.625rem] font-semibold uppercase tracking-wide text-accent">{p.tag}</span>
                <span className="ml-2 text-[0.625rem] text-ink-faint">{p.date}</span>
                <p className="mt-1.5 text-sm font-semibold text-ink-fg hover:text-accent">{p.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
