'use client';

import { useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { DemoMediaItem } from '@/lib/demo';

export interface LightboxEntry {
  kind: 'image' | 'video';
  src: string;
  alt: string;
  caption: string;
}

function entryOf(item: DemoMediaItem): LightboxEntry | null {
  if (!item.src || item.type === 'youtube') return null;
  return {
    kind: item.type === 'video' ? 'video' : 'image',
    src: item.src,
    alt: item.alt,
    caption: item.caption,
  };
}

/**
 * Near-fullscreen lightbox for demo media, same look as the diagram
 * fullscreen: Radix focus trap, Escape to close, arrow-key prev/next,
 * close/prev/next buttons, captions, and a position readout.
 */
export function MediaLightbox({
  items,
  index,
  onIndex,
  open,
  onOpenChange,
}: {
  items: DemoMediaItem[];
  index: number;
  onIndex: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const entries = items.map(entryOf);
  const count = entries.filter(Boolean).length;
  const entry = entries[index] ?? null;

  const step = useCallback(
    (dir: 1 | -1) => {
      if (items.length === 0) return;
      let next = index;
      for (let i = 0; i < items.length; i += 1) {
        next = (next + dir + items.length) % items.length;
        if (entries[next]) break;
      }
      onIndex(next);
    },
    [entries, index, items.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, step]);

  const position = entries.slice(0, index + 1).filter(Boolean).length;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content
          aria-label={entry ? entry.caption : 'Media viewer'}
          className="fixed left-1/2 top-1/2 z-50 flex h-[92dvh] max-h-[920px] w-[92vw] max-w-[960px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-[var(--dg-node-bg)] text-[var(--foreground)] shadow-2xl max-md:h-dvh max-md:max-h-none max-md:w-screen max-md:rounded-none"
        >
          <div className="flex items-center gap-2 border-b px-3 py-2 sm:px-4">
            <Dialog.Title className="mr-auto min-w-0 truncate text-base font-semibold">
              {entry ? entry.caption : 'Media viewer'}
            </Dialog.Title>
            {count > 1 ? (
              <p className="shrink-0 text-xs opacity-60" aria-live="polite">
                {position} of {count}
              </p>
            ) : null}
            {count > 1 ? (
              <div className="flex items-center gap-1" role="group" aria-label="Media navigation">
                <button
                  type="button"
                  aria-label="Previous media"
                  onClick={() => step(-1)}
                  className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border text-sm transition-opacity hover:bg-stone-100 dark:hover:bg-stone-900"
                >
                  <ChevronLeft size={16} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next media"
                  onClick={() => step(1)}
                  className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border text-sm transition-opacity hover:bg-stone-100 dark:hover:bg-stone-900"
                >
                  <ChevronRight size={16} aria-hidden />
                </button>
              </div>
            ) : null}
            <Dialog.Close
              aria-label="Close"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-stone-900 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-stone-900"
            >
              <X size={18} aria-hidden />
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black/80 p-3 sm:p-4">
            {entry?.kind === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={entry.src}
                alt={entry.alt}
                className="max-h-full w-auto max-w-full rounded-lg object-contain"
              />
            ) : entry ? (
              <video
                src={entry.src}
                controls
                playsInline
                preload="metadata"
                aria-label={entry.alt}
                className="max-h-full w-auto max-w-full rounded-lg"
              />
            ) : null}
          </div>
          {entry ? (
            <p className="border-t px-4 py-2 text-sm opacity-80">{entry.caption}</p>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
