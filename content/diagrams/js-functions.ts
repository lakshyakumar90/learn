import type { DiagramSpec } from './types';

/** Every function shape carries behavior as a value. */
export const jsFunctionsSpec: DiagramSpec = {
  id: 'js-functions',
  title: 'Function shapes',
  nodes: [
    { id: 'declare', label: 'Declaration', layer: 'language' },
    { id: 'express', label: 'Expression', layer: 'language' },
    { id: 'arrow', label: 'Arrow', layer: 'language' },
    { id: 'callback', label: 'Callback', layer: 'runtime' },
    { id: 'higher', label: 'Higher order', layer: 'runtime' },
    { id: 'call', label: 'Call site', layer: 'runtime' },
  ],
  edges: [
    { from: 'declare', to: 'call', kind: 'solid', label: 'hoisted' },
    { from: 'express', to: 'callback', kind: 'solid', label: 'passed as' },
    { from: 'arrow', to: 'callback', kind: 'solid', label: 'passed as' },
    { from: 'callback', to: 'higher', kind: 'dashed', label: 'received by' },
    { from: 'higher', to: 'call', kind: 'solid', label: 'invokes' },
  ],
  sources: [],
};
