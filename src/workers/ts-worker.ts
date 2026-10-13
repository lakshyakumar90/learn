/**
 * TypeScript sandbox worker. Bundled as its own chunk (it embeds the
 * ~9 MB pinned compiler), created ONLY on first Check/Run — never on
 * page load. Fetches vendored lib .d.ts files on demand and caches them.
 *
 * Protocol (both directions carry `id`):
 * - { type: 'check', code, strict } -> { type: 'checked', diagnostics }
 * - { type: 'emit', code, strict }  -> { type: 'emitted', js }
 */
import ts from 'typescript6';
import {
  SANDBOX_TS_LIB_DIR,
  createTsProgram,
  transpileTs,
  type TsDiagnostic,
} from '../lib/ts-compiler';

interface CheckMsg {
  id: number;
  type: 'check';
  code: string;
  strict: boolean;
}
interface EmitMsg {
  id: number;
  type: 'emit';
  code: string;
  strict: boolean;
}
type InMsg = CheckMsg | EmitMsg;

const libCache = new Map<string, string>();

async function libText(base: string): Promise<string | undefined> {
  if (!libCache.has(base)) {
    try {
      const res = await fetch(`${SANDBOX_TS_LIB_DIR}/${base}`);
      if (!res.ok) return undefined;
      libCache.set(base, await res.text());
    } catch {
      return undefined;
    }
  }
  return libCache.get(base);
}

async function diagnose(
  code: string,
  strict: boolean,
): Promise<TsDiagnostic[]> {
  // Preload the exact lib closure: roots first, then whatever each
  // file references, until fixpoint. Typically ~15 files, not 107.
  const queue = ['lib.es2022.d.ts', 'lib.dom.d.ts'];
  const seen = new Set<string>();
  while (queue.length > 0) {
    const name = queue.pop()!;
    if (seen.has(name)) continue;
    seen.add(name);
    const text = await libText(name);
    if (text === undefined) continue;
    // References use bare names (lib="es2021"); files are lib.*.d.ts.
    for (const m of text.matchAll(/<reference\s+lib="([^"]+)"/g)) {
      const file = m[1].endsWith('.d.ts') ? m[1] : `lib.${m[1]}.d.ts`;
      if (!seen.has(file)) queue.push(file);
    }
  }
  // Without the roots every global collapses to `any` and bad code
  // reports clean — fail loudly instead of lying about the check.
  for (const root of ['lib.es2022.d.ts', 'lib.dom.d.ts']) {
    if (!libCache.has(root)) {
      throw new Error(
        `Could not load the compiler library file ${root}. Check your connection and try again.`,
      );
    }
  }
  return createTsProgram(ts, code, strict, (base) => libCache.get(base))
    .diagnostics;
}

function emitJs(code: string): string {
  return transpileTs(ts, code);
}

self.addEventListener('message', async (e: MessageEvent<InMsg>) => {
  const msg = e.data;
  try {
    if (msg.type === 'check') {
      const diagnostics = await diagnose(msg.code, msg.strict);
      self.postMessage({ id: msg.id, type: 'checked', diagnostics });
    } else {
      self.postMessage({ id: msg.id, type: 'emitted', js: emitJs(msg.code) });
    }
  } catch (err) {
    console.error('[ts-worker]', err);
    self.postMessage({
      id: msg.id,
      type: 'worker-error',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});
