'use client';

import { Pause, Play, RotateCcw, StepBack, StepForward } from 'lucide-react';
import { FLOW_SPEEDS, useFlowStore, useFlowUi, type FlowSpeed } from '@/lib/flow-store';

const ICON_BUTTON =
  'inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border text-sm transition-opacity disabled:opacity-40';

/**
 * Playback controls shared by the inline player and its expanded view:
 * Back, Play/Pause, Next, Restart, step indicator, and speed.
 */
export function FlowControls({
  flowId,
  total,
  canAnimate,
}: {
  flowId: string;
  total: number;
  canAnimate: boolean;
}) {
  const { step, playing, speed } = useFlowUi(flowId);
  const { next, back, restart, toggle, setSpeed } = useFlowStore.getState();
  const atEnd = step >= total - 1;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => back(flowId)}
        disabled={step === 0}
        aria-label="Previous step"
        className={ICON_BUTTON}
      >
        <StepBack size={16} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => (canAnimate ? toggle(flowId, total, true) : next(flowId, total))}
        aria-label={!canAnimate ? 'Advance one step' : playing ? 'Pause' : 'Play'}
        aria-pressed={canAnimate ? playing : undefined}
        className={ICON_BUTTON}
      >
        {canAnimate && playing ? (
          <Pause size={16} aria-hidden />
        ) : (
          <Play size={16} aria-hidden />
        )}
      </button>
      <button
        type="button"
        onClick={() => next(flowId, total)}
        disabled={atEnd}
        aria-label="Next step"
        className={ICON_BUTTON}
      >
        <StepForward size={16} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => restart(flowId, canAnimate)}
        aria-label="Restart"
        className={ICON_BUTTON}
      >
        <RotateCcw size={16} aria-hidden />
      </button>
      <span className="ml-auto text-xs opacity-60 tabular-nums" aria-live="off">
        Step {step + 1} of {total}
      </span>
      <div className="flex items-center gap-1" role="group" aria-label="Playback speed">
        {FLOW_SPEEDS.map((s: FlowSpeed) => (
          <button
            key={s}
            type="button"
            onClick={() => setSpeed(flowId, s)}
            aria-pressed={speed === s}
            aria-label={`Playback speed ${s}x`}
            className={`rounded-md border px-2 py-1 text-xs tabular-nums transition-colors ${
              speed === s ? 'font-semibold' : 'opacity-60 hover:opacity-100'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
