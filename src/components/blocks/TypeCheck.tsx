'use client';

import { useState } from 'react';
import { HighlightedCode } from './HighlightedCode';
import { CircleHelp } from 'lucide-react';
import type { TsDiagnostic } from '@/lib/ts-compiler';

export interface TypeCheckProps {
  id: string;
  question?: string;
  explanation: string;
  children: string;
  preview?: string;
  diagnostics?: TsDiagnostic[];
}

/**
 * "Will it compile?" puzzle. The reader picks Yes/No (+ the failing
 * line), then sees the REAL build-time diagnostics — embedded as static
 * data, so this page ships no compiler. The author's answer/line live
 * only in MDX source (verified by check-ts-examples), never in props.
 */
export function TypeCheck({
  id,
  question,
  explanation,
  children,
  preview = '',
  diagnostics = [],
}: TypeCheckProps) {
  const code = String(children ?? '').replace(/^\n/, '').replace(/\s+$/, '');
  const [picked, setPicked] = useState<'yes' | 'no' | null>(null);
  const [lineGuess, setLineGuess] = useState('');
  const [revealed, setRevealed] = useState(false);
  const clean = diagnostics.length === 0;
  const diagLines = [...new Set(diagnostics.map((d) => d.line))];
  const guess = lineGuess.trim() === '' ? null : Number(lineGuess);
  const lineMatches = guess === null || diagLines.includes(guess);
  const correct =
    revealed && (picked === 'yes') === clean && (clean || lineMatches);
  return (
    <div className="my-6 rounded-xl border p-3 sm:p-4" role="group" aria-label={question || 'Will it compile?'}>
      <p className="text-sm font-semibold">
        {question || 'Will it compile?'}{' '}
        <span className="font-normal opacity-60">— decide first, then reveal.</span>
      </p>
      <div className="mt-2">
        <HighlightedCode code={code} html={preview} label="check.ts" />
      </div>
      {!revealed && (
        <div className="mt-3">
          <div className="flex gap-1.5" role="radiogroup" aria-label="Your prediction">
            {(['yes', 'no'] as const).map((opt) => (
              <label
                key={opt}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm capitalize ${
                  picked === opt ? 'border-current font-medium' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <input
                  type="radio"
                  name={`typecheck-${id}`}
                  checked={picked === opt}
                  onChange={() => setPicked(opt)}
                  className="accent-current"
                />
                {opt}
              </label>
            ))}
          </div>
          <label className="mt-2 block text-sm">
            <span className="mb-1 block opacity-70">
              Which line fails? (only if you answered No)
            </span>
            <input
              type="number"
              min={1}
              value={lineGuess}
              onChange={(e) => setLineGuess(e.target.value)}
              className="w-28 rounded-lg border bg-transparent p-2 font-mono text-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => setRevealed(true)}
            disabled={picked === null}
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm transition-opacity hover:bg-stone-100 disabled:opacity-40 dark:hover:bg-stone-900"
          >
            <CircleHelp size={14} aria-hidden /> Reveal the diagnostics
          </button>
        </div>
      )}
      {revealed && (
        <div className="mt-3 flex flex-col gap-2">
          <div aria-live="polite" className="rounded-lg border bg-[var(--code-bg)] p-3 text-sm dark:bg-black">
            {clean ? (
              <p className="font-medium text-green-700 dark:text-green-300">
                It compiles clean — no diagnostics.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {diagnostics.map((d, i) => (
                  <li key={i} className="font-mono text-[13px] text-red-800 dark:text-red-300">
                    <span className="font-semibold">TS{d.code}</span> {d.message}{' '}
                    <span className="opacity-70">
                      (line {d.line}, col {d.col})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p
            className={`text-sm font-medium ${correct ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}
          >
            {correct
              ? 'Your prediction matches. Nice.'
              : clean
                ? 'Not quite — it compiles clean.'
                : !lineMatches
                  ? 'Not quite — that is not the failing line.'
                  : 'Not quite — compare with the real diagnostics above.'}
          </p>
          <div className="rounded-lg border p-3 text-sm leading-relaxed">
            <p className="font-semibold">Why this happens</p>
            <p className="mt-1 opacity-90">{explanation}</p>
          </div>
          <button
            type="button"
            onClick={() => {
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
