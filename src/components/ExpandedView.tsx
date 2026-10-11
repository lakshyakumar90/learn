'use client';

import { useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { Maximize, RefreshCw, X, ZoomIn, ZoomOut } from 'lucide-react';

const CONTROL_BUTTON =
  'inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border text-sm transition-opacity hover:bg-stone-100 dark:hover:bg-stone-900';

/**
 * Zoom buttons for the expanded view header. Also owns the +/-/0
 * keyboard shortcuts (and arrow-key panning when panKeys is set).
 * Must render inside a ReactFlowProvider.
 */
export function ModalZoomControls({ panKeys }: { panKeys: boolean }) {
  const { zoomIn, zoomOut, fitView, getViewport, setViewport } = useReactFlow();
  const initial = useRef<{ x: number; y: number; zoom: number } | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      initial.current = getViewport();
    }, 400);
    return () => window.clearTimeout(t);
  }, [getViewport]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn({ duration: 200 });
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut({ duration: 200 });
      } else if (e.key === '0') {
        e.preventDefault();
        fitView({ padding: 0.2, duration: 200 });
      } else if (panKeys && e.key.startsWith('Arrow')) {
        e.preventDefault();
        const v = getViewport();
        const d = 48;
        setViewport(
          {
            x: v.x + (e.key === 'ArrowLeft' ? d : e.key === 'ArrowRight' ? -d : 0),
            y: v.y + (e.key === 'ArrowUp' ? d : e.key === 'ArrowDown' ? -d : 0),
            zoom: v.zoom,
          },
          { duration: 100 },
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panKeys, zoomIn, zoomOut, fitView, getViewport, setViewport]);

  const reset = () => {
    const v = initial.current;
    if (v) setViewport(v, { duration: 200 });
    else fitView({ padding: 0.2, duration: 200 });
  };

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Diagram zoom">
      <button type="button" aria-label="Zoom in" onClick={() => zoomIn({ duration: 200 })} className={CONTROL_BUTTON}>
        <ZoomIn size={16} aria-hidden />
      </button>
      <button type="button" aria-label="Zoom out" onClick={() => zoomOut({ duration: 200 })} className={CONTROL_BUTTON}>
        <ZoomOut size={16} aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Fit to screen"
        onClick={() => fitView({ padding: 0.2, duration: 200 })}
        className={CONTROL_BUTTON}
      >
        <Maximize size={16} aria-hidden />
      </button>
      <button type="button" aria-label="Reset view" onClick={reset} className={CONTROL_BUTTON}>
        <RefreshCw size={16} aria-hidden />
      </button>
    </div>
  );
}

interface ExpandedViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Arrow keys pan the canvas (plain diagrams). Flow views use arrows for steps. */
  panKeys: boolean;
  children: React.ReactNode;
}

/**
 * Shared fullscreen modal for diagrams and the flow player. Radix Dialog
 * provides the focus trap, Escape to close, aria-modal, labelledby wiring,
 * focus restoration, and body scroll lock. One ReactFlowProvider per
 * instance covers the zoom controls and every canvas inside.
 */
export function ExpandedView({
  open,
  onOpenChange,
  title,
  description,
  panKeys,
  children,
}: ExpandedViewProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[92vh] w-[95vw] max-w-[1500px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border bg-[var(--dg-node-bg)] text-[var(--foreground)] shadow-2xl max-md:h-dvh max-md:w-screen max-md:rounded-none">
          <ReactFlowProvider>
            <div className="flex items-center gap-2 border-b px-3 py-2 sm:px-4">
              <div className="mr-auto min-w-0">
                <Dialog.Title className="truncate text-base font-semibold">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="sr-only">{description}</Dialog.Description>
              </div>
              <ModalZoomControls panKeys={panKeys} />
              <Dialog.Close
                aria-label="Close"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-stone-900 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-stone-900"
              >
                <X size={18} aria-hidden />
              </Dialog.Close>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-visible">{children}</div>
          </ReactFlowProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
