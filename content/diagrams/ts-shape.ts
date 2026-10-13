import type { DiagramSpec } from './types';

/** interface and type alias describe the same shape. */
export const tsShapeSpec: DiagramSpec = {
  id: 'ts-shape',
  title: 'Two spellings, one shape',
  nodes: [
    { id: 'interface', label: 'Interface form', layer: 'language' },
    { id: 'alias', label: 'Type alias form', layer: 'language' },
    { id: 'shape', label: 'Object shape', layer: 'language' },
    { id: 'checker', label: 'Shape check', layer: 'engine' },
    { id: 'fits', label: 'Fits anywhere', layer: 'runtime' },
  ],
  edges: [
    { from: 'interface', to: 'shape', kind: 'solid', label: 'describes' },
    { from: 'alias', to: 'shape', kind: 'solid', label: 'describes' },
    { from: 'shape', to: 'checker', kind: 'solid', label: 'compared' },
    { from: 'checker', to: 'fits', kind: 'dashed', label: 'accepts' },
  ],
  sources: [],
};
