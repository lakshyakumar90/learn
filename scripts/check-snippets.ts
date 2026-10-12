import { format } from "prettier";
import { mdxFiles, snippets } from "./javascript-content";
import { readFileSync } from "node:fs";
const parser: Record<string, string> = {
  js: "babel",
  javascript: "babel",
  ts: "typescript",
  typescript: "typescript",
  json: "json",
  html: "html",
  css: "css",
  bash: "babel",
  sh: "babel",
};
const failures: string[] = [];
let count = 0;
async function main() {
  for (const file of mdxFiles())
    for (const snippet of snippets(readFileSync(file, "utf8"))) {
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
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(`check-snippets: ${count} formatted snippets OK`);
}
void main();
