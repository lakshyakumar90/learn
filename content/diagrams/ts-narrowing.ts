import type { DiagramSpec } from './types';

/** Each guard shrinks the possible type, line by line. */
export const tsNarrowingSpec: DiagramSpec = {
  id: 'ts-narrowing',
  title: 'Narrowing walkthrough',
  nodes: [
    { id: 'wide', label: 'Wide union', layer: 'language' },
    { id: 'guard', label: 'Type guard', layer: 'language' },
    { id: 'branch', label: 'True branch', layer: 'engine' },
    { id: 'narrow', label: 'Narrow type', layer: 'language' },
    { id: 'other', label: 'Else branch', layer: 'engine' },
    { id: 'rest', label: 'Remaining type', layer: 'language' },
  ],
  edges: [
    { from: 'wide', to: 'guard', kind: 'solid', label: 'tested by' },
    { from: 'guard', to: 'branch', kind: 'dashed', label: 'splits' },
    { from: 'branch', to: 'narrow', kind: 'solid', label: 'knows' },
    { from: 'guard', to: 'other', kind: 'dashed', label: 'or else' },
    { from: 'other', to: 'rest', kind: 'solid', label: 'keeps' },
  ],
  sources: [],
};
