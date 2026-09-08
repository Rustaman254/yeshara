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
    <div className="min-h-screen flex items-center justify-center bg-[#0b0912] px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
            Y
          </div>
          <span className="font-semibold tracking-tight text-neutral-100">Yeshara</span>
        </Link>

        <div className="rounded-xl border border-white/10 bg-[#141019] p-8">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-100 mb-1">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-500 mb-6">{subtitle}</p>}
          {children}
        </div>

        {footer && <div className="mt-4 text-center text-sm text-neutral-500">{footer}</div>}
      </div>
    </div>
  );
}

export const authInput =
  "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-violet-500 placeholder:text-neutral-600";
