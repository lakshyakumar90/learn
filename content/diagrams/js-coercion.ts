import type { DiagramSpec } from './types';

/** Strict checks reject surprises; loose checks convert silently. */
export const jsCoercionSpec: DiagramSpec = {
  id: 'js-coercion',
  title: 'Equality checks',
  nodes: [
    { id: 'compare', label: 'Compare', layer: 'language' },
    { id: 'strict', label: 'Strict equal', layer: 'language' },
    { id: 'sametype', label: 'Same type?', layer: 'language' },
    { id: 'loose', label: 'Loose equal', layer: 'language' },
    { id: 'convert', label: 'Convert', layer: 'runtime' },
    { id: 'result', label: 'Boolean', layer: 'runtime' },
  ],
  edges: [
    { from: 'compare', to: 'strict', kind: 'solid' },
    { from: 'strict', to: 'sametype', kind: 'solid', label: 'checks' },
    { from: 'sametype', to: 'result', kind: 'solid', label: 'decides' },
    { from: 'compare', to: 'loose', kind: 'dashed' },
    { from: 'loose', to: 'convert', kind: 'dashed', label: 'coerces' },
    { from: 'convert', to: 'result', kind: 'dashed', label: 'decides' },
  ],
  sources: [],
};
