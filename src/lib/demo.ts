import { z } from 'zod';

/**
 * demo.yaml data model. One file per project at
 * content/projects/<id>/demo.yaml. Galleries render from this file —
 * no hand-typed gallery markup in MDX.
 *
 * Placeholders: an item with no `src` (or `placeholder: true`) renders a
 * designed placeholder at the right aspect ratio. Replacing one takes two
 * steps: drop the file into public/media/<project>/ and set its `src`.
 */
export const DemoMediaItem = z.object({
  type: z.enum(['image', 'video', 'youtube']),
  src: z.string().optional(),
  poster: z.string().optional(),
  title: z.string().optional(),
  alt: z.string().min(1, 'alt is required on every item'),
  caption: z.string().min(1, 'caption is required on every item'),
  device: z.enum(['phone', 'browser', 'none']).default('none'),
  featureLink: z.string().optional(),
  placeholder: z.boolean().optional(),
  loop: z.boolean().optional(),
});

export const DemoSection = z.object({
  id: z.string(),
  layout: z.enum(['phone-carousel', 'grid', 'single', 'stack']),
  items: z.array(DemoMediaItem).min(1),
});

export const DemoHero = z.object({
  type: z.enum(['video', 'image', 'youtube']),
  src: z.string().optional(),
  poster: z.string().optional(),
  alt: z.string().min(1, 'alt is required on the hero'),
  caption: z.string().min(1, 'caption is required on the hero'),
});

export const DemoWalkthrough = z.object({
  id: z.string(),
  title: z.string(),
  caption: z.string(),
  section: z.string(),
  index: z.number().int().min(0),
  featureLink: z.string(),
});

export const DemoYaml = z.object({
  hero: DemoHero,
  sections: z.array(DemoSection),
  walkthroughs: z.array(DemoWalkthrough).default([]),
});

export type DemoMediaItem = z.infer<typeof DemoMediaItem>;
export type DemoSection = z.infer<typeof DemoSection>;
export type DemoHero = z.infer<typeof DemoHero>;
export type DemoWalkthrough = z.infer<typeof DemoWalkthrough>;
export type DemoData = z.infer<typeof DemoYaml>;

export const DEMO_ASPECT: Record<string, string> = {
  phone: '9 / 19.5',
  browser: '16 / 10',
  none: '16 / 10',
  video: '16 / 9',
};

export function isPlaceholder(item: { src?: string; placeholder?: boolean }): boolean {
  return item.placeholder === true || !item.src;
}

/** Local public/ path for a media src, or null for remote/empty refs. */
export function localMediaPath(src?: string): string | null {
  if (!src || /^https?:\/\//.test(src)) return null;
  return src.replace(/^\/+/, '');
}

export function youtubeId(src?: string): string | null {
  if (!src) return null;
  const m = src.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(src)) return src;
  return null;
}
