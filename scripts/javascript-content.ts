/**
 * Shared MDX-mining helpers for the JavaScript topic checks.
 * Generic over the current block set (CodeRunner, Predict, Exercise,
 * InterviewQuestions); component-specific rules live in each check.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

export const JS_ROOT = join(process.cwd(), "content/topics/javascript");

export function mdxFiles(dir = JS_ROOT): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? mdxFiles(join(dir, e.name))
      : e.name.endsWith(".mdx")
        ? [join(dir, e.name)]
        : [],
  );
}

export function decodeTemplate(raw: string): string {
  // First-party MDX uses literal templates; reject executable interpolation.
  if (/(?<!\\)\$\{/.test(raw))
    throw new Error(
      "Executable interpolation is not allowed in a code snippet",
    );
  return new Function(`return \`${raw}\`;`)() as string;
}

export interface Snippet {
  code: string;
  language: string;
  start: number;
  kind: string;
}

export function snippets(text: string): Snippet[] {
  const out: Snippet[] = [];
  for (const m of text.matchAll(/```([^\n]*)\n([\s\S]*?)```/g))
    out.push({
      code: m[2].trimEnd(),
      language: m[1].trim().split(/\s+/)[0],
      start: m.index!,
      kind: "fence",
    });
  for (const m of text.matchAll(
    /<(CodeRunner|Predict|Exercise|CodeBlock)\b[\s\S]*?>\s*\{`((?:\\.|[^`])*)`\}\s*<\/\1>/g,
  ))
    out.push({
      code: decodeTemplate(m[2]).trim(),
      language: "js",
      start: m.index!,
      kind: m[1],
    });
  for (const m of text.matchAll(
    /\b(before|after|tests|solution|html|css)=\{`((?:\\.|[^`])*)`\}/g,
  ))
    out.push({
      code: decodeTemplate(m[2]).trim(),
      language: m[1] === "html" ? "html" : m[1] === "css" ? "css" : "js",
      start: m.index!,
      kind: m[1],
    });
  return out;
}

export function readPage(file: string) {
  return matter(readFileSync(file, "utf8"));
}

/** Visible prose only: no fences, no runnable blocks, no JSX, no markdown syntax. */
export function prose(text: string): string {
  const clean = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(
      /<(CodeRunner|Predict|Exercise|InterviewQuestions|CodeBlock|TypeCheck)\b[\s\S]*?<\/\1>/g,
      " ",
    )
    .replace(/<(Diagram|ScenarioPlayer|Quiz)\b[^>]*\/>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[>\-*+]\s+/gm, "")
    .replace(/[`#*{}]/g, " ");
  return clean;
}

export function wordCount(text: string) {
  return (text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? []).length;
}
