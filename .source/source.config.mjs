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
  kind: z.enum(["overview", "concept"]).optional(),
  purpose: z.string().optional(),
  owns: z.array(z.string()).optional(),
  files: z.array(fileEntry).optional(),
  talksTo: z.array(talkEntry).optional(),
  sources: z.array(z.string()).optional(),
  diagram: z.string().optional(),
  diagrams: z.array(z.string()).optional(),
  /** Dependency workspace key for the rendered Dependencies section. */
  workspace: z.string().optional()
});

// src/lib/code/theme.ts
var palette = {
  light: {
    bg: "#ffffff",
    fg: "#24292f",
    keyword: "#6639ba",
    string: "#0a6445",
    number: "#953800",
    function: "#0550ae",
    comment: "#57606a",
    variable: "#9a1c40"
  },
  dark: {
    bg: "#1c1917",
    fg: "#e7e5e4",
    keyword: "#c4b5fd",
    string: "#86efac",
    number: "#fbbf24",
    function: "#93c5fd",
    comment: "#a8a29e",
    variable: "#f9a8d4"
  }
};
function makeTheme(mode) {
  const p = palette[mode];
  return {
    name: `learn-${mode}`,
    type: mode,
    colors: { "editor.background": p.bg, "editor.foreground": p.fg },
    tokenColors: [
      {
        scope: ["keyword", "storage", "punctuation.definition.tag"],
        settings: { foreground: p.keyword }
      },
      { scope: ["string"], settings: { foreground: p.string } },
      {
        scope: ["constant.numeric", "constant.language"],
        settings: { foreground: p.number }
      },
      {
        scope: ["entity.name.function", "support.function"],
        settings: { foreground: p.function }
      },
      { scope: ["comment"], settings: { foreground: p.comment } },
      {
        scope: ["variable", "entity.name.tag", "entity.other.attribute-name"],
        settings: { foreground: p.variable }
      }
    ]
  };
}
var lightTheme = makeTheme("light");
var darkTheme = makeTheme("dark");

// source.config.ts
import { transformerNotationDiff, transformerNotationHighlight, transformerMetaHighlight } from "@shikijs/transformers";
var projects = defineDocs({
  dir: "content/projects",
  docs: { schema: docSchema }
});
var topics = defineDocs({
  dir: "content/topics",
  // questions.yaml and CREDITS.md are data files, not docs pages.
  docs: { schema: docSchema, files: ["**/*.{md,mdx}", "!**/CREDITS.md"] },
  // Meta is only meta.json: topic.yaml files and questions.yaml are read
  // directly by scripts and server components, never via .source.
  meta: { files: ["**/meta.json"] }
});
var books = defineDocs({
  dir: "content/books",
  docs: { schema: docSchema }
});
var source_config_default = defineConfig({ mdxOptions: { rehypeCodeOptions: {
  themes: { light: lightTheme, dark: darkTheme },
  defaultColor: false,
  transformers: [transformerNotationDiff(), transformerNotationHighlight(), transformerMetaHighlight()]
} } });
export {
  books,
  source_config_default as default,
  projects,
  topics
};
