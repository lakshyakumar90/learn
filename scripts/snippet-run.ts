/**
 * Shared snippet-running core for the build checks. check-js-examples
 * (plain JavaScript) and check-ts-examples (transpiled TypeScript) both
 * execute through runInNode, so browser/Node parity rules live here once.
 *
 * Moved verbatim out of check-js-examples.ts; behavior unchanged.
 */
import { createContext, runInContext } from 'node:vm';
import { fakeFetch, resetHelpers, sleep } from '../src/lib/runner-helpers';
import { formatTable, formatValue, wrapSnippet } from '../src/lib/run-console';

export interface NodeRun {
  lines: string[];
  error?: string;
}

export function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  if (!match) return undefined;
  // JSX attribute escapes, mirroring MDX evaluation.
  return match[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

export function decodeLines(value?: string): string[] {
  if (!value) return [];
  return value.split(/\r?\n/).map((l) => l.trimEnd());
}

export function evalTemplateLiteral(inner: string): string {
  const body = inner.trim();
  if (body.startsWith('{`') && body.endsWith('`}')) {
    const raw = body.slice(2, -2);
    // Evaluate exactly like MDX does. Content files are trusted
    // first-party source; only ${'$'}-style escapes appear in practice.
    return new Function(`return \`${raw}\`;`)() as string;
  }
  return body
    .replace(/&#36;/g, '$')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

export async function runInNode(code: string, timeoutMs = 5000): Promise<NodeRun> {
  resetHelpers();
  const lines: string[] = [];
  const timers = new Set<NodeJS.Timeout>();
  const intervals = new Set<NodeJS.Timeout>();
  const trackTimeout = (fn: (...a: never[]) => void, ms?: number) => {
    const t = setTimeout((...a) => {
      timers.delete(t);
      fn(...a);
    }, ms);
    timers.add(t);
    return t;
  };
  const sandbox = {
    console: {
      log: (...a: unknown[]) => lines.push(a.map((v) => formatValue(v)).join(' ')),
      info: (...a: unknown[]) => lines.push(a.map((v) => formatValue(v)).join(' ')),
      warn: (...a: unknown[]) => lines.push(a.map((v) => formatValue(v)).join(' ')),
      error: (...a: unknown[]) => lines.push(a.map((v) => formatValue(v)).join(' ')),
      table: (d: unknown) => lines.push(...formatTable(d).split('\n')),
      clear: () => {},
    },
    sleep,
    fakeFetch,
    resetHelpers,
    setTimeout: trackTimeout,
    clearTimeout: (t: NodeJS.Timeout) => {
      clearTimeout(t);
      timers.delete(t);
    },
    setInterval: (fn: (...a: never[]) => void, ms?: number) => {
      const t = setInterval(fn, ms);
      intervals.add(t);
      return t;
    },
    clearInterval: (t: NodeJS.Timeout) => {
      clearInterval(t);
      intervals.delete(t);
    },
    queueMicrotask,
    structuredClone,
    URL,
    AbortController,
    performance,
    ReadableStream,
    WritableStream,
    TransformStream,
    TextEncoder,
    TextDecoder,
  };
  const context = createContext(sandbox);
  const { wrapped } = wrapSnippet(code);
  try {
    const result = runInContext(wrapped, context, { timeout: 2000 }) as Promise<unknown>;
    await Promise.race([
      // The snippet promise settles before due timers fire — grant a
      // grace beat so setTimeout(0) and fakeFetch latency flush.
      result.then(() => new Promise((resolve) => setTimeout(resolve, 500))),
      new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)),
    ]);
  } catch (e) {
    return { lines, error: (e as Error).message };
  } finally {
    for (const t of timers) clearTimeout(t);
    for (const t of intervals) clearInterval(t);
  }
  return { lines };
}
