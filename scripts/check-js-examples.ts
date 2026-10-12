/**
 * Run every runnable console example under content/topics in Node and
 * compare with the declared expected output. FAILS the build on:
 * - a <CodeRunner env="console"> snippet whose output differs from
 *   its expect="..." lines,
 * - a <CodeRunner> snippet that throws without expectError="...",
 * - a <Predict> snippet without answerLines="..." or one that throws,
 * - a snippet whose output differs between browser and Node without
 *   skipNodeCheck="reason" (excluded snippets print in a list).
 *
 * The SAME helpers run here as in the browser workers: sleep and
 * fakeFetch are imported from src/lib/runner-helpers (fresh state per
 * snippet via resetHelpers). MDX template-literal children ({`...`})
 * are evaluated exactly like MDX evaluates them.
 *
 * Authoring rules (also documented in how-to-use):
 * - write snippet children as {`...`}; escape backticks and ${...}
 *   the JS-template way (\\`, ${'$'}).
 * - expect="..." / answerLines="..." use \\n between lines.
 *
 * Usage: pnpm check-js-examples (runs in `prebuild`).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { snippets } from './javascript-content';
import {
  attr,
  decodeLines,
  evalTemplateLiteral,
  runInNode,
} from './snippet-run';

const ROOT = join(__dirname, '..');
const TOPICS = join(ROOT, 'content', 'topics');

const errors: string[] = [];
const skipped: string[] = [];
let checked = 0;

const fail = (message: string) => errors.push(message);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.mdx')) out.push(full);
  }
  return out;
}

interface Snippet {
  file: string;
  kind: 'CodeRunner' | 'Predict';
  code: string;
  expected: string[];
  expectError?: string;
}

function extractSnippets(file: string): Snippet[] {
  const text = readFileSync(file, 'utf8');
  const out: Snippet[] = [];
  const re = /<(CodeRunner|Predict)\b((?:"[^"]*"|'[^']*'|`[^`\\]*(?:\\.[^`\\]*)*'|[^'">`])*)>([\s\S]*?)<\/\1>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const kindRaw: string = match[1];
    if (kindRaw !== 'CodeRunner' && kindRaw !== 'Predict') continue;
    const kind: 'CodeRunner' | 'Predict' = kindRaw;
    const tag: string = match[2];
    // TypeScript snippets belong to check-ts-examples (separate compiler).
    const lang = attr(tag, 'language');
    if (lang === 'ts' || lang === 'typescript') continue;
    const inner: string = match[3];
    const env = attr(tag, 'env') ?? 'console';
    if (env !== 'console') continue;
    const skip = attr(tag, 'skipNodeCheck');
    if (skip) {
      skipped.push(`${relative(ROOT, file)} <${kind}>: ${skip}`);
      continue;
    }
    const code = evalTemplateLiteral(inner).replace(/^\n/, '').replace(/\s+$/, '');
    if (kind === 'CodeRunner') {
      out.push({
        file, kind,
        code,
        expected: decodeLines(attr(tag, 'expect')),
        expectError: attr(tag, 'expectError'),
      });
    } else {
      const answerLines = attr(tag, 'answerLines');
      if (!answerLines) {
        fail(`${relative(ROOT, file)} <Predict> is missing answerLines="..."`);
        continue;
      }
      out.push({ file, kind, code, expected: decodeLines(answerLines) });
    }
  }
  return out;
}

async function main(): Promise<void> {
  const files = walk(TOPICS);
  for (const file of files) {
    for (const snippet of extractSnippets(file)) {
      checked += 1;
      const where = `${relative(ROOT, file)} <${snippet.kind}>`;
      const run = await runInNode(snippet.code);
      if (run.error) {
        if (snippet.expectError && run.error.includes(snippet.expectError)) continue;
        fail(`${where} threw in Node: ${run.error}\n--- code ---\n${snippet.code}`);
        continue;
      }
      if (snippet.expectError) {
        fail(`${where} declares expectError but ran clean in Node`);
        continue;
      }
      if (snippet.expected.length === 0) {
        fail(`${where} has no expect/answerLines to compare against`);
        continue;
      }
      const actual = run.lines.join('\n');
      const want = snippet.expected.join('\n');
      if (actual !== want) {
        fail(`${where} output mismatch.\n--- want ---\n${want}\n--- got ---\n${actual}\n--- code ---\n${snippet.code}`);
      }
    }
    if (file.includes(join('topics', 'javascript'))) {
      const text = readFileSync(file, 'utf8');
      for (const block of text.matchAll(/<(Exercise|BugHunt)\b[\s\S]*?<\/\1>/g)) {
        const parts = snippets(block[0]);
        const solution = parts.find(p => p.kind === 'solution');
        const tests = parts.find(p => p.kind === 'tests');
        const starter = parts.find(p => p.kind === block[1]);
        if (!solution || !tests || !starter) { fail(`${relative(ROOT,file)}: exercise needs starter, tests and solution`); continue; }
        const assertion = 'const assert = (condition, name) => { if (!condition) throw new Error("Assertion failed: " + name); };\n';
        const solved = await runInNode(assertion + solution.code + '\n' + tests.code);
        const broken = await runInNode(assertion + starter.code + '\n' + tests.code);
        checked += 2;
        if (solved.error) fail(`${relative(ROOT,file)}: exercise solution failed: ${solved.error}`);
        if (!broken.error) fail(`${relative(ROOT,file)}: exercise starter must fail a behavioral test`);
      }
    }
  }
  console.log(`check-js-examples: ${checked} snippet(s) run in Node.`);
  for (const s of skipped) console.log(`  excluded from Node check: ${s}`);
  if (errors.length > 0) {
    for (const e of errors) console.error(`\nFAIL ${e}`);
    console.error(`\ncheck-js-examples: ${errors.length} failure(s).`);
    process.exit(1);
  }
  console.log('check-js-examples: OK.');
}

void main();
