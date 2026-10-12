import type { DiagramSpec } from './types';

/** Lookup starts at the instance and climbs to Object.prototype. */
export const jsPrototypeChainSpec: DiagramSpec = {
  id: 'js-prototype-chain',
  title: 'Prototype chain',
  nodes: [
    { id: 'lookup', label: 'Lookup', layer: 'language' },
    { id: 'dog', label: 'Dog', layer: 'language' },
    { id: 'animal', label: 'Animal', layer: 'language' },
    { id: 'root', label: 'Object root', layer: 'language' },
    { id: 'method', label: 'Method', layer: 'language' },
    { id: 'miss', label: 'Undefined', layer: 'language' },
  ],
  edges: [
    { from: 'lookup', to: 'dog', kind: 'solid', label: 'starts' },
    { from: 'dog', to: 'animal', kind: 'solid', label: 'inherits' },
    { from: 'animal', to: 'root', kind: 'solid', label: 'inherits' },
    { from: 'lookup', to: 'method', kind: 'dashed', label: 'finds' },
    { from: 'lookup', to: 'miss', kind: 'dashed', label: 'nowhere' },
  ],
  sources: [],
};
