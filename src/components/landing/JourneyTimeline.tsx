"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface JourneyStep {
  title: string;
  description: string;
  status: string;
  statusTone?: "accent" | "muted";
  detail?: {
    body: string;
    note: string;
    noteBody: string;
    checks: string[];
  };
}

export function JourneyTimeline({ title, lede, steps }: { title: string; lede: string; steps: JourneyStep[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  const allOpen = expanded.size === steps.length;

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function toggleAll() {
    setExpanded(allOpen ? new Set() : new Set(steps.map((_, i) => i)));
  }

  return (
    <div className="mt-16">
      <h3 className="text-lg font-bold text-ink-fg">{title}</h3>
      <p className="mt-2 max-w-xl text-sm text-ink-muted">{lede}</p>

      <div className="yz-card mt-6 divide-y divide-card-border overflow-hidden">
        {steps.map((step, i) => {
          const open = expanded.has(i);
          return (
            <div key={step.title}>
              <button
                type="button"
                onClick={() => toggle(i)}
                className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-card-hover"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-dim text-[0.6875rem] font-semibold text-accent">
                  {i + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-ink-fg">{step.title}</span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{step.description}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={`hidden text-right text-[0.625rem] font-semibold uppercase tracking-wide sm:block ${
                      step.statusTone === "accent" ? "text-accent" : "text-ink-faint"
                    }`}
                  >
                    {step.status}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`} />
                </span>
              </button>

              {open && step.detail && (
                <div className="grid gap-6 border-t border-card-border bg-ink-2 px-5 py-5 sm:grid-cols-[1fr_220px]">
                  <p className="text-xs leading-relaxed text-ink-muted">
                    {step.detail.body}
                    <ul className="mt-3 space-y-1.5">
                      {step.detail.checks.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-accent">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                          <span className="text-ink-muted">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </p>
                  <div>
                    <p className="yz-eyebrow !mb-1 text-[0.625rem]">{step.detail.note}</p>
                    <p className="text-xs text-ink-muted">{step.detail.noteBody}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex items-center justify-between bg-ink-2 px-5 py-3 text-xs text-ink-faint">
          <span>Total stages: {steps.length}</span>
          <button type="button" onClick={toggleAll} className="font-medium text-accent hover:text-accent-strong">
            {allOpen ? "Collapse all stages" : "Expand all stages"}
          </button>
        </div>
      </div>
    </div>
  );
}
