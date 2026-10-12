import type { DiagramSpec } from './types';

/** Mark-and-sweep: reachability decides what survives. */
export const jsMemoryGcSpec: DiagramSpec = {
  id: 'js-memory-gc',
  title: 'Mark and sweep',
  nodes: [
    { id: 'roots', label: 'Roots', layer: 'runtime' },
    { id: 'heap', label: 'Heap', layer: 'runtime' },
    { id: 'reachable', label: 'Reachable', layer: 'runtime' },
    { id: 'unreachable', label: 'Unreachable', layer: 'runtime' },
    { id: 'mark', label: 'Mark', layer: 'engine' },
    { id: 'sweep', label: 'Sweep', layer: 'engine' },
    { id: 'freed', label: 'Freed', layer: 'runtime' },
  ],
  edges: [
    { from: 'roots', to: 'reachable', kind: 'solid', label: 'points to' },
    { from: 'heap', to: 'reachable', kind: 'solid' },
    { from: 'heap', to: 'unreachable', kind: 'solid' },
    { from: 'roots', to: 'mark', kind: 'dashed', label: 'scan' },
    { from: 'mark', to: 'reachable', kind: 'solid', label: 'keeps' },
    { from: 'mark', to: 'sweep', kind: 'solid', label: 'then' },
    { from: 'sweep', to: 'unreachable', kind: 'dashed', label: 'frees' },
    { from: 'sweep', to: 'freed', kind: 'solid' },
  ],
  sources: [],
};
