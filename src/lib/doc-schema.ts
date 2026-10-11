import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

const fileEntry = z.object({
  file: z.string(),
  purpose: z.string(),
});

const talkEntry = z.object({
  label: z.string(),
  href: z.string(),
});

/**
 * Front matter shared by every docs page in every collection.
 * Folder pages additionally use purpose / owns / files / talksTo / sources / diagram.
 */
export const docSchema = pageSchema.extend({
  purpose: z.string().optional(),
  owns: z.array(z.string()).optional(),
  files: z.array(fileEntry).optional(),
  talksTo: z.array(talkEntry).optional(),
  sources: z.array(z.string()).optional(),
  diagram: z.string().optional(),
  diagrams: z.array(z.string()).optional(),
  /** Dependency workspace key for the rendered Dependencies section. */
  workspace: z.string().optional(),
});

export type DocFrontmatter = z.infer<typeof docSchema>;
