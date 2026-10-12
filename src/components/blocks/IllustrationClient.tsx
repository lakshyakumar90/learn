"use client";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
} from "lucide-react";
import { ExpandedView } from "@/components/ExpandedView";
import { BUTTON } from "./CodeRunner";
export interface ImageAsset {
  id: string;
  src: string;
  darkSrc?: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  prompt?: string;
}
function Picture({ asset }: { asset: ImageAsset }) {
  // These assets are precompressed WebP files with explicit intrinsic sizes.
  return (
    <picture>
      <img
        src={asset.src}
        data-dark-src={asset.darkSrc}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        loading="lazy"
        className={
          asset.darkSrc
            ? "block h-auto w-full dark:hidden"
            : "block h-auto w-full"
        }
      />
      {asset.darkSrc && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.darkSrc}
            alt={asset.alt}
            width={asset.width}
            height={asset.height}
            loading="lazy"
            className="hidden h-auto w-full dark:block"
          />
        </>
      )}
    </picture>
  );
}
export function IllustrationClient({ asset }: { asset: ImageAsset }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <figure className="my-6">
        <button
          type="button"
          aria-label={`Expand illustration: ${asset.id}`}
          className="block w-full overflow-hidden rounded-xl border focus-visible:outline"
          onClick={() => setOpen(true)}
        >
          <Picture asset={asset} />
        </button>
        <figcaption className="mt-2 text-sm text-[var(--code-comment)]">
          {asset.caption}
        </figcaption>
      </figure>
      <ExpandedView
        open={open}
        onOpenChange={setOpen}
        title={asset.caption}
        description={asset.alt}
        panKeys={false}
        noFlow
        headerControls={<span />}
      >
        <div className="m-auto w-full max-w-5xl p-4">
          <Picture asset={asset} />
        </div>
      </ExpandedView>
    </>
  );
}
export function StoryboardClient({
  assets,
  title,
  captions,
}: {
  assets: ImageAsset[];
  title: string;
  captions?: string[];
}) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const count = assets.length;
  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setStep((value) => (value + 1) % count),
      2400,
    );
    return () => window.clearInterval(timer);
  }, [playing, count]);
  const caption = captions?.[step] ?? assets[step].caption;
  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className={BUTTON}
        aria-label="Previous storyboard panel"
        onClick={() => setStep((s) => (s - 1 + count) % count)}
      >
        <ChevronLeft size={16} />
      </button>
      <button
        className={BUTTON}
        aria-label={playing ? "Pause storyboard" : "Play storyboard"}
        onClick={() => setPlaying((v) => !v)}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}{" "}
        {playing ? "Pause" : "Play"}
      </button>
      <button
        className={BUTTON}
        aria-label="Next storyboard panel"
        onClick={() => setStep((s) => (s + 1) % count)}
      >
        <ChevronRight size={16} />
      </button>
      <span aria-live="polite">
        {step + 1} of {count}
      </span>
      {!open && (
        <button
          className={BUTTON}
          aria-label="Expand storyboard"
          onClick={() => setOpen(true)}
        >
          <Maximize2 size={16} />
          Expand
        </button>
      )}
    </div>
  );
  function keys(event: React.KeyboardEvent) {
    if (
      event.target instanceof HTMLElement &&
      event.target.closest("button,input,select")
    )
      return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setStep((s) => (s + 1) % count);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setStep((s) => (s - 1 + count) % count);
    }
    if (event.key === " ") {
      event.preventDefault();
      setPlaying((v) => !v);
    }
  }
  const panel = (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border">
        <Picture asset={assets[step]} />
      </div>
      <p aria-live="polite">{caption}</p>
      {controls}
    </div>
  );
  return (
    <>
      <section
        data-storyboard
        aria-label={title}
        tabIndex={0}
        onKeyDown={keys}
        className="my-6 space-y-3 rounded-xl focus-visible:outline"
      >
        <h3>{title}</h3>
        {!open && panel}
        <details>
          <summary>Read the complete storyboard</summary>
          <ol>
            {assets.map((asset, index) => (
              <li key={asset.id}>{captions?.[index] ?? asset.caption}</li>
            ))}
          </ol>
        </details>
      </section>
      <ExpandedView
        open={open}
        onOpenChange={setOpen}
        title={title}
        description="Use left and right arrows to change panels, Space to play or pause, Escape to close."
        panKeys={false}
        noFlow
        headerControls={<span />}
      >
        <div
          className="m-auto w-full max-w-4xl p-4"
          tabIndex={0}
          onKeyDown={keys}
        >
          {panel}
        </div>
      </ExpandedView>
    </>
  );
}
export function AnnotatedImageClient({
  asset,
  hotspots,
}: {
  asset: ImageAsset;
  hotspots: Array<{ x: number; y: number; title: string; detail: string }>;
}) {
  const [active, setActive] = useState<number | null>(null);
  return (
    <figure className="my-6">
      <div className="relative overflow-hidden rounded-xl border">
        <Picture asset={asset} />
        {hotspots.map((spot, index) => (
          <button
            key={spot.title}
            type="button"
            className="absolute min-h-11 min-w-11 rounded-full border bg-[var(--code-bg)] text-[var(--code-fg)]"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            aria-label={`Annotation ${index + 1}: ${spot.title}`}
            aria-expanded={active === index}
            onClick={() => setActive(active === index ? null : index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <figcaption className="mt-2 text-sm">{asset.caption}</figcaption>
      {active !== null && (
        <div role="status" className="mt-3 rounded-xl border p-4">
          <strong>{hotspots[active].title}</strong>
          <p>{hotspots[active].detail}</p>
          <button className={BUTTON} onClick={() => setActive(null)}>
            Close detail
          </button>
        </div>
      )}
      <ol className="sr-only">
        {hotspots.map((s) => (
          <li key={s.title}>
            {s.title}: {s.detail}
          </li>
        ))}
      </ol>
    </figure>
  );
}
