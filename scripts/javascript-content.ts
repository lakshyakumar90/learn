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
    /<(CodeRunner|Predict|Exercise|BugHunt)\b[\s\S]*?>\s*\{`((?:\\.|[^`])*)`\}\s*<\/\1>/g,
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
export function realWorld(
  text: string,
): Array<{ name: string; detail: string; source: string; year: number }> {
  const match = text.match(/<RealWorld\s+items=\{(\[[\s\S]*?\])\}\s*\/>/);
  return match ? JSON.parse(match[1]) : [];
}
export function prose(text: string): string {
  const parts: string[] = [];
  parts.push(...realWorld(text).map((i) => `${i.name} ${i.detail}`));
  for (const m of text.matchAll(
    /\b(use|avoid|alternative)=("(?:\\.|[^"\\])*")/g,
  ))
    parts.push(JSON.parse(m[2]));
  const clean = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<(CodeRunner|Predict|Exercise|BugHunt)\b[\s\S]*?<\/\1>/g, " ")
    .replace(
      /<(RealWorld|Quiz|CodeCompare|WhenToUse|Storyboard|AnnotatedImage)\b[\s\S]*?\/>/g,
      " ",
    )
    .replace(/<[^>]+>/g, " ")
    .replace(/\]\([^)]*\)/g, "]")
    .replace(/[`#*{}]/g, " ");
  return clean + "\n" + parts.join("\n");
}
export function wordCount(text: string) {
  return (text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu) ?? []).length;
}
