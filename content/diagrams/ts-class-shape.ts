import type { DiagramSpec } from './types';

/** A class promises a shape; the checker holds it to that. */
export const tsClassShapeSpec: DiagramSpec = {
  id: 'ts-class-shape',
  title: 'Class keeps its promise',
  nodes: [
    { id: 'contract', label: 'Interface promise', layer: 'language' },
    { id: 'class', label: 'Class body', layer: 'language' },
    { id: 'private', label: 'Hidden state', layer: 'engine' },
    { id: 'public', label: 'Public surface', layer: 'runtime' },
    { id: 'missing', label: 'Missing part error', layer: 'engine' },
  ],
  edges: [
    { from: 'contract', to: 'class', kind: 'solid', label: 'binds' },
    { from: 'class', to: 'private', kind: 'solid', label: 'hides' },
    { from: 'class', to: 'public', kind: 'solid', label: 'exposes' },
    { from: 'class', to: 'missing', kind: 'dashed', label: 'breaks' },
  ],
  sources: [],
};
