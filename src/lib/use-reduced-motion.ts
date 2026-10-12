'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Correct prefers-reduced-motion hook (same boolean API as motion's).
 *
 * motion v14 queries `matchMedia("(prefers-reduced-motion)")` — no `: reduce`
 * value, so it never matches — and never re-renders on change. Every player
 * on the site reads motion through this hook instead, so reduced-motion
 * users get stepped controls everywhere with one fix.
 *
 * useSyncExternalStore (not useState) is deliberate: the server snapshot is
 * false, the client snapshot reads the real media query, and React
 * reconciles the two without a hydration error.
 */
function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useReducedMotion(): boolean {
  const reduce = useSyncExternalStore(subscribe, getSnapshot, () => false);
  // Re-read once after mount: the first snapshot can race media-query
  // emulation (or late listeners) settling, leaving a stale value with
  // no change event to correct it. One extra render converges for good.
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setTick((n) => n + 1), 0);
    return () => window.clearTimeout(t);
  }, []);
  return reduce;
}
