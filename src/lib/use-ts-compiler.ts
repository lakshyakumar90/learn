'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import meta from '../../generated/ts-compiler.json';
import {
  SANDBOX_TS_VERSION,
  compilerLabel,
  type TsDiagnostic,
} from '@/lib/ts-compiler';

export type TsWorkerStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface TsCompiler {
  status: TsWorkerStatus;
  /** Set when the worker itself fails (not for code diagnostics). */
  loadError?: string;
  /** Displayed before first load, e.g. "about 9 MB". */
  estimatedSize: string;
  /** The exact label shown above results, e.g. "Checked with …". */
  label: (strict: boolean | null) => string;
  check: (code: string, strict: boolean) => Promise<TsDiagnostic[]>;
  emit: (code: string, strict: boolean) => Promise<string>;
}

interface Pending {
  resolve: (v: never) => void;
  reject: (e: Error) => void;
}

const WORKER_FAILED =
  'The TypeScript compiler could not start in this browser. ' +
  'The examples below were verified at build time — read the ' +
  'diagnostics shown, but running is unavailable.';

/**
 * Lazily loads the pinned TypeScript compiler inside a dedicated Web
 * Worker — only on first Check/Run, never on page load. The compiler
 * chunk is code-split, so no other page ships it (asserted in the
 * Playwright suite via build output + a no-request-on-load test).
 */
export function useTsCompiler(): TsCompiler {
  const [status, setStatus] = useState<TsWorkerStatus>('idle');
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const workerRef = useRef<Worker | null>(null);
  const idRef = useRef(0);
  const pendingRef = useRef(new Map<number, Pending>());

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    },
    [],
  );

  const ensureWorker = useCallback((): Promise<Worker> => {
    if (workerRef.current) return Promise.resolve(workerRef.current);
    setStatus('loading');
    try {
      const worker = new Worker(new URL('../workers/ts-worker.ts', import.meta.url));
      worker.onmessage = (e: MessageEvent) => {
        const msg = e.data as
          | { id: number; type: 'checked'; diagnostics: TsDiagnostic[] }
          | { id: number; type: 'emitted'; js: string }
          | { id: number; type: 'worker-error'; message: string };
        const pending = pendingRef.current.get(msg.id);
        if (!pending) return;
        pendingRef.current.delete(msg.id);
        if (msg.type === 'worker-error') pending.reject(new Error(msg.message));
        else if (msg.type === 'checked') pending.resolve(msg.diagnostics as never);
        else pending.resolve(msg.js as never);
      };
      worker.onerror = () => {
        workerRef.current = null;
        setLoadError(WORKER_FAILED);
        setStatus('error');
        for (const [, p] of pendingRef.current) p.reject(new Error(WORKER_FAILED));
        pendingRef.current.clear();
      };
      workerRef.current = worker;
      setStatus('ready');
      return Promise.resolve(worker);
    } catch {
      setLoadError(WORKER_FAILED);
      setStatus('error');
      return Promise.reject(new Error(WORKER_FAILED));
    }
  }, []);

  const send = useCallback(
    async <T,>(type: 'check' | 'emit', code: string, strict: boolean): Promise<T> => {
      const worker = await ensureWorker();
      const id = (idRef.current += 1);
      return new Promise<T>((resolve, reject) => {
        pendingRef.current.set(id, {
          resolve: resolve as (v: never) => void,
          reject,
        });
        worker.postMessage({ id, type, code, strict });
      });
    },
    [ensureWorker],
  );

  const check = useCallback(
    (code: string, strict: boolean) => send<TsDiagnostic[]>('check', code, strict),
    [send],
  );
  const emit = useCallback(
    (code: string, strict: boolean) => send<string>('emit', code, strict),
    [send],
  );

  return {
    status,
    loadError,
    estimatedSize: `about ${(meta.compilerBytes / 1048576).toFixed(0)} MB`,
    label: (strict: boolean | null = null) => compilerLabel(strict),
    check,
    emit,
  };
}

export { SANDBOX_TS_VERSION };
