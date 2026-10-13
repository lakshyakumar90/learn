'use client';

import { useCallback, useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { HighlightedCode } from './HighlightedCode';
import { FlaskConical } from 'lucide-react';
import { useConsoleRunner } from './use-console-runner';
import { useTsCompiler } from '@/lib/use-ts-compiler';
import { findBannedTs, ASSERT_IMPL, type TsDiagnostic } from '@/lib/ts-compiler';

export interface ExerciseProps {
  title?: string;
  /**
   * Test code appended after the reader's code. Uses `assert(cond, name)`.
   * Example: `assert(total === 3, "adds three items");`
   * For TypeScript exercises, keep tests to plain assertions (they run
   * after transpile, with `assert` provided by the runner).
   */
  tests: string;
  /** Shown behind a "Show solution" reveal. */
  solution: string;
  children: string;
  preview?: string;
  solutionPreview?: string;
  /** "typescript" type-checks before running; default runs plain JavaScript. */
  language?: string;
}

/**
 * Hands-on exercise: editable starter code, a "Run tests" button that
 * executes the reader's code plus small assertions in the worker, and
 * a hidden solution.
 */
export function Exercise({ title, tests, solution, children, preview = "", solutionPreview = "", language = "javascript" }: ExerciseProps) {
  const starter = String(children ?? '').replace(/^\n/, '').replace(/\s+$/, '');
  const [code, setCode] = useState(starter);
  const [showSolution, setShowSolution] = useState(false);
  const runner = useConsoleRunner();
  const isTs = language === 'typescript' || language === 'ts';
  const ts = useTsCompiler();
  const [typeErrors, setTypeErrors] = useState<TsDiagnostic[]>([]);
  const [banned, setBanned] = useState<string[]>([]);
  const [typeBusy, setTypeBusy] = useState(false);


  const runTests = useCallback(() => {
    if (!isTs) {
      runner.run(`${code}\n${tests}`, { testMode: true });
      return;
    }
    // TypeScript: banned escape hatches fail immediately, then the
    // checker must report zero errors before tests run at all.
    void (async () => {
      const bans = findBannedTs(code);
      setBanned(bans);
      if (bans.length > 0) return;
      setTypeBusy(true);
      try {
        const unit = `${ASSERT_IMPL}${code}\n${tests}`;
        const diags = await ts.check(unit, true);
        const shown = diags
          .map((d) => ({ ...d, line: d.line - 1 }))
          .filter((d) => d.line >= 1);
        setTypeErrors(shown);
        if (shown.length > 0) return;
        const js = await ts.emit(`${code}\n${tests}`, true);
        runner.run(js, { testMode: true });
      } catch (e) {
        setTypeErrors([
          { code: 0, message: e instanceof Error ? e.message : String(e), line: 1, col: 1 },
        ]);
      } finally {
        setTypeBusy(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTs, code, tests]);

  const passed = runner.tests?.filter((t) => t.pass).length ?? 0;
  const total = runner.tests?.length ?? 0;
  const done = !runner.running && runner.tests !== undefined && !runner.error;

  return (
    <div className="my-6 rounded-xl border p-3 sm:p-4" role="group" aria-label={title ?? 'Exercise'}>
      <p className="text-sm font-semibold">{title ?? 'Try it: exercise'}</p>
      {isTs && <p className="text-xs text-[var(--code-comment)]">{ts.label(true)}</p>}
      <CodeEditor
        code={code}
        onChange={setCode}
        onRun={runTests}
        preview={preview}
        label="Your code"
        language={isTs ? 'typescript' : 'javascript'}
        lint={isTs}
        diagnostics={isTs ? typeErrors : []}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={runTests}
          disabled={runner.running || typeBusy || ts.status === 'loading'}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm transition-opacity hover:bg-stone-100 disabled:opacity-40 dark:hover:bg-stone-900"
        >
          <FlaskConical size={14} aria-hidden />
          {runner.running || typeBusy ? 'Running tests…' : 'Run tests'}
        </button>
        <button
          type="button"
          onClick={() => setShowSolution((s) => !s)}
          aria-expanded={showSolution}
          className="text-sm underline underline-offset-2 opacity-70 hover:opacity-100"
        >
          {showSolution ? 'Hide solution' : 'Show solution'}
        </button>
        {done && (
          <span
            aria-live="polite"
            className={`text-sm font-medium ${passed === total ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}
          >
            {passed} of {total} tests passing
          </span>
        )}
      </div>
      {isTs && ts.status === 'error' && (
        <p className="mt-2 rounded-lg border p-3 text-sm text-red-800 dark:text-red-300">
          {ts.loadError}
        </p>
      )}
      {isTs && banned.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 text-sm text-amber-700 dark:text-amber-300" aria-live="polite" aria-label="Style problems">
          {banned.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      {isTs && typeErrors.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 text-sm" aria-live="polite" aria-label="Type errors">
          {typeErrors.map((d, i) => (
            <li key={i} className="font-mono text-[13px] text-red-800 dark:text-red-300">
              <span className="font-semibold">TS{d.code}</span> {d.message}{' '}
              <span className="opacity-70">
                (line {d.line}, col {d.col})
              </span>
            </li>
          ))}
        </ul>
      )}
      {runner.error && (
        <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg border bg-[var(--code-bg)] p-3 font-mono text-[13px] text-red-800 dark:text-red-300 dark:bg-black">
          {typeof runner.error.line === 'number' ? `Error on line ${runner.error.line}: ` : 'Error: '}
          {runner.error.message}
        </pre>
      )}
      {done && (
        <ul className="mt-2 flex flex-col gap-1 text-sm" aria-label="Test results">
          {runner.tests!.map((t, i) => (
            <li key={i} className="flex items-start gap-2">
              <span aria-hidden>{t.pass ? '✅' : '❌'}</span>
              <span>
                <span className="sr-only">{t.pass ? 'Passed: ' : 'Failed: '}</span>
                {t.name}
              </span>
            </li>
          ))}
        </ul>
      )}
      {showSolution && (
        <div className="mt-2">
          <p className="text-xs font-medium uppercase tracking-wide opacity-60">One possible solution</p>
          <HighlightedCode code={solution} html={solutionPreview} label="solution.js" />
        </div>
      )}
    </div>
  );
}
