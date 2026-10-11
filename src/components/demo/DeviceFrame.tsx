import type { ReactNode } from 'react';
import { DEMO_ASPECT } from '@/lib/demo';

/**
 * Device chrome around demo media. Phone screenshots sit in a phone frame,
 * browser screenshots in a browser frame; `none` is a plain rounded frame.
 * Aspect ratios are reserved up front so media never shifts layout.
 */
export function DeviceFrame({
  kind,
  children,
}: {
  kind: 'phone' | 'browser' | 'none';
  children: ReactNode;
}) {
  if (kind === 'phone') {
    // No fake notch: every phone screenshot is a full-device capture
    // with its own status bar, so extra chrome would stack up and push
    // the content down with a dead gap.
    return (
      <div className="mx-auto w-full max-w-[270px] rounded-[2rem] border bg-stone-950 p-2 shadow-lg dark:bg-black">
        <div
          className="overflow-hidden rounded-[1.4rem] bg-[var(--dg-node-bg)]"
          style={{ aspectRatio: DEMO_ASPECT.phone }}
        >
          {children}
        </div>
      </div>
    );
  }
  if (kind === 'browser') {
    return (
      <div className="overflow-hidden rounded-xl border bg-[var(--dg-node-bg)] shadow-md">
        <div className="flex items-center gap-1.5 border-b px-3 py-2" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300 dark:bg-stone-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300 dark:bg-stone-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300 dark:bg-stone-600" />
          <span className="ml-2 h-5 flex-1 rounded-md bg-stone-100 dark:bg-stone-800" />
        </div>
        <div className="overflow-hidden" style={{ aspectRatio: DEMO_ASPECT.browser }}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border bg-[var(--dg-node-bg)] shadow-md">
      {children}
    </div>
  );
}
