'use client';

import { useState } from 'react';
import { HighlightedCode } from './HighlightedCode';
import { Eye } from 'lucide-react';
import { useConsoleRunner } from './use-console-runner';

export interface PredictProps {
  title?: string;
  /** Reader picks one of these BEFORE running (choice mode). */
  options?: string[];
  /** Index into `options` that actually happens. */
  answer?: number;
  /**
   * Expected console lines, separated by \n. Shown after reveal and
   * compared at build time. Required in free-text mode.
   */
  answerLines?: string;
  /** Explanation shown after the reveal. */
  explanation: string;
  children: string;
  preview?: string;
}

function decodeLines(value?: string): string[] {
  if (!value) return [];
  return value.split('\\n').map((l) => l.replace(/\\n/g, '\n'));
}

function normalize(text: string): string {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join('\n');
}

/**
 * Guess-the-output exercise. The reader commits to a prediction first;
 * the reveal always shows the REAL runner output, never a stored answer.
 */
export function Predict({ title, options, answer, answerLines, explanation, children, preview = "" }: PredictProps) {
  const code = String(children ?? '').replace(/^\n/, '').replace(/\s+$/, '');
  const expected = decodeLines(answerLines);
  const choiceMode = Array.isArray(options) && options.length > 0;
  const groupName = `predict-${(title ?? code).replace(/[^a-z0-9]+/gi, '-').slice(0, 24)}`;
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [revealed, setRevealed] = useState(false);
  const runner = useConsoleRunner();

  const canReveal =
    !revealed && (choiceMode ? picked !== null : typed.trim().length > 0) && !runner.running;

  const reveal = () => {
    if (!canReveal) return;
    runner.run(code);
    setRevealed(true);
  };

  const actual = normalize(runner.lines.map((l) => l.text).join('\n'));
  const verdict = choiceMode
    ? picked === answer
      ? 'correct'
      : 'incorrect'
    : expected.length > 0 && normalize(expected.join('\n')) === actual
      ? 'correct'
      : 'incorrect';

  return (
    <div className="my-6 rounded-xl border p-3 sm:p-4" role="group" aria-label={title ?? 'Predict the output'}>
      <p className="text-sm font-semibold">
        {title ?? 'Predict the output'}{' '}
        <span className="font-normal opacity-60">— guess first, then reveal.</span>
      </p>
      <HighlightedCode code={code} html={preview} label="predict.js" />
      {!revealed && (
        <div className="mt-3">
          {choiceMode ? (
            <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Your prediction">
              {options!.map((opt, i) => (
                <label
                  key={i}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                    picked === i ? 'border-current font-medium' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <input
                    type="radio"
                    name={groupName}
                    checked={picked === i}
                    onChange={() => setPicked(i)}
                    className="mt-1 accent-current"
                  />
                  <span className="font-mono">{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <label className="block text-sm">
              <span className="mb-1 block opacity-70">Type the output, one line at a time:</span>
              <textarea
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                rows={Math.max(2, expected.length)}
                spellCheck={false}
                className="w-full rounded-lg border bg-[var(--dg-node-bg)] p-2.5 font-mono text-base"
              />
            </label>
          )}
          <button
            type="button"
            onClick={reveal}
            disabled={!canReveal}
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm transition-opacity hover:bg-stone-100 disabled:opacity-40 dark:hover:bg-stone-900"
          >
            <Eye size={14} aria-hidden /> Reveal the real output
          </button>
        </div>
      )}
      {revealed && (
        <div className="mt-3 flex flex-col gap-2">
          <div
            aria-live="polite"
            className="rounded-lg border bg-[var(--code-bg)] p-3 font-mono text-base text-[var(--code-fg)] dark:bg-black"
          >
            {runner.running && runner.lines.length === 0 && <span className="opacity-70">Running…</span>}
            {runner.lines.map((l, i) => (
              <pre key={i} className="whitespace-pre-wrap break-words">{l.text}</pre>
            ))}
            {runner.error && (
              <pre className="whitespace-pre-wrap break-words text-red-300">
                Error: {runner.error.message}
              </pre>
            )}
          </div>
          {!runner.running && (
            <p
              className={`text-sm font-medium ${verdict === 'correct' ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}
            >
              {verdict === 'correct'
                ? 'Your prediction matches. Nice.'
                : choiceMode
                  ? 'Not quite — compare with the real output above.'
                  : 'Not quite — compare each line with the real output above.'}
            </p>
          )}
          <div className="rounded-lg border p-3 text-sm leading-relaxed">
            <p className="font-semibold">Why this happens</p>
            <p className="mt-1 opacity-90">{explanation}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              runner.reset();
              setRevealed(false);
            }}
            className="self-start text-sm underline underline-offset-2 opacity-70 hover:opacity-100"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
