/**
 * Validate the Topics section. FAILS the build when:
 * - a meta.json lists a page that does not exist (no broken sidebar),
 * - a JavaScript concept page (pages 4-21) misses its structure: exactly
 *   one visual (resolving Diagram of at most 12 nodes, a known
 *   ScenarioPlayer, or a DOM demo), a runnable example of 15+ lines, an
 *   <InterviewQuestions> block for its own slug, takeaways, References
 *   with a link, or carries more than 450 words of prose,
 * - questions.yaml breaks its contract (unique ids, known topics,
 *   answers of at most 120 words),
 * - puzzles/challenges/bank/index miss their required blocks,
 * - removed component tags (LiveDemo, Illustration, TopicMedia, Practical
 *   and friends) appear in the JavaScript topic, or an image lacks alt.
 *
 * Usage: pnpm check-topics (runs in `prebuild`).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { getScenario, scenarioIds } from '../content/scenarios';
import { getDiagramSpec } from '../content/diagrams';
import { prose, snippets, wordCount } from './javascript-content';
import { validateQuestions } from '../src/lib/interview';

const ROOT = join(__dirname, '..');
const TOPICS = join(ROOT, 'content', 'topics');
const JS = join(TOPICS, 'javascript');

/** JavaScript pages that adapt the template (not concept pages). */
const JS_NON_CONCEPT = new Set([
  'index.mdx',
  'why-javascript.mdx',
  'how-it-works.mdx',
  'pros-cons.mdx',
  'question-bank.mdx',
  'puzzles.mdx',
  'challenges.mdx',
  'cheat-sheet.mdx',
]);

const REMOVED_TAGS = [
  'LiveDemo',
  'Illustration',
  'Storyboard',
  'AnnotatedImage',
  'TopicMedia',
  'RealWorld',
  'WhenToUse',
  'CodeCompare',
  'BugHunt',
  'TopicRedirect',
];

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

function checkDiagramUsages(text: string, rel: string): void {
  for (const match of text.matchAll(/<Diagram\s+id="([^"]+)"\s*\/>/g)) {
    try {
      const spec = getDiagramSpec(match[1]);
      if (!spec) fail(`${rel} references unknown diagram "${match[1]}"`);
      else if (spec.nodes.length > 12) {
        fail(`${rel}: diagram "${match[1]}" has ${spec.nodes.length} nodes (max 12)`);
      }
    } catch {
      fail(`${rel} references unknown diagram "${match[1]}"`);
    }
  }
}

function checkScenarioUsages(text: string, rel: string): void {
  for (const match of text.matchAll(/<ScenarioPlayer\s+scenario="([^"]+)"/g)) {
    if (!scenarioIds().includes(match[1])) {
      fail(`${rel} references unknown scenario "${match[1]}"`);
    } else {
      const { data, steps } = getScenario(match[1]);
      for (const key of Object.keys(data.notes ?? {})) {
        if (Number(key) >= steps.length) {
          fail(`${rel} scenario "${match[1]}" note index ${key} is out of range`);
        }
      }
    }
  }
}

function checkConceptPage(file: string): void {
  pages += 1;
  const rel = relative(ROOT, file);
  const slug = basename(file, '.mdx');
  const text = readFileSync(file, 'utf8');
  const need = (ok: boolean, what: string) => {
    if (!ok) fail(`${rel} is missing ${what}`);
  };

  const diagrams = [...text.matchAll(/<Diagram\s+id="([^"]+)"\s*\/>/g)].map((m) => m[1]);
  const scenarios = [...text.matchAll(/<ScenarioPlayer\s+scenario="([^"]+)"/g)].map((m) => m[1]);
  // The visual is look-don't-touch (Diagram or ScenarioPlayer, exactly
  // one); env=dom CodeRunners are interactive runnables, counted below.
  const visualCount = diagrams.length + scenarios.length;
  need(visualCount >= 1, 'a visual (Diagram or ScenarioPlayer)');
  if (visualCount > 1) {
    fail(`${rel} has ${visualCount} visuals (exactly one per concept page)`);
  }

  const longest = Math.max(
    0,
    ...snippets(text)
      .filter((s) => ['CodeRunner', 'Predict', 'Exercise'].includes(s.kind))
      .map((s) => s.code.split('\n').length),
  );
  need(longest >= 15, `a runnable example of 15+ lines (longest is ${longest})`);

  const topics = [...text.matchAll(/<InterviewQuestions\s+topic="([^"]+)"/g)].map((m) => m[1]);
  need(topics.length >= 1, 'an <InterviewQuestions> block');
  for (const t of topics) {
    if (t !== slug) fail(`${rel}: InterviewQuestions topic "${t}" must match the page slug`);
  }

  need(hasHeading(text, /^#{1,3}\s+.*takeaway/im), 'key takeaways');
  need(
    hasHeading(text, /^#{1,3}\s+.*reference/im) && /https?:\/\//.test(text),
    'References with at least one link',
  );

  const words = wordCount(prose(text));
  if (words > 450) fail(`${rel} has ${words} words of prose (max 450)`);
}

function checkSpecialPage(file: string): void {
  const rel = relative(ROOT, file);
  const slug = basename(file, '.mdx');
  const text = readFileSync(file, 'utf8');
  if (slug === 'puzzles') {
    const count = [...text.matchAll(/<Predict\b/g)].length;
    if (count < 12) fail(`${rel} has ${count} puzzles (need 12)`);
    for (const m of text.matchAll(/<Predict\b([\s\S]*?)>/g)) {
      if (!/answerLines=/.test(m[1])) fail(`${rel}: a <Predict> is missing answerLines`);
    }
  }
  if (slug === 'challenges') {
    const blocks = [...text.matchAll(/<Exercise\b([\s\S]*?)>([\s\S]*?)<\/Exercise>/g)];
    if (blocks.length < 10) fail(`${rel} has ${blocks.length} challenges (need 10)`);
    for (const b of blocks) {
      if (!/tests=\{`/.test(b[1]) || !/solution=\{`/.test(b[1])) {
        fail(`${rel}: an <Exercise> is missing tests or solution`);
      }
    }
  }
  if (slug === 'question-bank' && !/<QuestionBank[\s>]/.test(text)) {
    fail(`${rel} is missing the <QuestionBank> block`);
  }
  if (slug === 'index' && !/<img\b[^>]*\balt="[^"]+"/.test(text)) {
    fail(`${rel} hero image needs alt text`);
  }
}

function main(): void {
  checkMeta(TOPICS);
  for (const file of walk(TOPICS)) {
    if (!file.endsWith('.mdx')) continue;
    const rel = relative(ROOT, file);
    const norm = rel.replaceAll('\\', '/');
    if (!norm.startsWith('content/topics/javascript/')) continue;
    const name = basename(file);
    for (const tag of REMOVED_TAGS) {
      if (new RegExp(`<${tag}[\\s>]`).test(readFileSync(file, 'utf8'))) {
        fail(`${rel} uses removed component <${tag}>`);
      }
    }
    checkDiagramUsages(readFileSync(file, 'utf8'), rel);
    checkScenarioUsages(readFileSync(file, 'utf8'), rel);
    for (const match of readFileSync(file, 'utf8').matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
      if (match[1].trim().length === 0) fail(`${rel} has an image without alt text: ${match[2]}`);
    }
    for (const match of readFileSync(file, 'utf8').matchAll(/<img\b([^>]*)>/g)) {
      if (!/\balt="[^"]+"/.test(match[1])) fail(`${rel} has an <img> without alt text`);
    }
    if (JS_NON_CONCEPT.has(name)) checkSpecialPage(file);
    else checkConceptPage(file);
  }

  // Questions contract against the real sidebar slugs.
  const meta = JSON.parse(readFileSync(join(JS, 'meta.json'), 'utf8')) as { pages: string[] };
  const slugs = meta.pages.filter((p) => !p.startsWith('---'));
  for (const e of validateQuestions(slugs)) fail(e);

  console.log(`check-topics: ${pages} concept page(s) validated.`);
  if (errors.length > 0) {
    for (const e of errors) console.error(`\nFAIL ${e}`);
    console.error(`\ncheck-topics: ${errors.length} failure(s).`);
    process.exit(1);
  }
  console.log('check-topics: OK.');
}

main();
