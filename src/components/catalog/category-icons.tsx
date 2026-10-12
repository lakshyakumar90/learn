'use client';

/**
 * Category icon + deterministic gradient. The map is keyed by the
 * closed IconKey union from content/taxonomy.ts, so adding a category
 * reuses an existing key with zero component changes.
 */
import { BookOpen, Code, Database, GitBranch, Layers, Lightbulb, Wrench } from 'lucide-react';
import type { IconKey } from '../../../content/taxonomy';

const ICONS: Record<IconKey, typeof Code> = {
  code: Code,
  database: Database,
  layers: Layers,
  wrench: Wrench,
  bulb: Lightbulb,
  git: GitBranch,
  book: BookOpen,
};

export function CategoryIcon({ icon, size = 20 }: { icon: IconKey; size?: number }) {
  const Glyph = ICONS[icon] ?? BookOpen;
  return <Glyph size={size} aria-hidden />;
}

/** Deterministic hue from any string — stable across renders. */
export function hueFor(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 360;
  return hash;
}

export function gradientFor(seed: string): string {
  const h = hueFor(seed);
  return `linear-gradient(135deg, hsl(${h} 55% 42%) 0%, hsl(${(h + 50) % 360} 60% 32%) 100%)`;
}
