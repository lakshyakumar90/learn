import type { DiagramSpec } from './types';

/** Pending settles once; handlers chain new promises. */
export const jsPromiseStatesSpec: DiagramSpec = {
  id: 'js-promise-states',
  title: 'Promise states',
  nodes: [
    { id: 'pending', label: 'Pending', layer: 'language' },
    { id: 'fulfilled', label: 'Fulfilled', layer: 'language' },
    { id: 'rejected', label: 'Rejected', layer: 'language' },
    { id: 'then', label: 'Then', layer: 'language' },
    { id: 'catch', label: 'Catch', layer: 'language' },
    { id: 'finally', label: 'Finally', layer: 'language' },
    { id: 'chain', label: 'Next promise', layer: 'language' },
  ],
  edges: [
    { from: 'pending', to: 'fulfilled', kind: 'solid', label: 'resolve' },
    { from: 'pending', to: 'rejected', kind: 'solid', label: 'reject' },
    { from: 'fulfilled', to: 'then', kind: 'solid' },
    { from: 'rejected', to: 'catch', kind: 'solid' },
    { from: 'then', to: 'finally', kind: 'dashed' },
    { from: 'catch', to: 'finally', kind: 'dashed' },
    { from: 'then', to: 'chain', kind: 'solid', label: 'returns' },
  ],
  sources: [],
};
