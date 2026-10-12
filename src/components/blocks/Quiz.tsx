'use client';

import { useState } from 'react';

export interface QuizOption {
  text: string;
  /** Exactly one option per question should be correct. */
  correct: boolean;
  /** Shown after the reader answers. */
  why: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

interface QuizProps {
  title?: string;
  questions: QuizQuestion[];
}

/**
 * Multiple-choice self-check. Fully client-side, keyboard accessible
 * (native radios), with a per-option explanation after answering.
 */
export function Quiz({ title, questions }: QuizProps) {
  const [picked, setPicked] = useState<Array<number | null>>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = picked.every((p) => p !== null);
  const score = questions.filter((q, i) => picked[i] !== null && q.options[picked[i]!]?.correct).length;

  const reset = () => {
    setPicked(questions.map(() => null));
    setSubmitted(false);
  };

  return (
    <div className="my-6 rounded-xl border p-3 sm:p-4" role="group" aria-label={title ?? 'Check yourself'}>
      <p className="text-sm font-semibold">{title ?? 'Check yourself'}</p>
      <ol className="mt-3 flex flex-col gap-4">
        {questions.map((q, qi) => (
          <li key={qi}>
            <p className="text-sm font-medium">
              {qi + 1}. {q.question}
            </p>
            <div className="mt-1.5 flex flex-col gap-1.5" role="radiogroup" aria-label={`Question ${qi + 1}`}>
              {q.options.map((opt, oi) => {
                const chosen = picked[qi] === oi;
                const showWhy = submitted && (chosen || opt.correct);
                return (
                  <div
                    key={oi}
                    className={`rounded-lg border px-3 py-2 ${
                      submitted && opt.correct
                        ? 'border-green-700 dark:border-green-400'
                        : submitted && chosen
                          ? 'border-amber-600 dark:border-amber-400'
                          : chosen
                            ? 'border-current'
                            : 'opacity-80'
                    }`}
                  >
                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                      <input
                        type="radio"
                        name={`quiz-${title ?? 'q'}-${qi}`}
                        checked={chosen}
                        disabled={submitted}
                        onChange={() => {
                          setPicked((prev) => prev.map((p, j) => (j === qi ? oi : p)));
                        }}
                        className="mt-1 accent-current"
                      />
                      <span>
                        {opt.text}{' '}
                        {submitted && opt.correct && (
                          <span className="font-semibold text-green-700 dark:text-green-300">✓ correct</span>
                        )}
                        {submitted && chosen && !opt.correct && (
                          <span className="font-semibold text-amber-700 dark:text-amber-300">✗ not quite</span>
                        )}
                      </span>
                    </label>
                    {showWhy && <p className="mt-1 pl-6 text-sm opacity-80">{opt.why}</p>}
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!submitted ? (
          <button
            type="button"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
            className="inline-flex min-h-9 items-center rounded-lg border px-3 text-sm transition-opacity hover:bg-stone-100 disabled:opacity-40 dark:hover:bg-stone-900"
          >
            Check my answers
          </button>
        ) : (
          <>
            <p aria-live="polite" className="text-sm font-medium">
              You got {score} of {questions.length} right.
              {score === questions.length ? ' Solid.' : ' Re-read the explanations above.'}
            </p>
            <button
              type="button"
              onClick={reset}
              className="text-sm underline underline-offset-2 opacity-70 hover:opacity-100"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
