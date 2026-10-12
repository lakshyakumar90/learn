import type { DiagramSpec } from './types';

/** Transforming methods copy; mutating methods edit in place. */
export const jsArrayMethodsSpec: DiagramSpec = {
  id: 'js-array-methods',
  title: 'Array methods',
  nodes: [
    { id: 'array', label: 'Array', layer: 'language' },
    { id: 'map', label: 'Map', layer: 'language' },
    { id: 'filter', label: 'Filter', layer: 'language' },
    { id: 'reduce', label: 'Reduce', layer: 'language' },
    { id: 'fresh', label: 'New array', layer: 'runtime' },
    { id: 'single', label: 'Single value', layer: 'runtime' },
    { id: 'sort', label: 'Sort in place', layer: 'runtime' },
  ],
  edges: [
    { from: 'array', to: 'map', kind: 'solid' },
    { from: 'array', to: 'filter', kind: 'solid' },
    { from: 'array', to: 'reduce', kind: 'solid' },
    { from: 'map', to: 'fresh', kind: 'solid', label: 'returns' },
    { from: 'filter', to: 'fresh', kind: 'solid', label: 'returns' },
    { from: 'reduce', to: 'single', kind: 'solid', label: 'folds to' },
    { from: 'array', to: 'sort', kind: 'dashed', label: 'mutates' },
  ],
  sources: [],
};
