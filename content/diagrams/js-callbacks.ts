import type { DiagramSpec } from './types';

/** Nested callbacks pyramid; named steps stay flat. */
export const jsCallbacksSpec: DiagramSpec = {
  id: 'js-callbacks',
  title: 'Callback nesting',
  nodes: [
    { id: 'first', label: 'First task', layer: 'runtime' },
    { id: 'nested', label: 'Nested next', layer: 'runtime' },
    { id: 'pyramid', label: 'Pyramid', layer: 'language' },
    { id: 'named', label: 'Named steps', layer: 'language' },
    { id: 'flat', label: 'Flat chain', layer: 'runtime' },
  ],
  edges: [
    { from: 'first', to: 'nested', kind: 'solid', label: 'inside' },
    { from: 'nested', to: 'pyramid', kind: 'solid', label: 'grows' },
    { from: 'first', to: 'named', kind: 'dashed', label: 'extract' },
    { from: 'named', to: 'flat', kind: 'dashed', label: 'sequences' },
  ],
  sources: [],
};
