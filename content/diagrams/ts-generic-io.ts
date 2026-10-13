import type { DiagramSpec } from './types';

/** One definition, every call keeps its own type. */
export const tsGenericIOSpec: DiagramSpec = {
  id: 'ts-generic-io',
  title: 'Generic input to output',
  nodes: [
    { id: 'definition', label: 'One definition', layer: 'language' },
    { id: 'placeholder', label: 'Type placeholder', layer: 'language' },
    { id: 'call', label: 'Each call', layer: 'runtime' },
    { id: 'filled', label: 'Type filled in', layer: 'engine' },
    { id: 'result', label: 'Typed result', layer: 'language' },
  ],
  edges: [
    { from: 'definition', to: 'placeholder', kind: 'solid', label: 'declares' },
    { from: 'call', to: 'filled', kind: 'solid', label: 'supplies' },
    { from: 'placeholder', to: 'filled', kind: 'dashed', label: 'becomes' },
    { from: 'filled', to: 'result', kind: 'solid', label: 'shapes' },
  ],
  sources: [],
};
