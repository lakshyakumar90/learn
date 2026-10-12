import type { DiagramSpec } from './types';

/** Source ships only after the toolchain shapes it. */
export const jsToolingSpec: DiagramSpec = {
  id: 'js-tooling',
  title: 'Tooling pipeline',
  nodes: [
    { id: 'source', label: 'Source', layer: 'language' },
    { id: 'types', label: 'Types', layer: 'language' },
    { id: 'transpiler', label: 'Transpiler', layer: 'engine' },
    { id: 'bundler', label: 'Bundler', layer: 'engine' },
    { id: 'bundle', label: 'Bundle', layer: 'runtime' },
  ],
  edges: [
    { from: 'source', to: 'transpiler', kind: 'solid', label: 'downlevels' },
    { from: 'types', to: 'transpiler', kind: 'dashed', label: 'strips' },
    { from: 'transpiler', to: 'bundler', kind: 'solid' },
    { from: 'bundler', to: 'bundle', kind: 'solid', label: 'ships' },
  ],
  sources: [],
};
