'use client';

import type { FlowStep } from '../../../content/flows/types';
import { useFlowStore, useFlowUi } from '@/lib/flow-store';

/** Clickable step list shared by the inline player and its expanded view. */
export function FlowSteps({
  flowId,
  steps,
  large = false,
}: {
  flowId: string;
  steps: FlowStep[];
  large?: boolean;
}) {
  const step = useFlowUi(flowId).step;
  const goTo = useFlowStore((s) => s.goTo);

  return (
    <ol className="flex flex-col gap-1" aria-label="Steps">
      {steps.map((s, i) => (
        <li key={s.title}>
          <button
            type="button"
            onClick={() => goTo(flowId, i, steps.length)}
            aria-current={i === step ? 'step' : undefined}
            className={`w-full rounded-lg px-3 py-1.5 text-left transition-colors ${
              large ? 'text-base' : 'text-sm'
            } ${
              i === step
                ? 'bg-stone-100 font-medium dark:bg-stone-900'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <span className="mr-2 tabular-nums opacity-60">{i + 1}.</span>
            {s.title}
          </button>
        </li>
      ))}
    </ol>
  );
}
