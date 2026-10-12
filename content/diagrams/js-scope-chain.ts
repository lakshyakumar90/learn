import type { DiagramSpec } from './types';

/** Variable lookup walks outward until the global scope. */
export const jsScopeChainSpec: DiagramSpec = {
  id: 'js-scope-chain',
  title: 'Scope chain',
  nodes: [
    { id: 'lookup', label: 'Lookup', layer: 'language' },
    { id: 'inner', label: 'Inner scope', layer: 'language' },
    { id: 'outer', label: 'Outer scope', layer: 'language' },
    { id: 'global', label: 'Global scope', layer: 'language' },
    { id: 'declaration', label: 'Declaration', layer: 'language' },
  ],
  edges: [
    { from: 'lookup', to: 'inner', kind: 'solid', label: 'starts' },
    { from: 'inner', to: 'outer', kind: 'dashed', label: 'ask next' },
    { from: 'outer', to: 'global', kind: 'dashed', label: 'ask next' },
    { from: 'global', to: 'declaration', kind: 'solid', label: 'owns' },
    { from: 'inner', to: 'declaration', kind: 'dashed', label: 'finds' },
  ],
  sources: [],
};
