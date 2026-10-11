'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * Autoplaying muted loop of the project's demo hero tour on landing
 * cards. No controls (the full tour lives on the Demo page); stays
 * paused with the poster showing under prefers-reduced-motion.
 */
export function CardHeroVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster?: string;
  label: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduceMotion) {
      v.pause();
    } else {
      v.play().catch(() => {});
    }
  }, [reduceMotion, src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay={!reduceMotion}
      preload="metadata"
      disablePictureInPicture
      aria-label={label}
      className="mt-3 aspect-video w-full rounded-lg border bg-black object-cover"
    />
  );
}
