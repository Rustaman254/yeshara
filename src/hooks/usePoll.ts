"use client";

import { useEffect, useRef } from "react";

// Calls `fn` immediately, then every `intervalMs` (default 3s), so a
// dashboard/marketplace page stays live without a manual refresh. Skips a
// tick if the previous call hasn't finished yet — a slow request (or a
// dropped connection) never piles up concurrent calls on top of each
// other. Cleans up on unmount or when `enabled` goes false.
export function usePoll(fn: () => void | Promise<void>, intervalMs = 3000, enabled = true) {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });
  const runningRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const tick = async () => {
      if (runningRef.current) return;
      runningRef.current = true;
      try {
        await fnRef.current();
      } finally {
        runningRef.current = false;
      }
    };

    tick();
    const id = setInterval(() => {
      if (!cancelled) tick();
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs, enabled]);
}
