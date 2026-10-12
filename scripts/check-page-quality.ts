import { relative } from "node:path";
import { writeFileSync } from "node:fs";
import {
  mdxFiles,
  readPage,
  realWorld,
  prose,
  wordCount,
  snippets,
} from "./javascript-content";
const failures: string[] = [];
const counts: Array<{ page: string; words: number; lines: number }> = [];
for (const file of mdxFiles()) {
  const { data, content } = readPage(file);
  const page = relative(process.cwd(), file).replaceAll("\\", "/");
  const words = wordCount(prose(content));
  const runnable = snippets(content).filter((s) =>
    ["CodeRunner", "Exercise", "BugHunt", "Predict"].includes(s.kind),
  );
  const lines = Math.max(0, ...runnable.map((s) => s.code.split("\n").length));
  counts.push({ page, words, lines });
  if (data.kind === "overview") continue;
  const fail = (ok: unknown, message: string) => {
    if (!ok) failures.push(`${page}: ${message}`);
  };
  const items = realWorld(content);
  fail(
    items.length >= 3 &&
      items.length <= 5 &&
      items.every(
        (i) =>
          i.name &&
          i.detail &&
          /^https:\/\//.test(i.source) &&
          Number.isInteger(i.year),
      ),
    "needs 3–5 named, sourced RealWorld items with a year",
  );
  fail(/<WhenToUse\b/.test(content), "needs WhenToUse");
  fail(lines >= 15, "needs a runnable example with at least 15 lines");
  fail(
    /<(Diagram|ScenarioPlayer|Illustration|Storyboard|AnnotatedImage|LiveDemo)\b/.test(
      content,
    ),
    "needs a visual",
  );
  fail(words <= 600, `prose exceeds 600 words (${words})`);
  const first = content.search(
    /```|<(CodeRunner|Predict|Exercise|BugHunt|Diagram|ScenarioPlayer|Illustration|Storyboard|LiveDemo)\b/,
  );
  fail(
    first >= 0 && wordCount(prose(content.slice(0, first))) <= 250,
    "more than 250 words before the first code or visual",
  );
  fail(
    /Last verified: \d{4}-\d{2}-\d{2}\./.test(content),
    "needs a Last verified date for sourced product claims",
  );
  for (const heading of [
    "Where you've already seen it",
    "How it works",
    "Build it",
    "Why it works this way",
    "Mistakes that reach production",
    "Challenge",
    "Check yourself",
    "Takeaways",
    "References",
  ])
    fail(content.includes("## " + heading), `missing ${heading}`);
  const positions = [
    "Where you've already seen it",
    "How it works",
    "Build it",
    "Why it works this way",
    "Mistakes that reach production",
    "Challenge",
    "Check yourself",
    "Takeaways",
    "References",
  ].map((h) => content.indexOf("## " + h));
  fail(
    positions.every((p, i) => i === 0 || p > positions[i - 1]),
    "sections are out of order",
  );
  for (const paragraph of prose(content).split(/\n\s*\n/))
    if ((paragraph.match(/[.!?](?:\s|$)/g) ?? []).length > 4)
      console.warn(`WARN ${page}: paragraph exceeds four sentences`);
  if (words < 350 || words > 500)
    console.warn(`WARN ${page}: target is 350–500 prose words (${words})`);
}
writeFileSync(
  "generated/javascript-quality.json",
  JSON.stringify(counts, null, 2) + "\n",
);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`check-page-quality: ${counts.length} pages OK`);
