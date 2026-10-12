/**
 * Single source of truth for the TypeScript sandbox compiler.
 *
 * STRATEGY (verified against the official TypeScript release notes and
 * blog, October 2026):
 * - TypeScript 7.0 (Go port, released July 8, 2026) ships NO stable
 *   JavaScript API; a new, different API is planned for 7.1, which has
 *   not shipped yet. Anything needing a programmatic compiler must use
 *   the 6.x line.
 * - Microsoft's recommended path is the `@typescript/typescript6`
 *   compatibility package (re-exports the 6.0 API plus a `tsc6` binary)
 *   side-by-side with 7.x. We follow it: `typescript6` is an npm alias
 *   for `@typescript/typescript6@6.0.2`, which bundles compiler 6.0.3.
 * - The site's own TypeScript stays 5.9.3 (`tsc`, eslint, Fumadocs are
 *   untouched); the alias name can never collide with `typescript`.
 *
 * This module is deliberately LIGHT: type-only imports, pure functions.
 * Nothing here may import the compiler at runtime, so pages that display
 * the version never ship it. The worker and the build check import
 * `typescript6` themselves.
 */

import type * as ts from 'typescript6';

export const SANDBOX_TS_VERSION = '6.0.3';
export const SANDBOX_TS_ALIAS = 'typescript6';

/** Public URL prefix for the vendored lib .d.ts files (see vendor-ts-libs). */
export const SANDBOX_TS_LIB_DIR = `/ts-libs/${SANDBOX_TS_VERSION}`;

export interface SandboxTsOptions {
  /** strict on/off; fence meta or the strict prop can override per snippet. */
  strict: boolean;
}

export const SANDBOX_TS_DEFAULTS = {
  strict: true,
  target: 'ES2022',
  module: 'ESNext',
  lib: ['ES2022', 'DOM'],
  noEmitOnError: false,
} as const;

export interface TsDiagnostic {
  /** Numeric code, e.g. 2322 for "Type 'string' is not assignable…". */
  code: number;
  message: string;
  /** 1-based line and column inside the USER snippet. */
  line: number;
  col: number;
}

export interface FenceOverride {
  /** Declared error codes, e.g. ["TS2322"]. Empty means "must be clean". */
  errors: string[];
  /** Per-snippet strict override; null means "use the default". */
  strict: boolean | null;
}

/**
 * Parse fenced-code meta such as `{error="TS2322"}` or
 * `{error="TS2322,TS2345" strict=false}`. Unknown keys are ignored so
 * Shiki transformers keep working.
 */
export function parseFenceMeta(meta: string): FenceOverride {
  const out: FenceOverride = { errors: [], strict: null };
  for (const m of meta.matchAll(/(\w+)=("[^"]*"|[^\s}]+)/g)) {
    const value = m[2].replace(/^"|"$/g, '');
    if (m[1] === 'error') {
      out.errors = value
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter((s) => /^TS\d+$/.test(s));
    } else if (m[1] === 'strict') {
      if (value === 'true') out.strict = true;
      else if (value === 'false') out.strict = false;
    }
  }
  return out;
}

/** Strip comments and string literals so bans inspect code, not prose. */
function stripNonCode(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^\n])\/\/[^\n]*/g, '$1 ')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

const BANNED_TS_IN_CODE: Array<{ re: RegExp; why: string }> = [
  { re: /\bany\b/, why: 'uses `any` — solve it with a precise type instead' },
  {
    re: /[A-Za-z0-9_$\]\)'"]\s*!(?![=!])/,
    why: 'uses a non-null assertion (`!`) — narrow the type instead',
  },
];

/**
 * Returns human reasons when code leans on escape hatches. Suppression
 * comments are read from the raw source (they ARE comments); type-level
 * bans run on stripped code so prose never trips them. Used by the
 * TypeScript Exercise (client) and by check-ts-examples (build) on
 * solutions — starters are SUPPOSED to have type errors, but solutions
 * must earn a clean check.
 */
export function findBannedTs(code: string): string[] {
  const out: string[] = [];
  if (/@ts-ignore/.test(code))
    out.push('uses `@ts-ignore`, which silences the checker');
  if (/@ts-expect-error/.test(code))
    out.push('uses `@ts-expect-error`, which silences the checker');
  const clean = stripNonCode(code);
  for (const { re, why } of BANNED_TS_IN_CODE) {
    if (re.test(clean)) out.push(why);
  }
  return out;
}

/** One-line label shown in the sandbox and on example pages. */
export function compilerLabel(strict: boolean | null = null): string {
  const mode = strict === null || strict ? 'strict mode' : 'strict off';
  return `Checked with TypeScript ${SANDBOX_TS_VERSION}, ${mode}`;
}

/**
 * Real compiler options from the plain-data defaults. Takes the runtime
 * module as a parameter so this file never imports the compiler itself.
 */
export function resolveTsOptions(
  tsMod: typeof ts,
  strict: boolean,
): Record<string, unknown> {
  return {
    strict,
    target: tsMod.ScriptTarget.ES2022,
    module: tsMod.ModuleKind.ESNext,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
    noEmitOnError: false,
    skipLibCheck: true,
  };
}

export interface TsProgram {
  diagnostics: TsDiagnostic[];
  emitJs: () => string;
}

/**
 * Check + emit for one in-memory file, backed by any lib provider
 * (vendored fetch in the worker, node_modules reads at build time).
 * Returns diagnostics first (never throws for user code).
 */
export function createTsProgram(
  tsMod: typeof ts,
  code: string,
  strict: boolean,
  getLib: (baseName: string) => string | undefined,
): TsProgram {
  const file = '/snippet.ts';
  const options = resolveTsOptions(tsMod, strict) as Parameters<
    typeof ts.createProgram
  >[1];
  const baseHost = tsMod.createCompilerHost(options);
  const host: ts.CompilerHost = {
    ...baseHost,
    getSourceFile: (name, lang, ...rest) => {
      if (name === file) return tsMod.createSourceFile(name, code, lang, true);
      const lib = getLib(name.split('/').pop()!);
      if (lib !== undefined)
        return tsMod.createSourceFile(name, lib, lang, true);
      try {
        return baseHost.getSourceFile(name, lang, ...rest);
      } catch {
        return undefined;
      }
    },
    fileExists: (name) => {
      if (name === file || getLib(name.split('/').pop()!) !== undefined)
        return true;
      try {
        return baseHost.fileExists(name);
      } catch {
        return false;
      }
    },
    readFile: (name) => {
      if (name === file) return code;
      const lib = getLib(name.split('/').pop()!);
      if (lib !== undefined) return lib;
      try {
        return baseHost.readFile(name);
      } catch {
        return undefined;
      }
    },
    getDefaultLibFileName: () => 'lib.es2022.d.ts',
    getCurrentDirectory: () => '/',
    getCanonicalFileName: (f) => f,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };
  const program = tsMod.createProgram([file], options, host);
  const source = program.getSourceFile(file)!;
  const toDiag = (d: ts.Diagnostic): TsDiagnostic => {
    const pos =
      d.file && d.start !== undefined
        ? d.file.getLineAndCharacterOfPosition(d.start)
        : { line: 0, character: 0 };
    return {
      code: d.code,
      message: tsMod.flattenDiagnosticMessageText(d.messageText, ' '),
      line: pos.line + 1,
      col: pos.character + 1,
    };
  };
  const diagnostics = [
    ...program.getSyntacticDiagnostics(source),
    ...program.getSemanticDiagnostics(source),
  ].map(toDiag);
  const emitJs = (): string => {
    let js = '';
    program.emit(
      source,
      (name, text) => {
        if (name.endsWith('.js')) js = text;
      },
      undefined,
      false,
    );
    return js;
  };
  return { diagnostics, emitJs };
}

/**
 * Transpile-only emit for running (no type info needed). Kept separate
 * from createTsProgram so the console worker path stays obvious.
 */
export function transpileTs(
  tsMod: typeof ts,
  code: string,
): string {
  return tsMod.transpileModule(code, {
    compilerOptions: {
      target: tsMod.ScriptTarget.ES2022,
      module: tsMod.ModuleKind.CommonJS,
    },
  }).outputText;
}

/** The sandbox has no module loader: imports/exports fail loudly. */
export function findImportExport(code: string): string[] {
  const problems: string[] = [];
  const clean = stripNonCode(code);
  if (/^\s*import\b/m.test(clean))
    problems.push('uses `import` — the sandbox has no module loader');
  if (/^\s*export\b/m.test(clean))
    problems.push('uses `export` — the sandbox has no module loader');
  return problems;
}

/**
 * Resolve a `// path.to.thing: Expected Type` assertion on one line:
 * finds the matching identifier/property-access node and returns the
 * compiler's display string for its type.
 */
export function narrowedTypeAtLine(
  tsMod: typeof ts,
  code: string,
  strict: boolean,
  line: number,
  path: string,
): string | undefined {
  const file = '/snippet.ts';
  const options = resolveTsOptions(tsMod, strict) as Parameters<
    typeof ts.createProgram
  >[1];
  const source = tsMod.createSourceFile(file, code, tsMod.ScriptTarget.ES2022, true);
  // A bare source file is enough: narrowing assertions only need the
  // checker over user code, and lib gaps would only add noise.
  const host: ts.CompilerHost = {
    ...tsMod.createCompilerHost(options),
    getSourceFile: (name, lang) =>
      name === file
        ? source
        : tsMod.createSourceFile(name, '', lang, true),
    fileExists: () => true,
    readFile: () => '',
    getDefaultLibFileName: () => 'lib.es2022.d.ts',
    getCurrentDirectory: () => '/',
    getCanonicalFileName: (f) => f,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };
  const program = tsMod.createProgram([file], options, host);
  const checker = program.getTypeChecker();
  let found: string | undefined;
  const visit = (node: ts.Node): void => {
    if (found !== undefined) return;
    const start = source.getLineAndCharacterOfPosition(node.getStart(source));
    if (start.line + 1 === line && node.getText(source) === path) {
      found = checker.typeToString(checker.getTypeAtLocation(node));
      return;
    }
    tsMod.forEachChild(node, visit);
  };
  visit(source);
  return found;
}
