import type { DiagramSpec } from './types';

/** Browser runtime: the engine plus everything around it. */
export const jsRuntimeSpec: DiagramSpec = {
  id: 'js-runtime',
  title: 'Browser runtime',
  nodes: [
    { id: 'script', label: 'Script', layer: 'language' },
    { id: 'stack', label: 'Call stack', layer: 'runtime' },
    { id: 'heap', label: 'Heap', layer: 'runtime' },
    { id: 'webapis', label: 'Web APIs', layer: 'browser' },
    { id: 'tasks', label: 'Task queue', layer: 'runtime' },
    { id: 'micros', label: 'Microtasks', layer: 'runtime' },
    { id: 'loop', label: 'Event loop', layer: 'runtime' },
    { id: 'render', label: 'Render', layer: 'browser' },
  ],
  edges: [
    { from: 'script', to: 'stack', kind: 'solid', label: 'runs on' },
    { from: 'stack', to: 'heap', kind: 'solid', label: 'allocates' },
    { from: 'script', to: 'webapis', kind: 'dashed', label: 'delegates' },
    { from: 'webapis', to: 'tasks', kind: 'solid', label: 'callbacks' },
    { from: 'script', to: 'micros', kind: 'solid', label: 'promises' },
    { from: 'tasks', to: 'loop', kind: 'dashed' },
    { from: 'micros', to: 'loop', kind: 'dashed' },
    { from: 'loop', to: 'stack', kind: 'dashed', label: 'next task' },
    { from: 'loop', to: 'render', kind: 'dashed', label: 'paint' },
  ],
  sources: [],
};
