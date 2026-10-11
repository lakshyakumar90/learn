// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";

// src/lib/doc-schema.ts
import { pageSchema } from "fumadocs-core/source/schema";
import { z } from "zod";
var fileEntry = z.object({
  file: z.string(),
  purpose: z.string()
});
var talkEntry = z.object({
  label: z.string(),
  href: z.string()
});
var docSchema = pageSchema.extend({
  purpose: z.string().optional(),
  owns: z.array(z.string()).optional(),
  files: z.array(fileEntry).optional(),
  talksTo: z.array(talkEntry).optional(),
  sources: z.array(z.string()).optional(),
  diagram: z.string().optional(),
  diagrams: z.array(z.string()).optional()
});

// source.config.ts
var projects = defineDocs({
  dir: "content/projects",
  docs: { schema: docSchema }
});
var topics = defineDocs({
  dir: "content/topics",
  docs: { schema: docSchema }
});
var books = defineDocs({
  dir: "content/books",
  docs: { schema: docSchema }
});
var source_config_default = defineConfig();
export {
  books,
  source_config_default as default,
  projects,
  topics
};
