'use client';

import { useState } from 'react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { Play } from 'lucide-react';
import { DEMO_ASPECT, isPlaceholder, youtubeId, type DemoMediaItem } from '@/lib/demo';
import { DeviceFrame } from './DeviceFrame';

function Placeholder({ item, ratio }: { item: DemoMediaItem; ratio: string }) {
  const comingSoon = item.type === 'image' ? 'Screenshot coming soon' : 'Video coming soon';
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 bg-stone-100 p-4 text-center dark:bg-stone-900"
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={`${item.title ?? item.caption}. ${comingSoon}.`}
    >
      {item.type !== 'image' ? (
        <span
          aria-hidden
          className="flex h-12 w-12 items-center justify-center rounded-full border"
        >
          <Play size={20} />
        </span>
      ) : null}
      <p className="text-sm font-semibold">{item.title ?? item.caption}</p>
      <p className="text-xs opacity-60">{comingSoon}</p>
    </div>
  );
}

function YoutubeFacade({ item }: { item: DemoMediaItem }) {
  const [loaded, setLoaded] = useState(false);
  const id = youtubeId(item.src);
  if (!id) return <Placeholder item={item} ratio={DEMO_ASPECT.video} />;
  if (!loaded) {
    return (
      <div style={{ aspectRatio: DEMO_ASPECT.video }} className="relative w-full">
        {item.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.poster}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <button
          type="button"
          onClick={() => setLoaded(true)}
          aria-label={`Play video: ${item.caption}`}
          className="absolute inset-0 flex w-full flex-col items-center justify-center gap-2 bg-black/40 p-4 text-center text-white transition-colors hover:bg-black/50"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-stone-900">
            <Play size={24} aria-hidden />
          </span>
          <span className="max-w-full truncate text-sm font-medium">{item.title ?? item.caption}</span>
        </button>
      </div>
    );
  }
  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
      title={item.caption}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      loading="lazy"
      style={{ aspectRatio: DEMO_ASPECT.video }}
      className="h-full w-full"
    />
  );
}

/**
 * One demo media slot: placeholder, framed image button (opens the
 * lightbox), local video, or YouTube facade. Looping clips stay still
 * under prefers-reduced-motion.
 */
export function DemoVideo({
  item,
  onOpen,
}: {
  item: DemoMediaItem;
  onOpen?: () => void;
}) {
  const reduceMotion = useReducedMotion();
  if (isPlaceholder(item)) {
    const ratio =
      item.type === 'video' ? DEMO_ASPECT.video : DEMO_ASPECT[item.device] ?? DEMO_ASPECT.none;
    return (
      <DeviceFrame kind={item.type === 'video' ? 'none' : item.device}>
        <Placeholder item={item} ratio={ratio} />
      </DeviceFrame>
    );
  }
  if (item.type === 'youtube') return <YoutubeFacade item={item} />;
  if (item.type === 'video' && item.src) {
    return (
      <div
        className="w-full overflow-hidden rounded-lg bg-black"
        style={{ aspectRatio: DEMO_ASPECT.video }}
      >
        <video
          src={item.src}
          controls
          playsInline
          preload="metadata"
          loop={item.loop === true && reduceMotion !== true}
          autoPlay={false}
          poster={item.poster}
          aria-label={item.alt}
          className="block h-full w-full"
        />
      </div>
    );
  }
  return (
    <DeviceFrame kind={item.device}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open screenshot: ${item.caption}`}
        className="block h-full w-full cursor-zoom-in"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </button>
    </DeviceFrame>
  );
}
