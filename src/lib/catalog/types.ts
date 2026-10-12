/**
 * CatalogItem: one card in the shared browser, whatever the collection.
 * Built by scripts/build-catalog.ts into generated/catalog.json.
 * Pure data + zod — no React, so Vitest can import this directly.
 */
import { z } from 'zod';

export const COLLECTIONS = ['topics', 'projects', 'books'] as const;
export type Collection = (typeof COLLECTIONS)[number];

export const SORTS = ['recommended', 'az', 'updated'] as const;
export type SortKey = (typeof SORTS)[number];

export const catalogItemSchema = z.object({
  id: z.string().min(1),
  collection: z.enum(COLLECTIONS),
  title: z.string().min(1),
  summary: z.string().min(1).max(160),
  categories: z.array(z.string().min(1)),
  primaryCategory: z.string().nullable(),
  tags: z.array(z.string()),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional(),
  platform: z.enum(['web', 'mobile']).optional(),
  status: z.enum(['live', 'soon']),
  cover: z.string().optional(),
  href: z.string().min(1),
  updated: z.string().optional(),
  pageCount: z.number().int().nonnegative().optional(),
  keywords: z.array(z.string()).default([]),
  /** Curated rank within the collection (topic.yaml order, registry order). */
  order: z.number().default(999),
});

export type CatalogItem = z.infer<typeof catalogItemSchema>;

export const topicYamlSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1).max(160),
  category: z.string().min(1),
  alsoIn: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string()).default([]),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'all']),
  status: z.enum(['live', 'soon']),
  cover: z.string().optional(),
  order: z.number().default(999),
  updated: z.string().optional(),
  keywords: z.array(z.string()).default([]),
});

export type TopicYaml = z.infer<typeof topicYamlSchema>;

export function validateCatalog(items: unknown): CatalogItem[] {
  return z.array(catalogItemSchema).parse(items);
}
