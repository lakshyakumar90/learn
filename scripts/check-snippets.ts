import { format } from "prettier";
import { mdxFiles, snippets } from "./javascript-content";
import { tsMdxFiles, tsParts } from "./typescript-content";
import { readFileSync } from "node:fs";
const parser: Record<string, string> = {
  js: "babel",
  javascript: "babel",
  ts: "typescript",
  tsx: "babel-ts",
  typescript: "typescript",
  json: "json",
  html: "html",
  css: "css",
  bash: "babel",
  sh: "babel",
};
const failures: string[] = [];
let count = 0;
async function check(
  file: string,
  parts: Array<{ code: string; language: string; start: number; kind: string }>,
) {
  for (const snippet of parts) {
    count++;
    if (!snippet.language) {
      failures.push(`${file}: fence needs a language`);
      continue;
    }
      // Shell snippets have no Prettier parser; enforce whitespace and an 80-column limit.
      if (["bash", "sh"].includes(snippet.language)) {
        if (
          snippet.code.split("\n").some((l) => l.length > 80 || /\s+$/.test(l))
        )
          failures.push(`${file}: shell whitespace/width`);
        continue;
      }
      if (!parser[snippet.language]) {
        failures.push(
          `${file}: unsupported snippet language ${snippet.language}`,
        );
        continue;
      }
      try {
        const expected = (
          await format(snippet.code, {
            parser: parser[snippet.language],
            tabWidth: 2,
            semi: true,
            singleQuote: false,
            printWidth: 80,
          })
        ).trimEnd();
        if (expected !== snippet.code.trimEnd())
          failures.push(
            `${file}: unformatted ${snippet.kind} at offset ${snippet.start}`,
          );
      } catch (e) {
        failures.push(`${file}: ${String(e)}`);
      }
    }
}
async function main() {
  for (const file of mdxFiles())
    await check(file, snippets(readFileSync(file, "utf8")));
  for (const file of tsMdxFiles())
    await check(file, tsParts(readFileSync(file, "utf8")));
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(`check-snippets: ${count} formatted snippets OK`);
}
void main();
