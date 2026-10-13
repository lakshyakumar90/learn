import type { DiagramSpec } from './types';

/** Typed props in, validated data out, safe render. */
export const tsReactDataSpec: DiagramSpec = {
  id: 'ts-react-data',
  title: 'Typed component data',
  nodes: [
    { id: 'props', label: 'Typed props', layer: 'language' },
    { id: 'fetch', label: 'Fetch call', layer: 'runtime' },
    { id: 'raw', label: 'Raw JSON', layer: 'runtime' },
    { id: 'validate', label: 'Runtime check', layer: 'engine' },
    { id: 'state', label: 'Typed state', layer: 'language' },
    { id: 'render', label: 'Safe render', layer: 'browser' },
  ],
  edges: [
    { from: 'props', to: 'render', kind: 'solid', label: 'shapes' },
    { from: 'fetch', to: 'raw', kind: 'solid', label: 'returns' },
    { from: 'raw', to: 'validate', kind: 'solid', label: 'needs' },
    { from: 'validate', to: 'state', kind: 'dashed', label: 'proves' },
    { from: 'state', to: 'render', kind: 'solid', label: 'feeds' },
  ],
  sources: [],
};
