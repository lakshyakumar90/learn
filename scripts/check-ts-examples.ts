/**
 * Compile every TypeScript snippet with the PINNED sandbox compiler and
 * verify behavior by transpiling + running in Node. FAILS the build on:
 * - the installed sandbox compiler differing from SANDBOX_TS_VERSION,
 * - a ts/tsx fence that is not clean unless its meta declares exactly
 *   the error codes produced (fence meta also supports strict=false;
 *   an @ts-expect-error that suppresses nothing surfaces as TS2578 and
 *   therefore fails the exact match),
 * - a <CodeRunner language="typescript"> whose diagnostics differ from
 *   its errors="..." list, whose transpiled output differs from expect,
 *   or that uses import/export (no module loader in the sandbox),
 * - an <Exercise language="typescript"> whose solution is not clean,
 *   uses a banned escape hatch (any, @ts-ignore, @ts-expect-error,
 *   non-null assertion), or whose tests do not pass on the solution /
 *   fail on the starter,
 * - a <TypeCheck> whose yes/no (+line) answer disagrees with the real
 *   diagnostics (answers are embedded to generated/ts-typechecks.json),
 * - a `// path: Type` narrowing assertion the compiler disagrees with,
 * - a <Predict> in the TypeScript topic (use <TypeCheck>: Predict runs
 *   the JavaScript worker and cannot see types).
 *
 * Mirror of check-js-examples.ts for the 6.x compiler. Runnable output
 * uses the same vm + helpers via scripts/snippet-run.
 *
 * Usage: pnpm check-ts-examples (runs in `prebuild`).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript6';
import {
  SANDBOX_TS_VERSION,
  createTsProgram,
  findBannedTs,
  findImportExport,
  narrowedTypeAtLine,
  parseFenceMeta,
  transpileTs,
  type TsDiagnostic,
} from '../src/lib/ts-compiler';
import { runInNode } from './snippet-run';
import {
  TS_ROOT,
  attr,
  evalTemplateLiteral,
  narrowAssertions,
  tsExercises,
  tsFences,
  tsRunners,
  tsTypeChecks,
  tsMdxFiles,
} from './typescript-content';

void TS_ROOT;

const ROOT = join(__dirname, '..');
const KITCHEN_SINK = join(ROOT, 'src', 'app', '%5Fkitchen-sink', 'page.tsx');

const errors: string[] = [];
let checked = 0;
const fail = (message: string) => errors.push(message);
const rel = (f: string) => relative(ROOT, f);

let LIB_DIR = '';

function getLib(base: string): string | undefined {
  const full = join(LIB_DIR, base);
  if (!existsSync(full)) return undefined;
  try {
    return readFileSync(full, 'utf8');
  } catch {
    return undefined;
  }
}

function diagString(d: TsDiagnostic): string {
  return `TS${d.code} at ${d.line}:${d.col}: ${d.message}`;
}

function checkCode(
  code: string,
  strict: boolean,
): { diagnostics: TsDiagnostic[] } {
  return createTsProgram(ts, code, strict, getLib);
}

function codesOf(diagnostics: TsDiagnostic[]): string[] {
  return [...new Set(diagnostics.map((d) => `TS${d.code}`))].sort();
}

function expectCodes(what: string, diagnostics: TsDiagnostic[], want: string[]): void {
  const got = codesOf(diagnostics);
  const wantSorted = [...want].sort();
  if (JSON.stringify(got) !== JSON.stringify(wantSorted)) {
    fail(
      `${what} diagnostics mismatch.\n--- want ---\n${wantSorted.join(', ') || '(clean)'}\n--- got ---\n${got.join(', ') || '(clean)'}\n${diagnostics.map(diagString).join('\n')}`,
    );
  }
}

function checkNarrows(label: string, code: string, strict: boolean): void {
  for (const a of narrowAssertions(code)) {
    const actual = narrowedTypeAtLine(ts, code, strict, a.line, a.path);
    if (actual === undefined) {
      fail(`${label}: narrowing assertion "${a.path}" on line ${a.line} matches no node`);
    } else if (actual !== a.expected) {
      fail(
        `${label}: narrowing assertion on line ${a.line} mismatch.\n--- want ---\n${a.path}: ${a.expected}\n--- got ---\n${a.path}: ${actual}`,
      );
    }
  }
}

/** `assert` exists in the Exercise worker; declare it for typechecking. */
const ASSERT_DECL =
  'function assert(cond: unknown, name: string): void { if (!cond) { throw new Error("Assertion failed: " + name); } }\n';

async function checkContent(
  label: string,
  text: string,
  typechecks: Record<string, { diagnostics: TsDiagnostic[] }>,
  forbidPredict: boolean,
): Promise<void> {
  if (forbidPredict && /<Predict\b/.test(text)) {
    fail(`${label}: use <TypeCheck>, not <Predict> — Predict runs the JavaScript worker and cannot see types`);
  }

  for (const f of tsFences(text)) {
    checked += 1;
    const meta = parseFenceMeta(f.meta);
    const strict = meta.strict ?? true;
    const { diagnostics } = checkCode(f.code, strict);
    expectCodes(`${label} fence@${f.start}`, diagnostics, meta.errors);
    checkNarrows(label, f.code, strict);
  }

  for (const r of tsRunners(text)) {
    checked += 1;
    const where = `${label} <CodeRunner>@${r.start}`;
    const strict = r.strict ?? true;
    const banned = findImportExport(r.code);
    if (banned.length > 0) {
      fail(`${where}: ${banned.join('; ')}`);
      continue;
    }
    const { diagnostics } = checkCode(r.code, strict);
    expectCodes(where, diagnostics, r.errors);
    checkNarrows(label, r.code, strict);
    if (r.skip) continue;
    const run = await runInNode(transpileTs(ts, r.code));
    if (run.error) {
      if (r.expectError && run.error.includes(r.expectError)) continue;
      fail(`${where} threw in Node: ${run.error}`);
      continue;
    }
    if (r.expectError) {
      fail(`${where} declares expectError but ran clean in Node`);
      continue;
    }
    if (r.expected.length === 0) {
      fail(`${where} has no expect="..." to compare against`);
      continue;
    }
    const actual = run.lines.join('\n');
    const want = r.expected.join('\n');
    if (actual !== want) {
      fail(`${where} output mismatch.\n--- want ---\n${want}\n--- got ---\n${actual}`);
    }
  }

  for (const ex of tsExercises(text)) {
    const where = `${label} <Exercise>@${ex.start}`;
    const bannedAll = findImportExport(ex.starter + '\n' + ex.tests + '\n' + ex.solution);
    if (bannedAll.length > 0) {
      fail(`${where}: ${bannedAll.join('; ')}`);
      continue;
    }
    // Solutions must earn a clean check with no escape hatches.
    const solDiags = checkCode(ASSERT_DECL + ex.solution + '\n' + ex.tests, true).diagnostics;
    const banned = findBannedTs(ex.solution);
    if (solDiags.length > 0) {
      fail(`${where} solution has type errors:\n${solDiags.map(diagString).join('\n')}`);
      continue;
    }
    if (banned.length > 0) {
      fail(`${where} solution ${banned.join('; ')}`);
      continue;
    }
    const assertion =
      'const assert = (condition, name) => { if (!condition) throw new Error("Assertion failed: " + name); };\n';
    const solved = await runInNode(transpileTs(ts, assertion + ex.solution + '\n' + ex.tests));
    const broken = await runInNode(transpileTs(ts, assertion + ex.starter + '\n' + ex.tests));
    checked += 2;
    if (solved.error) fail(`${where}: exercise solution failed: ${solved.error}`);
    if (!broken.error) {
      // A type-clean but behaviorally-broken starter fails at runtime;
      // a type-broken starter must fail the check instead.
      const starterDiags = checkCode(ASSERT_DECL + ex.starter + '\n' + ex.tests, true).diagnostics;
      if (starterDiags.length === 0) {
        fail(`${where}: exercise starter must fail a behavioral test or the type check`);
      }
    }
  }

  for (const t of tsTypeChecks(text)) {
    checked += 1;
    const where = `${label} <TypeCheck id="${t.id}">`;
    if (!t.id) fail(`${label}: <TypeCheck> is missing id="..."`);
    if (t.answer !== 'yes' && t.answer !== 'no') {
      fail(`${where}: answer must be "yes" or "no"`);
      continue;
    }
    if (t.id && typechecks[t.id]) fail(`${where}: duplicate TypeCheck id "${t.id}"`);
    const { diagnostics } = checkCode(t.code, true);
    const clean = diagnostics.length === 0;
    if (t.answer === 'yes' && !clean) {
      fail(`${where} answers "yes" but the compiler reports:\n${diagnostics.map(diagString).join('\n')}`);
      continue;
    }
    if (t.answer === 'no' && clean) {
      fail(`${where} answers "no" but the snippet is clean`);
      continue;
    }
    if (t.answer === 'no' && t.line !== null) {
      const lines = new Set(diagnostics.map((d) => d.line));
      if (!lines.has(t.line)) {
        fail(
          `${where} claims line ${t.line} fails, but errors are on line(s) ${[...lines].join(', ')}:\n${diagnostics.map(diagString).join('\n')}`,
        );
        continue;
      }
    }
    if (t.id) typechecks[t.id] = { diagnostics };
    checkNarrows(label, t.code, true);
  }
}

async function main(): Promise<void> {
  if (ts.version !== SANDBOX_TS_VERSION) {
    console.error(
      `check-ts-examples: sandbox compiler is ${ts.version}, expected ${SANDBOX_TS_VERSION} — update the pin and the SANDBOX_TS_VERSION config value together.`,
    );
    process.exit(1);
  }
  try {
    const req = createRequire(join(ROOT, 'scripts', 'check-ts-examples.ts'));
    const stub = req.resolve('typescript6');
    const req2 = createRequire(stub);
    LIB_DIR = join(req2.resolve('@typescript/old/package.json'), '..', 'lib');
  } catch (e) {
    console.error(`check-ts-examples: cannot resolve sandbox lib dir (${(e as Error).message})`);
    process.exit(1);
  }
  const typechecks: Record<string, { diagnostics: TsDiagnostic[] }> = {};
  for (const file of tsMdxFiles()) {
    await checkContent(rel(file), readFileSync(file, 'utf8'), typechecks, true);
  }
  if (existsSync(KITCHEN_SINK)) {
    await checkContent('kitchen-sink', readFileSync(KITCHEN_SINK, 'utf8'), typechecks, false);
  }
  void attr;
  void evalTemplateLiteral;
  mkdirSync(join(ROOT, 'generated'), { recursive: true });
  writeFileSync(join(ROOT, 'generated', 'ts-typechecks.json'), JSON.stringify(typechecks, null, 2) + '\n');
  console.log(`check-ts-examples: ${checked} snippet(s) with TypeScript ${ts.version}.`);
  if (errors.length > 0) {
    for (const e of errors) console.error(`\nFAIL ${e}`);
    console.error(`\ncheck-ts-examples: ${errors.length} failure(s).`);
    process.exit(1);
  }
  console.log('check-ts-examples: OK.');
}

void main();
