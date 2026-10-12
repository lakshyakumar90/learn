'use client';

import type { ReactNode } from 'react';
import { Callout } from 'fumadocs-ui/components/callout';

export type ConceptVariant = 'real-life' | 'mistake' | 'under-hood' | 'browser-node';

const VARIANT: Record<ConceptVariant, { title: string; type: 'info' | 'warn' | 'error' }> = {
  'real-life': { title: 'Real life', type: 'info' },
  mistake: { title: 'Common mistake', type: 'warn' },
  'under-hood': { title: 'Under the hood', type: 'info' },
  'browser-node': { title: 'Browser vs Node', type: 'warn' },
};

/**
 * Concept callouts for tutorial pages. Thin wrappers around the shared
 * Callout so future topics reuse the same four variants. The under-hood
 * variant collapses its deeper dive behind a native disclosure.
 */
export function ConceptCard({
  variant,
  title,
  children,
}: {
  variant: ConceptVariant;
  title?: string;
  children: ReactNode;
}) {
  const meta = VARIANT[variant];
  if (variant === 'under-hood') {
    return (
      <Callout type={meta.type} title={title ?? meta.title}>
        <details>
          <summary className="cursor-pointer text-sm underline underline-offset-2">
            Deeper dive (optional)
          </summary>
          <div className="mt-2">{children}</div>
        </details>
      </Callout>
    );
  }
  return (
    <Callout type={meta.type} title={title ?? meta.title}>
      {children}
    </Callout>
  );
}
