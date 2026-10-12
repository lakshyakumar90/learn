import type { DiagramSpec } from './types';

/** Isolated threads that talk only in cloned messages. */
export const jsWorkerModelSpec: DiagramSpec = {
  id: 'js-worker-model',
  title: 'Worker model',
  nodes: [
    { id: 'main', label: 'Main thread', layer: 'browser' },
    { id: 'worker', label: 'Worker', layer: 'runtime' },
    { id: 'post', label: 'Post message', layer: 'runtime' },
    { id: 'queue', label: 'Message queue', layer: 'runtime' },
    { id: 'copy', label: 'Clone data', layer: 'runtime' },
  ],
  edges: [
    { from: 'main', to: 'post', kind: 'solid' },
    { from: 'post', to: 'queue', kind: 'solid' },
    { from: 'queue', to: 'worker', kind: 'dashed', label: 'delivers' },
    { from: 'worker', to: 'main', kind: 'dashed', label: 'replies' },
    { from: 'main', to: 'copy', kind: 'dashed', label: 'clones' },
  ],
  sources: [],
};
