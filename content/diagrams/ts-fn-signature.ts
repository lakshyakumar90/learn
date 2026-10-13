import type { DiagramSpec } from './types';

/** A signature locks argument order, count and result. */
export const tsFnSignatureSpec: DiagramSpec = {
  id: 'ts-fn-signature',
  title: 'Function signature',
  nodes: [
    { id: 'call', label: 'Call site', layer: 'runtime' },
    { id: 'order', label: 'Argument order', layer: 'language' },
    { id: 'params', label: 'Parameters', layer: 'language' },
    { id: 'returns', label: 'Return type', layer: 'language' },
    { id: 'wrong', label: 'Wrong order error', layer: 'engine' },
  ],
  edges: [
    { from: 'call', to: 'order', kind: 'solid', label: 'passes' },
    { from: 'order', to: 'params', kind: 'solid', label: 'must match' },
    { from: 'params', to: 'returns', kind: 'solid', label: 'produces' },
    { from: 'order', to: 'wrong', kind: 'dashed', label: 'breaks' },
  ],
  sources: [],
};
