import type { DiagramSpec } from './types';

/** Numeric enums emit objects; string unions erase fully. */
export const tsEnumUnionSpec: DiagramSpec = {
  id: 'ts-enum-union',
  title: 'Enum versus string union',
  nodes: [
    { id: 'enum', label: 'Enum list', layer: 'language' },
    { id: 'runtime', label: 'Runtime object', layer: 'runtime' },
    { id: 'union', label: 'String union', layer: 'language' },
    { id: 'erased', label: 'Erased fully', layer: 'engine' },
    { id: 'choice', label: 'Pick one', layer: 'language' },
  ],
  edges: [
    { from: 'enum', to: 'runtime', kind: 'solid', label: 'emits' },
    { from: 'union', to: 'erased', kind: 'solid', label: 'vanishes' },
    { from: 'choice', to: 'enum', kind: 'dashed', label: 'needs values' },
    { from: 'choice', to: 'union', kind: 'dashed', label: 'needs names' },
  ],
  sources: [],
};
