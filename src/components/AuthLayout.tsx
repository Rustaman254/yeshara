"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-ink px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-accent-dim bg-accent-soft-bg">
            <span className="h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="font-bold tracking-tight text-ink-fg">Yeshara</span>
        </Link>

        <div className="yz-card p-8">
          <h1 className="text-xl font-bold tracking-tight text-ink-fg mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-ink-muted mb-6">{subtitle}</p>}
          {children}
        </div>

        {footer && <div className="mt-4 text-center text-sm text-ink-muted">{footer}</div>}
      </div>
    </div>
  );
}

export const authInput = "yz-input";
