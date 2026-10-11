'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DemoMediaItem, DemoSection } from '@/lib/demo';
import { DemoVideo } from './DemoVideo';
import { MediaLightbox } from './MediaLightbox';

function ItemCaption({ item }: { item: DemoMediaItem }) {
  return <p className="mt-2 text-sm opacity-80">{item.caption}</p>;
}

/**
 * Client island for one demo section: phone carousel with snap scrolling,
 * browser grid, or a single slot — every openable image sharing one
 * lightbox. Purely presentational; data comes from demo.yaml.
 */
export function DemoGalleryClient({ section }: { section: DemoSection }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * Math.min(track.clientWidth * 0.8, 320), behavior: 'smooth' });
  };

  if (section.layout === 'phone-carousel') {
    return (
      <div>
        <div className="mb-2 flex items-center justify-end gap-1">
          <button
            type="button"
            aria-label="Scroll screenshots backward"
            onClick={() => scrollBy(-1)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border text-sm transition-opacity hover:bg-stone-100 dark:hover:bg-stone-900"
          >
            <ChevronLeft size={16} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Scroll screenshots forward"
            onClick={() => scrollBy(1)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border text-sm transition-opacity hover:bg-stone-100 dark:hover:bg-stone-900"
          >
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Screenshot carousel"
          className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2"
        >
          {section.items.map((item, i) => (
            <div key={i} className="w-[240px] shrink-0 snap-start sm:w-[260px]">
              <DemoVideo item={item} onOpen={() => openAt(i)} />
              <ItemCaption item={item} />
            </div>
          ))}
        </div>
        <MediaLightbox items={section.items} index={index} onIndex={setIndex} open={open} onOpenChange={setOpen} />
      </div>
    );
  }

  if (section.layout === 'grid') {
    return (
      <div>
        <div className="grid gap-6 sm:grid-cols-2">
          {section.items.map((item, i) => (
            <div key={i}>
              <DemoVideo item={item} onOpen={() => openAt(i)} />
              <ItemCaption item={item} />
            </div>
          ))}
        </div>
        <MediaLightbox items={section.items} index={index} onIndex={setIndex} open={open} onOpenChange={setOpen} />
      </div>
    );
  }

  const item = section.items[0];
  return (
    <div>
      <DemoVideo item={item} onOpen={() => openAt(0)} />
      <ItemCaption item={item} />
      <MediaLightbox items={section.items} index={index} onIndex={setIndex} open={open} onOpenChange={setOpen} />
    </div>
  );
}
