'use client';

import { useMemo, useState } from 'react';
import { HighlightedCode } from './HighlightedCode';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { Maximize2 } from 'lucide-react';
import { getScenario } from '../../../content/scenarios';
import { useFlowUi } from '@/lib/flow-store';
import { ExpandedView } from '@/components/ExpandedView';
import { FlowModalHotkeys, FlowTimer } from '@/components/FlowPlayer';
import { FlowControls } from '@/components/flow/FlowControls';
import { FlowSteps } from '@/components/flow/FlowSteps';
import type { ScenarioStep } from '@/lib/event-loop';

/**
 * Generic animated visualizer driven by scenario DATA. Panels render
 * the current step's snapshot (call stack, task queue, microtask
 * queue, console output); playback reuses the shared flow store, so
 * the inline player and the expanded view stay in sync exactly like
 * the FlowPlayer.
 */
export function ScenarioPlayer({ scenario, title, codePreview = "" }: { scenario: string; title?: string; codePreview?: string }) {
  const flowId = `scenario-${scenario}`;
  const resolved = useMemo(() => getScenario(scenario), [scenario]);
  const { steps } = resolved;
  const { step } = useFlowUi(flowId);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const canAnimate = reduceMotion !== true;
  const current: ScenarioStep | undefined = steps[Math.min(step, steps.length - 1)];

  if (steps.length === 0) {
    return (
      <p role="note" className="my-6 rounded-xl border border-dashed p-4 text-sm opacity-70">
        Scenario &quot;{scenario}&quot; has no steps yet.
      </p>
    );
  }

  return (
    <>
      <div className="my-6 overflow-hidden rounded-xl border">
        <div className="flex items-stretch border-b">
          <p className="flex min-w-0 flex-1 items-center gap-2 px-4 py-2 text-sm font-semibold">
            <span className="truncate">{title ?? resolved.data.title}</span>
            <span className="rounded-full border px-2 py-0.5 font-mono text-[11px] font-normal opacity-70">
              {resolved.data.env}
            </span>
          </p>
          <button
            type="button"
            aria-label="Expand visualizer"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-10 min-w-12 items-center justify-center border-l text-sm opacity-80 transition-opacity hover:opacity-100"
          >
            <Maximize2 size={16} aria-hidden />
          </button>
        </div>
        <div className="flex flex-col gap-3 p-4">
          <Stage step={current} canAnimate={canAnimate} labels={resolved.data.panelLabels} />
          <Narration step={current} />
          <FlowControls flowId={flowId} total={steps.length} canAnimate={canAnimate} />
          <div className="max-h-44 overflow-y-auto">
            <FlowSteps flowId={flowId} steps={steps} />
          </div>
          <CodePane code={resolved.data.code} line={current?.codeLine} preview={codePreview} />
        </div>
        <FlowTimer total={steps.length} canAnimate={canAnimate} flowId={flowId} />
      </div>

      <ExpandedView
        open={open}
        onOpenChange={setOpen}
        title={`${title ?? resolved.data.title} (visualizer)`}
        description="Interactive visualizer. Space plays or pauses, left and right arrows change steps, Escape closes."
        panKeys={false}
        noFlow
        headerControls={<span />}
      >
        <div className="flex w-full flex-col lg:flex-row">
          <div className="flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto p-4">
            <Stage step={current} canAnimate={canAnimate} large labels={resolved.data.panelLabels} />
          </div>
          <aside
            aria-label="Narration and steps"
            className="flex min-h-0 w-full flex-col gap-3 overflow-y-auto border-t p-4 lg:w-96 lg:border-l lg:border-t-0"
          >
            <Narration step={current} large />
            <FlowControls flowId={flowId} total={steps.length} canAnimate={canAnimate} />
            <div className="min-h-0 overflow-y-auto">
              <FlowSteps flowId={flowId} steps={steps} large />
            </div>
            <CodePane code={resolved.data.code} line={current?.codeLine} preview={codePreview} />
          </aside>
        </div>
        <FlowModalHotkeys total={steps.length} canAnimate={canAnimate} flowId={flowId} />
      </ExpandedView>
    </>
  );
}

function Narration({ step, large = false }: { step?: ScenarioStep; large?: boolean }) {
  if (!step) return null;
  return (
    <p aria-live="polite" className={`leading-relaxed ${large ? 'text-base' : 'text-sm'}`}>
      <span className="font-semibold">{step.title}. </span>
      {step.narration}
      {step.why && <span className="mt-2 block text-[var(--code-comment)]"><strong>Why: </strong>{step.why}</span>}
    </p>
  );
}

function Chip({
  label,
  tone,
  canAnimate,
}: {
  label: string;
  tone: 'stack' | 'task' | 'micro' | 'out';
  canAnimate: boolean;
}) {
  const colors = {
    stack: 'border-[var(--dg-browser)]',
    task: 'border-[var(--dg-realtime)]',
    micro: 'border-[var(--dg-shared)]',
    out: 'border-[var(--dg-database)]',
  } as const;
  const cls = `rounded-lg border-l-4 bg-[var(--dg-node-bg)] px-2.5 py-1 font-mono text-xs break-words shadow-sm ${colors[tone]}`;
  if (!canAnimate) return <div className={cls}>{label}</div>;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={cls}>
      {label}
    </motion.div>
  );
}

function Stage({
  step,
  canAnimate,
  large = false,
  labels = ['Call stack', 'Tasks', 'Microtasks', 'Console'],
}: {
  step?: ScenarioStep;
  canAnimate: boolean;
  large?: boolean;
  labels?: [string, string, string, string];
}) {
  if (!step) return null;
  const panel = 'flex min-h-24 min-w-0 flex-col gap-1.5 rounded-lg border p-2.5';
  const heading = 'text-[11px] font-semibold uppercase tracking-wide opacity-60';
  return (
    <div>
      {step.marker && (
        <p className="mb-2 rounded-lg border border-dashed px-3 py-1.5 text-sm" role="note">
          ⏸ {step.title} — {step.narration}
        </p>
      )}
      {step.note && (
        <p className="mb-2 text-sm opacity-80" role="note">
          {step.note}
        </p>
      )}
      <div className={`grid gap-2 ${large ? 'sm:grid-cols-2' : 'grid-cols-1 min-[480px]:grid-cols-2'}`}>
        <div className={panel} aria-label={labels[0]}>
          <p className={heading}>{labels[0]}</p>
          {step.stack.length === 0 && <p className="text-xs opacity-50">empty</p>}
          {[...step.stack].reverse().map((frame, i) => (
            <Chip key={`${frame}-${i}`} label={frame} tone="stack" canAnimate={canAnimate} />
          ))}
        </div>
        <div className={panel} aria-label={labels[1]}>
          <p className={heading}>{labels[1]}</p>
          {step.tasks.length === 0 && <p className="text-xs opacity-50">empty</p>}
          {step.tasks.map((t, i) => (
            <Chip key={`${t}-${i}`} label={t} tone="task" canAnimate={canAnimate} />
          ))}
        </div>
        <div className={panel} aria-label={labels[2]}>
          <p className={heading}>{labels[2]}</p>
          {step.micros.length === 0 && <p className="text-xs opacity-50">empty</p>}
          {step.micros.map((m, i) => (
            <Chip key={`${m}-${i}`} label={m} tone="micro" canAnimate={canAnimate} />
          ))}
        </div>
        <div className={panel} aria-label={labels[3]}>
          <p className={heading}>{labels[3]}</p>
          {step.output.length === 0 && <p className="text-xs opacity-50">—</p>}
          {step.output.map((o, i) => (
            <Chip key={`${o}-${i}`} label={o} tone="out" canAnimate={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CodePane({ code, line, preview }: { code?: string[]; line?: number; preview: string }) {
  const [show, setShow] = useState(true);
  if (!code || code.length === 0) return null;
  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-expanded={show}
        className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-medium opacity-70 hover:opacity-100"
      >
        Code {typeof line === 'number' ? `(line ${line})` : ''}
        <span aria-hidden>{show ? '▾' : '▸'}</span>
      </button>
      {show && (
        <div className="scenario-code" data-active-line={line}>
          {line && <style>{`.scenario-code[data-active-line="${line}"] .line:nth-of-type(${line}) { background-color: color-mix(in srgb, var(--code-number) 14%, var(--code-bg)); }`}</style>}
          <HighlightedCode html={preview} code={code.join("\n")} label="scenario.js" numbered />
        </div>
      )}
    </div>
  );
}
