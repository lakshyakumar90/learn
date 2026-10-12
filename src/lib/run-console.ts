/**
 * Shared execution core for runnable JavaScript examples.
 *
 * Browser path: the runner source below is shipped INTO a Web Worker
 * created from a Blob (see `buildWorkerSource`). The helpers travel as
 * `fn.toString()` — the exact functions from `./runner-helpers`, so the
 * browser runs the same code the Node check imports.
 *
 * Node path (scripts/check-js-examples.ts): `runInNode` executes the
 * same wrapper in `node:vm` with the same helpers injected.
 *
 * Contract for every runnable console snippet:
 * - top-level `await` works; top-level `return` does not (documented
 *   under the editor).
 * - `sleep` and `fakeFetch` are always available.
 * - `setTimeout` / `clearTimeout` / `queueMicrotask` / `structuredClone`
 *   are available in both environments.
 * - output is capped at 500 lines / 100 KB; runs stop after 5 seconds.
 */

import { fakeFetch, resetHelpers, sleep } from './runner-helpers';

export const RUN_TIMEOUT_MS = 5000;
export const MAX_LINES = 500;
export const MAX_BYTES = 100 * 1024;

export type LogKind = 'log' | 'info' | 'warn' | 'error' | 'table' | 'return';

export interface OutputLine {
  kind: LogKind;
  text: string;
}

export interface RunError {
  message: string;
  /** 1-based line inside the USER snippet (wrapper offset removed). */
  line?: number;
}

export interface RunResult {
  lines: OutputLine[];
  error?: RunError;
  timeMs: number;
  truncated: boolean;
  timedOut: boolean;
}

/** Names every runner injects into the snippet scope. */
export const HELPER_NAMES = ['sleep', 'fakeFetch', 'resetHelpers'] as const;

/** Serialize any value the way the output panel shows it. */
export function formatValue(value: unknown, seen = new Set<unknown>()): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof Map) {
    if (seen.has(value)) return 'Map (circular)';
    seen.add(value);
    const entries = [...value.entries()].map(
      ([k, v]) => `${formatValue(k, seen)} => ${formatValue(v, seen)}`,
    );
    return `Map(${value.size}) { ${entries.join(', ')} }`;
  }
  if (value instanceof Set) {
    if (seen.has(value)) return `Set (circular)`;
    seen.add(value);
    return `Set(${value.size}) { ${[...value].map((v) => formatValue(v, seen)).join(', ')} }`;
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
    return `[ ${value.map((v) => formatValue(v, seen)).join(', ')} ]`;
  }
  if (typeof value === 'object') {
    if (seen.has(value)) return '{Circular}';
    seen.add(value);
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => `${k}: ${formatValue(v, seen)}`,
    );
    return `{ ${entries.join(', ')} }`;
  }
  return String(value);
}

/** Render console.table input as plain aligned text. */
export function formatTable(data: unknown): string {
  const rows: unknown[] =
    Array.isArray(data) ? data : data && typeof data === 'object' ? Object.values(data) : [data];
  if (rows.length === 0) return '(empty table)';
  const first = rows[0];
  if (first === null || typeof first !== 'object') {
    return rows.map((r, i) => `${i}  ${formatValue(r)}`).join('\n');
  }
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r as Record<string, unknown>)))];
  const head = ['(index)', ...cols];
  const body = rows.map((r, i) => [
    String(i),
    ...cols.map((c) => formatValue((r as Record<string, unknown>)[c])),
  ]);
  const widths = head.map((h, i) => Math.max(h.length, ...body.map((b) => b[i].length)));
  const pad = (s: string, i: number) => s.padEnd(widths[i], ' ');
  return [head.map(pad).join('  '), ...body.map((b) => b.map(pad).join('  '))].join('\n');
}

/**
 * Wrap user code so top-level await works in both the Worker and vm.
 * Returns the wrapper plus the 1-based line offset of the first user
 * line (used to translate stack traces back to snippet lines).
 */
export function wrapSnippet(code: string): { wrapped: string; userStartLine: number } {
  const prefix = '(async () => {\n';
  return { wrapped: `${prefix}${code}\n})()`, userStartLine: 2 };
}

/** Map a V8 stack frame line back onto the user snippet. */
export function stackLineToSnippet(stack: string, userStartLine: number): number | undefined {
  const match = stack.match(/<anonymous>:(\d+):(\d+)/) ?? stack.match(/evalmachine\.<anonymous>:(\d+)/);
  if (!match) return undefined;
  const line = Number(match[1]) - userStartLine + 1;
  return line >= 1 ? line : undefined;
}

/** Serialize the helpers for injection into a Worker/iframe (same code, everywhere). */
export function helperSource(): string {
  return [sleep.toString(), fakeFetch.toString(), resetHelpers.toString()].join('\n\n');
}

export interface TestResult {
  name: string;
  pass: boolean;
}

/**
 * Build the full Worker script: helpers + a console shim that posts
 * messages out + the user snippet wrapped for top-level await.
 *
 * testMode (used by <Exercise>): injects an `assert(cond, name)`
 * collector and reports `{ type: 'tests', results }` instead of 'done'.
 */
export function buildWorkerSource(
  code: string,
  opts: { testMode?: boolean } = {},
): { source: string; userStartLine: number } {
  const { wrapped, userStartLine } = wrapSnippet(code);
  // Lines before the user code inside the worker script. The check
  // script asserts this offset stays in sync (see HEADER_LINE_COUNT).
  const assertDecl = opts.testMode
    ? `const __results = []; function assert(cond, name) { __results.push({ pass: !!cond, name: String(name) }); }`
    : '';
  const doneLine = opts.testMode
    ? `wrapped.then(() => postMessage({ type: 'tests', results: __results, truncated: __truncated }))`
    : `wrapped.then(() => postMessage({ type: 'done', truncated: __truncated }))`;
  const header = [
    `const __META = ${JSON.stringify({ maxLines: MAX_LINES, maxBytes: MAX_BYTES })};`,
    helperSource(),
    assertDecl,
    `let __bytes = 0; let __lines = 0; let __truncated = false;`,
    `function __send(kind, text) {`,
    `  if (__truncated) return;`,
    `  __lines += 1; __bytes += text.length;`,
    `  if (__lines > __META.maxLines || __bytes > __META.maxBytes) { __truncated = true; postMessage({ type: 'truncated' }); return; }`,
    `  postMessage({ type: 'line', kind, text });`,
    `}`,
    `function __fmt(v) { try { return __formatValue(v); } catch { return String(v); } }`,
    `const console = {`,
    `  log: (...a) => __send('log', a.map(__fmt).join(' ')),`,
    `  info: (...a) => __send('info', a.map(__fmt).join(' ')),`,
    `  warn: (...a) => __send('warn', a.map(__fmt).join(' ')),`,
    `  error: (...a) => __send('error', a.map(__fmt).join(' ')),`,
    `  table: (d) => __send('table', __formatTable(d)),`,
    `  clear: () => {},`,
    `};`,
  ].join('\n');
  const footer = [
    doneLine,
    `  .catch((e) => postMessage({ type: 'error', message: String((e && e.message) || e), stack: (e && e.stack) || '' }));`,
  ].join('\n');
  // The serializers are self-recursive, so alias every self-reference
  // to the worker-side name before shipping them as source.
  const fmtSrc = formatValue.toString().replace(/\bformatValue\b/g, '__formatValue');
  const tableSrc = formatTable
    .toString()
    .replace(/\bformatTable\b/g, '__formatTable')
    .replace(/\bformatValue\b/g, '__formatValue');
  const source = [
    `const __formatValue = ${fmtSrc};`,
    `const __formatTable = ${tableSrc};`,
    header,
    `const wrapped = ${wrapped};`,
    footer,
  ].join('\n');
  // userStartLine counts from the top of the WORKER script:
  const headerLines = 2 + header.split('\n').length + 1;
  void userStartLine;
  return { source, userStartLine: headerLines + 1 };
}

/** Number of worker-script lines above the first user line. Tested. */
export function workerHeaderLineCount(): number {
  return buildWorkerSource('0').userStartLine - 1;
}

export { fakeFetch, resetHelpers, sleep };
