'use client';

import { useCallback, useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { HighlightedCode } from './HighlightedCode';
import { FlaskConical } from 'lucide-react';
import { useConsoleRunner } from './use-console-runner';

export interface ExerciseProps {
  title?: string;
  /**
   * Test code appended after the reader's code. Uses `assert(cond, name)`.
   * Example: `assert(total === 3, "adds three items");`
   */
  tests: string;
  /** Shown behind a "Show solution" reveal. */
  solution: string;
  children: string;
  preview?: string;
  solutionPreview?: string;
}

/**
 * Hands-on exercise: editable starter code, a "Run tests" button that
 * executes the reader's code plus small assertions in the worker, and
 * a hidden solution.
 */
export function Exercise({ title, tests, solution, children, preview = "", solutionPreview = "" }: ExerciseProps) {
  const starter = String(children ?? '').replace(/^\n/, '').replace(/\s+$/, '');
  const [code, setCode] = useState(starter);
  const [showSolution, setShowSolution] = useState(false);
  const runner = useConsoleRunner();


  const runTests = useCallback(() => {
    runner.run(`${code}\n${tests}`, { testMode: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, tests]);

  const passed = runner.tests?.filter((t) => t.pass).length ?? 0;
  const total = runner.tests?.length ?? 0;
  const done = !runner.running && runner.tests !== undefined && !runner.error;

  return (
    <div className="my-6 rounded-xl border p-3 sm:p-4" role="group" aria-label={title ?? 'Exercise'}>
      <p className="text-sm font-semibold">{title ?? 'Try it: exercise'}</p>
      <CodeEditor code={code} onChange={setCode} onRun={runTests} preview={preview} label="Your code" />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={runTests}
          disabled={runner.running}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm transition-opacity hover:bg-stone-100 disabled:opacity-40 dark:hover:bg-stone-900"
        >
          <FlaskConical size={14} aria-hidden />
          {runner.running ? 'Running tests…' : 'Run tests'}
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
