'use client';

import { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useReducedMotion } from 'motion/react';
import { Maximize2 } from 'lucide-react';
import { getFlowSpec } from '../../content/flows';
import { FLOW_STEP_MS, useFlowStore, useFlowUi } from '@/lib/flow-store';
import { DiagramLegend } from './diagram-shared';
import { ExpandedView } from './ExpandedView';
import { FlowCanvas } from './flow/FlowCanvas';
import { FlowControls } from './flow/FlowControls';
import { FlowSteps } from './flow/FlowSteps';
import { FlowTabs } from './flow/FlowTabs';

const FLOW_ID = 'end-to-end';

/** Single auto-advance timer. Rendered once (inline tree) so playback never doubles. */
function FlowTimer({ total, canAnimate }: { total: number; canAnimate: boolean }) {
  const playing = useFlowUi(FLOW_ID).playing;
  const step = useFlowUi(FLOW_ID).step;
  const speed = useFlowUi(FLOW_ID).speed;

  useEffect(() => {
    if (!playing || !canAnimate || total === 0) return;
    if (step >= total - 1) {
      useFlowStore.getState().stop(FLOW_ID);
      return;
    }
    const t = window.setTimeout(
      () => useFlowStore.getState().next(FLOW_ID, total),
      FLOW_STEP_MS / speed,
    );
    return () => window.clearTimeout(t);
  }, [playing, step, speed, total, canAnimate]);

  return null;
}

function FlowNarration({ large = false }: { large?: boolean }) {
  const { tab, step: stepIndex } = useFlowUi(FLOW_ID);
  const flow = getFlowSpec(tab);
  const steps = flow?.steps ?? [];
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  if (!step) return null;
  return (
    <p aria-live="polite" className={`leading-relaxed ${large ? 'text-base' : 'min-h-12 text-sm'}`}>
      <span className="font-semibold">
        Step {stepIndex + 1} of {steps.length} — {step.title}.{' '}
      </span>
      {step.narration}
    </p>
  );
}

/** Space / arrows in the expanded view: playback, never canvas pan. */
function FlowModalHotkeys({ total, canAnimate }: { total: number; canAnimate: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input, textarea, select, [contenteditable]')) return;
      const state = useFlowStore.getState();
      if (e.key === ' ') {
        // Let focused buttons keep their native Space behaviour.
        if (target && target.closest('button, a, [role="tab"]')) return;
        e.preventDefault();
        if (canAnimate) state.toggle(FLOW_ID, total, true);
        else state.next(FLOW_ID, total);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        state.next(FLOW_ID, total);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        state.back(FLOW_ID);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total, canAnimate]);
  return null;
}

/**
 * Animated end-to-end flow player. Playback state lives in one shared
 * store, so the inline player and the expanded view stay in sync and
 * opening or closing the modal never resets the step or playback.
 */
export function FlowPlayer() {
  const { tab } = useFlowUi(FLOW_ID);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const canAnimate = reduceMotion !== true;

  // Deep-link tabs once: /end-to-end#flow=room selects the Room tab.
  useEffect(() => {
    const match = window.location.hash.match(/^#flow=(guest|signedin|room)$/);
    if (match) useFlowStore.getState().setTab(FLOW_ID, match[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.history.replaceState(null, '', `#flow=${tab}`);
  }, [tab]);

  const flow = getFlowSpec(tab) ?? getFlowSpec('guest');
  const steps = flow?.steps ?? [];

  return (
    <>
      <div className="my-6 overflow-hidden rounded-xl border">
        <div className="flex items-stretch border-b">
          <FlowTabs flowId={FLOW_ID} className="flex-1" />
          <button
            type="button"
            aria-label="Expand flow"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-10 min-w-12 items-center justify-center border-l text-sm opacity-80 transition-opacity hover:opacity-100"
          >
            <Maximize2 size={16} aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-4" role="tabpanel" id={`flow-panel-${tab}`} aria-labelledby={`flow-tab-${tab}`}>
          <div
            onClick={() => setOpen(true)}
            className="cursor-zoom-in overflow-hidden rounded-lg border bg-[var(--dg-node-bg)]"
          >
            <ReactFlowProvider>
              <FlowCanvas flowId={FLOW_ID} modal={false} canAnimate={canAnimate} height={340} />
            </ReactFlowProvider>
          </div>
          <FlowNarration />
          <FlowControls flowId={FLOW_ID} total={steps.length} canAnimate={canAnimate} />
          <FlowSteps flowId={FLOW_ID} steps={steps} />
          <DiagramLegend />
        </div>
        <FlowTimer total={steps.length} canAnimate={canAnimate} />
      </div>

      <ExpandedView
        open={open}
        onOpenChange={setOpen}
        title={`${flow?.title ?? 'End-to-end'} flow`}
        description="Interactive flow. Space plays or pauses, left and right arrows change steps, plus and minus zoom, zero fits, Escape closes."
        panKeys={false}
      >
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="flex min-h-0 flex-1 flex-col">
            <FlowCanvas
              flowId={FLOW_ID}
              modal
              canAnimate={canAnimate}
              heightClass="h-[38dvh] min-h-[260px] w-full lg:h-full lg:min-h-0"
              fitSignal={open}
            />
            <div className="border-t px-4 py-2">
              <DiagramLegend />
            </div>
          </div>
          <aside
            aria-label="Flow narration and steps"
            className="flex min-h-0 w-full flex-col gap-4 overflow-y-auto border-t p-4 lg:w-84 lg:border-l lg:border-t-0"
          >
            <FlowTabs flowId={FLOW_ID} arrowNav={false} />
            <FlowNarration large />
            <FlowControls flowId={FLOW_ID} total={steps.length} canAnimate={canAnimate} />
            <FlowSteps flowId={FLOW_ID} steps={steps} large />
          </aside>
        </div>
        <FlowModalHotkeys total={steps.length} canAnimate={canAnimate} />
      </ExpandedView>
    </>
  );
}
