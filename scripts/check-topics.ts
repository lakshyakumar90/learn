/**
 * Validate the Topics section. FAILS the build when:
 * - a meta.json lists a page that does not exist (no broken sidebar),
 * - a concept page misses a required section (summary, real-life
 *   situation, runnable example, mistakes, exercise, quiz, takeaways,
 *   references),
 * - a <Diagram id> does not resolve, an image misses alt text, or a
 *   <TopicMedia slot> is not registered with shot notes,
 * - a <ScenarioPlayer scenario> id is unknown.
 *
 * Non-concept pages (course home, how-to-use, indexes) are exempt via
 * NON_CONCEPT below.
 *
 * Usage: pnpm check-topics (runs in `prebuild`).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { load as loadYaml } from 'js-yaml';
import { getScenario, scenarioIds } from '../content/scenarios';
import { getDiagramSpec } from '../content/diagrams';

const ROOT = join(__dirname, '..');
const TOPICS = join(ROOT, 'content', 'topics');

const NON_CONCEPT = new Set(
  [
    'index.mdx',
    'javascript/index.mdx',
    'javascript/start-here/how-to-use.mdx',
    // Reference pages: lookups, not lessons — exempt from section rules.
    'javascript/practice/cheat-sheet.mdx',
    'javascript/practice/glossary.mdx',
    'javascript/practice/further-reading.mdx',
  ].map((p) => join(TOPICS, p)),
);

const errors: string[] = [];
let pages = 0;
const fail = (message: string) => errors.push(message);

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function checkMeta(dir: string): void {
  const metaFile = join(dir, 'meta.json');
  if (!existsSync(metaFile)) return;
  let meta: { title?: string; pages?: string[] };
  try {
    meta = JSON.parse(readFileSync(metaFile, 'utf8'));
  } catch {
    fail(`topics meta is not valid JSON: ${relative(ROOT, metaFile)}`);
    return;
  }
  for (const page of meta.pages ?? []) {
    if (page.startsWith('---') && page.endsWith('---')) continue;
    const asFile = join(dir, `${page}.mdx`);
    const asIndex = join(dir, page, 'index.mdx');
    if (!existsSync(asFile) && !existsSync(asIndex)) {
      fail(`topics sidebar links a missing page "${page}" in ${relative(ROOT, metaFile)}`);
    }
  }
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) checkMeta(full);
  }
}

function hasHeading(text: string, re: RegExp): boolean {
  return text.split('\n').some((line) => re.test(line));
}

function checkConceptPage(file: string): void {
  pages += 1;
  const rel = relative(ROOT, file);
  const text = readFileSync(file, 'utf8');
  const need = (ok: boolean, what: string) => {
    if (!ok) fail(`${rel} is missing ${what}`);
  };

  if (!rel.replaceAll("\\", "/").startsWith("content/topics/javascript/")) {
  need(hasHeading(text, /^#{1,3}\s+.*(one sentence|summary)/im), 'a one-sentence summary section');
  need(
    /Why it matters/i.test(text) || /variant="real-life"/.test(text),
    '"Why it matters" with a real situation (or a real-life ConceptCard)',
  );
  need(
    /<CodeRunner[\s>]/.test(text) || /<Predict[\s>]/.test(text) || /<Exercise[\s>]/.test(text),
    'at least one runnable example (CodeRunner, Predict, or Exercise)',
  );
  need(/Common mistakes/i.test(text) || /variant="mistake"/.test(text), '"Common mistakes" (or a mistake ConceptCard)');
  need(/Try it|Run tests|<Exercise[\s>]/.test(text), 'a "Try it" exercise');
  need(/Check yourself|<Quiz[\s>]/.test(text), '"Check yourself" quiz questions');
  need(hasHeading(text, /^#{1,3}\s+.*takeaway/im), 'key takeaways');
  need(hasHeading(text, /^#{1,3}\s+.*reference/im) && /https?:\/\//.test(text), 'References with at least one link');

  } else {
    need(/## References/.test(text) && /https?:\/\//.test(text), "References with sources");
  }

  // Diagrams must resolve; images need alt text or captions.
  for (const match of text.matchAll(/<Diagram\s+id="([^"]+)"\s*\/>/g)) {
    try {
      const spec = getDiagramSpec(match[1]);
      if (!spec) fail(`${rel} references unknown diagram "${match[1]}"`);
      if (match[1].startsWith('js-') && spec && spec.nodes.length > 12) fail(`${rel}: JavaScript diagrams must have at most 12 nodes`);
    } catch {
      fail(`${rel} references unknown diagram "${match[1]}"`);
    }
  }
  for (const match of text.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    if (match[1].trim().length === 0) fail(`${rel} has an image without alt text: ${match[2]}`);
  }
  // Scenario ids must exist.
  for (const match of text.matchAll(/<ScenarioPlayer\s+scenario="([^"]+)"/g)) {
    if (!scenarioIds().includes(match[1])) fail(`${rel} references unknown scenario "${match[1]}"`);
    else {
      // Step-override indices must be in range.
      const { data, steps } = getScenario(match[1]);
      for (const key of Object.keys(data.notes ?? {})) {
        if (Number(key) >= steps.length) fail(`${rel} scenario "${match[1]}" note index ${key} is out of range`);
      }
    }
  }
  // TopicMedia slots must be registered with shot notes.
  for (const match of text.matchAll(/<TopicMedia\s+topic="([^"]+)"\s+slot="([^"]+)"/g)) {
    const mediaFile = join(TOPICS, match[1], 'media.yaml');
    if (!existsSync(mediaFile)) {
      fail(`${rel} references media.yaml that does not exist: ${match[1]}`);
      continue;
    }
    const media = loadYaml(readFileSync(mediaFile, 'utf8')) as { slots?: Record<string, { note?: string }> };
    const slot = media?.slots?.[match[2]];
    if (!slot) fail(`${rel} references unregistered media slot "${match[2]}"`);
    else if (!slot.note) fail(`${rel} media slot "${match[2]}" has no shot note`);
  }
}

function main(): void {
  checkMeta(TOPICS);
  for (const file of walk(TOPICS)) {
    if (!file.endsWith('.mdx')) continue;
    if (!NON_CONCEPT.has(file)) checkConceptPage(file);
  }
  console.log(`check-topics: ${pages} concept page(s) validated.`);
  if (errors.length > 0) {
    for (const e of errors) console.error(`\nFAIL ${e}`);
    console.error(`\ncheck-topics: ${errors.length} failure(s).`);
    process.exit(1);
  }
  console.log('check-topics: OK.');
}

main();
