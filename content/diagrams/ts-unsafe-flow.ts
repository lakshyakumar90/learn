import type { DiagramSpec } from './types';

/** unknown forces a check; any skips it silently. */
export const tsUnsafeFlowSpec: DiagramSpec = {
  id: 'ts-unsafe-flow',
  title: 'Unknown versus any',
  nodes: [
    { id: 'payload', label: 'Raw payload', layer: 'runtime' },
    { id: 'unknown', label: 'Unknown label', layer: 'language' },
    { id: 'guard', label: 'Narrowing check', layer: 'engine' },
    { id: 'safe', label: 'Safe value', layer: 'language' },
    { id: 'any', label: 'Any escape', layer: 'language' },
    { id: 'leak', label: 'Silent misuse', layer: 'runtime' },
  ],
  edges: [
    { from: 'payload', to: 'unknown', kind: 'solid', label: 'arrives as' },
    { from: 'unknown', to: 'guard', kind: 'solid', label: 'demands' },
    { from: 'guard', to: 'safe', kind: 'dashed', label: 'proves' },
    { from: 'payload', to: 'any', kind: 'dashed', label: 'or labeled' },
    { from: 'any', to: 'leak', kind: 'dashed', label: 'allows' },
  ],
  sources: [],
};
