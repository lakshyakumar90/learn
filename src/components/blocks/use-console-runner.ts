'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RUN_TIMEOUT_MS,
  buildWorkerSource,
  stackLineToSnippet,
  workerHeaderLineCount,
  type OutputLine,
  type RunError,
  type TestResult,
} from '@/lib/run-console';

export interface ConsoleRunState {
  lines: OutputLine[];
  error?: RunError;
  tests?: TestResult[];
  running: boolean;
  timeMs?: number;
  truncated: boolean;
  timedOut: boolean;
  run: (code: string, opts?: { testMode?: boolean }) => void;
  stop: () => void;
  reset: () => void;
}

const IDLE: Omit<ConsoleRunState, 'run' | 'stop' | 'reset'> = {
  lines: [],
  error: undefined,
  tests: undefined,
  running: false,
  timeMs: undefined,
  truncated: false,
  timedOut: false,
};

/**
 * Run a console snippet in a Web Worker built from a Blob. The worker
 * source embeds the exact helpers from `src/lib/runner-helpers`, so the
 * browser executes the same code the Node build check imports.
 * Terminated after 5 seconds; output capped at 500 lines / 100 KB.
 */
export function useConsoleRunner(): ConsoleRunState {
  const [state, setState] = useState(IDLE);
  const workerRef = useRef<Worker | null>(null);
  const timerRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setState((s) => (s.running ? { ...s, running: false, timedOut: true } : s));
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setState(IDLE);
  }, [cleanup]);

  const run = useCallback(
    (code: string, opts: { testMode?: boolean } = {}) => {
      cleanup();
      const started = performance.now();
      setState({ ...IDLE, running: true });
      let worker: Worker;
      let firstUserLine = 1;
      try {
        const built = buildWorkerSource(code, opts);
        firstUserLine = built.userStartLine;
        worker = new Worker(URL.createObjectURL(new Blob([built.source], { type: 'text/javascript' })));
      } catch {
        setState({
          ...IDLE,
          error: { message: 'Could not start the runner in this browser.' },
        });
        return;
      }
      workerRef.current = worker;
      const finish = (patch: Partial<typeof IDLE>) => {
        cleanup();
        setState((s) => ({ ...s, ...patch, running: false, timeMs: performance.now() - started }));
      };
      timerRef.current = window.setTimeout(() => {
        finish({ timedOut: true, error: { message: `Stopped: ran past the ${RUN_TIMEOUT_MS / 1000}s limit.` } });
      }, RUN_TIMEOUT_MS);
      worker.onmessage = (e: MessageEvent) => {
        const msg = e.data as
          | { type: 'line'; kind: OutputLine['kind']; text: string }
          | { type: 'done'; truncated: boolean }
          | { type: 'tests'; results: TestResult[]; truncated: boolean }
          | { type: 'truncated' }
          | { type: 'error'; message: string; stack: string };
        if (msg.type === 'line') {
          const line = { kind: msg.kind, text: msg.text };
          setState((s) => ({ ...s, lines: [...s.lines, line] }));
        } else if (msg.type === 'truncated') {
          setState((s) => ({ ...s, truncated: true }));
        } else if (msg.type === 'done') {
          finish(msg.truncated ? { truncated: true } : {});
        } else if (msg.type === 'tests') {
          finish({ tests: msg.results, truncated: msg.truncated ? true : false });
        } else if (msg.type === 'error') {
          finish({
            error: {
              message: msg.message,
              line: stackLineToSnippet(msg.stack, firstUserLine),
            },
          });
        }
      };
      worker.onerror = (ev) => {
        // Syntax errors (e.g. redeclaring `console`) never reach onmessage.
        // ErrorEvent.lineno counts from the top of the worker script.
        const lineno = (ev as ErrorEvent).lineno ?? 0;
        const line = lineno > 0 ? lineno - workerHeaderLineCount() : undefined;
        finish({
          error: {
            message: String((ev as ErrorEvent).message || 'The code could not run.'),
            line: line !== undefined && line >= 1 ? line : undefined,
          },
        });
      };
    },
    [cleanup],
  );

  return { ...state, run, stop, reset };
}
