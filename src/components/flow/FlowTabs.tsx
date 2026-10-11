'use client';

import { flowOrderForProject, getFlowSpec } from '../../../content/flows';
import { useFlowStore, useFlowUi } from '@/lib/flow-store';

/** Tab list shared by the inline player and its expanded view (one store). */
export function FlowTabs({
  flowId,
  project = 'excalidraw',
  arrowNav = true,
  className = '',
}: {
  flowId: string;
  project?: string;
  arrowNav?: boolean;
  className?: string;
}) {
  const tab = useFlowUi(flowId).tab;
  const setTab = useFlowStore((s) => s.setTab);
  const tabIds = flowOrderForProject(project);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!arrowNav) return;
    const i = tabIds.indexOf(tab);
    if (i < 0) return;
    if (e.key === 'ArrowRight') setTab(flowId, tabIds[(i + 1) % tabIds.length]);
    else if (e.key === 'ArrowLeft')
      setTab(flowId, tabIds[(i - 1 + tabIds.length) % tabIds.length]);
    else return;
    e.preventDefault();
  };

  return (
    <div role="tablist" aria-label="End-to-end flows" onKeyDown={onKeyDown} className={`flex ${className}`}>
      {tabIds.map((id) => {
        const f = getFlowSpec(id);
        if (!f) return null;
        const selected = id === tab;
        return (
          <button
            key={id}
            role="tab"
            id={`flow-tab-${id}`}
            aria-selected={selected}
            aria-controls={`flow-panel-${id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => setTab(flowId, id)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              selected
                ? 'border-b-2 border-current bg-stone-100 dark:bg-stone-900'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            {f.title}
          </button>
        );
      })}
    </div>
  );
}
