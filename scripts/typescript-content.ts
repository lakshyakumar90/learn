/**
 * MDX-mining helpers for the TypeScript topic checks. Parallel to
 * scripts/javascript-content.ts (which stays JS-only); nothing here is
 * imported by the JS checks.
 *
 * Constructs understood:
 * - ```ts fences (any meta string kept verbatim for parseFenceMeta),
 * - <CodeRunner language="typescript" ...> (errors/strict/expect props),
 * - <Exercise language="typescript" ...> (starter/tests/solution),
 * - <TypeCheck id question answer line? ...> (static diagnostics),
 * - `// path.to.thing: Expected Type` narrowing assertions inside ts code.
 */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export const TS_ROOT = join(process.cwd(), 'content/topics/typescript');

export function tsMdxFiles(dir = TS_ROOT): string[] {
  let out: string[] = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out = out.concat(tsMdxFiles(full));
    else if (e.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

export function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  if (!match) return undefined;
  return match[1]
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

export function evalTemplateLiteral(inner: string): string {
  const body = inner.trim();
  if (body.startsWith('{`') && body.endsWith('`}')) {
    const raw = body.slice(2, -2);
    return new Function(`return \`${raw}\`;`)() as string;
  }
  return body
    .replace(/&#36;/g, '$')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

export function decodeLines(value?: string): string[] {
  if (!value) return [];
  return value.split(/\r?\n/).map((l) => l.trimEnd());
}

const TAG_RE =
  /<(CodeRunner|Exercise|TypeCheck)\b((?:"[^"]*"|'[^']*'|`[^`\\]*(?:\\.[^`\\]*)*'|[^'">`])*)>([\s\S]*?)<\/\1>/g;

export interface TsFence {
  kind: 'fence';
  code: string;
  language: string;
  meta: string;
  start: number;
}

export interface TsRunner {
  kind: 'runner';
  code: string;
  strict: boolean | null;
  errors: string[];
  expected: string[];
  expectError?: string;
  skip?: string;
  start: number;
}

export interface TsExercise {
  kind: 'exercise';
  starter: string;
  tests: string;
  solution: string;
  start: number;
}

export interface TsTypeCheck {
  kind: 'typecheck';
  id: string;
  question: string;
  answer: string;
  line: number | null;
  explanation: string;
  code: string;
  start: number;
}

/** Flat parts for the Prettier format check (mirrors snippets()). */
export interface TsPart {
  code: string;
  language: string;
  start: number;
  kind: string;
}

function isTsBlock(tag: string): boolean {
  const lang = attr(tag, 'language');
  return lang === 'ts' || lang === 'typescript';
}

/** Every ts/tsx fence, with its raw meta string attached. */
export function tsFences(text: string): TsFence[] {
  const out: TsFence[] = [];
  for (const m of text.matchAll(/```(ts|tsx|typescript)([^\n]*)\n([\s\S]*?)```/g)) {
    out.push({
      kind: 'fence',
      code: m[4].trimEnd(),
      language: m[1] === 'tsx' ? 'tsx' : 'ts',
      meta: (m[2] ?? '').trim(),
      start: m.index!,
    });
  }
  return out;
}

/** Non-ts fences (js/bash/…) inside TS files still get format-checked. */
export function otherFences(
  text: string,
): Array<{ code: string; language: string; start: number; kind: string }> {
  const out: Array<{ code: string; language: string; start: number; kind: string }> = [];
  for (const m of text.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)) {
    const lang = m[1].trim().split(/\s+/)[0];
    if (lang === 'ts' || lang === 'tsx' || lang === 'typescript' || lang === '') continue;
    out.push({ code: m[2].trimEnd(), language: lang, start: m.index!, kind: 'fence' });
  }
  return out;
}

export function tsRunners(text: string): TsRunner[] {
  const out: TsRunner[] = [];
  for (const m of text.matchAll(TAG_RE)) {
    if (m[1] !== 'CodeRunner') continue;
    const tag = m[2];
    if (!isTsBlock(tag)) continue;
    const errorsAttr = attr(tag, 'errors') ?? '';
    const strictAttr = attr(tag, 'strict');
    out.push({
      kind: 'runner',
      code: evalTemplateLiteral(m[3]).replace(/^\n/, '').replace(/\s+$/, ''),
      strict: strictAttr === 'true' ? true : strictAttr === 'false' ? false : null,
      errors: errorsAttr
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter((s) => /^TS\d+$/.test(s)),
      expected: decodeLines(attr(tag, 'expect')),
      expectError: attr(tag, 'expectError'),
      skip: attr(tag, 'skipNodeCheck'),
      start: m.index!,
    });
  }
  return out;
}

export function tsExercises(text: string): TsExercise[] {
  const out: TsExercise[] = [];
  for (const m of text.matchAll(TAG_RE)) {
    if (m[1] !== 'Exercise' || !isTsBlock(m[2])) continue;
    const inner = m[3];
    const get = (name: string): string | undefined => {
      const pm = inner.match(
        new RegExp('\\b' + name + '=\\{`((?:\\\\.|[^`])*)`\\}'),
      );
      if (!pm) return undefined;
      return new Function(`return \`${pm[1]}\`;`)() as string;
    };
    const tests = get('tests');
    const solution = get('solution');
    if (tests === undefined || solution === undefined) continue;
    out.push({
      kind: 'exercise',
      starter: evalTemplateLiteral(inner).replace(/^\n/, '').replace(/\s+$/, ''),
      tests: tests.trim(),
      solution: solution.trim(),
      start: m.index!,
    });
  }
  return out;
}

export function tsTypeChecks(text: string): TsTypeCheck[] {
  const out: TsTypeCheck[] = [];
  for (const m of text.matchAll(TAG_RE)) {
    if (m[1] !== 'TypeCheck') continue;
    const tag = m[2];
    const lineAttr = attr(tag, 'line');
    out.push({
      kind: 'typecheck',
      id: attr(tag, 'id') ?? '',
      question: attr(tag, 'question') ?? '',
      answer: (attr(tag, 'answer') ?? '').toLowerCase(),
      line: lineAttr !== undefined && lineAttr !== '' ? Number(lineAttr) : null,
      explanation: attr(tag, 'explanation') ?? '',
      code: evalTemplateLiteral(m[3]).replace(/^\n/, '').replace(/\s+$/, ''),
      start: m.index!,
    });
  }
  return out;
}

export interface NarrowAssertion {
  line: number;
  path: string;
  expected: string;
}

/**
 * `// dotted.path: Expected Type` trailing assertions. Only lines with
 * real code before the comment count (so `// https://…` links never
 * match), and expectations starting with `/` are skipped for the same
 * reason.
 */
export function narrowAssertions(code: string): NarrowAssertion[] {
  const out: NarrowAssertion[] = [];
  code.split('\n').forEach((raw, i) => {
    const idx = raw.indexOf('//');
    if (idx < 0) return;
    const before = raw.slice(0, idx);
    if (before.trim().length === 0) return;
    const comment = raw.slice(idx + 2).trim();
    const m = comment.match(
      /^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*:\s*(.+)$/,
    );
    if (!m || m[2].startsWith('/')) return;
    out.push({ line: i + 1, path: m[1], expected: m[2].trim() });
  });
  return out;
}

/** Flat, Prettier-ready parts for check-snippets (TS files only). */
export function tsParts(text: string): TsPart[] {
  const out: TsPart[] = [];
  for (const f of tsFences(text))
    out.push({ code: f.code, language: f.language, start: f.start, kind: 'fence' });
  for (const f of otherFences(text))
    out.push({ code: f.code, language: f.language, start: f.start, kind: 'fence' });
  for (const m of text.matchAll(TAG_RE)) {
    const isTs = isTsBlock(m[2]);
    if (m[1] === 'TypeCheck') {
      out.push({
        code: evalTemplateLiteral(m[3]).replace(/^\n/, '').replace(/\s+$/, ''),
        language: 'ts',
        start: m.index!,
        kind: 'typecheck',
      });
      continue;
    }
    if (!isTs) continue;
    if (m[1] === 'CodeRunner') {
      out.push({
        code: evalTemplateLiteral(m[3]).replace(/^\n/, '').replace(/\s+$/, ''),
        language: 'ts',
        start: m.index!,
        kind: 'runner',
      });
    } else if (m[1] === 'Exercise') {
      out.push({
        code: evalTemplateLiteral(m[3]).replace(/^\n/, '').replace(/\s+$/, ''),
        language: 'ts',
        start: m.index!,
        kind: 'exercise',
      });
      for (const pm of m[3].matchAll(/\b(tests|solution)=\{`((?:\\.|[^`])*)`\}/g)) {
        out.push({
          code: (new Function(`return \`${pm[2]}\`;`)() as string).trim(),
          language: 'ts',
          start: (m.index ?? 0) + (pm.index ?? 0),
          kind: pm[1],
        });
      }
    }
  }
  return out;
}
