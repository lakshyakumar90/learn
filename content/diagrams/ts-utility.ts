import type { DiagramSpec } from './types';

/** Helpers derive new shapes from one source type. */
export const tsUtilitySpec: DiagramSpec = {
  id: 'ts-utility',
  title: 'Utility type transforms',
  nodes: [
    { id: 'source', label: 'Source shape', layer: 'language' },
    { id: 'partial', label: 'All optional', layer: 'language' },
    { id: 'pick', label: 'Chosen fields', layer: 'language' },
    { id: 'omit', label: 'Dropped fields', layer: 'language' },
    { id: 'form', label: 'Form update', layer: 'runtime' },
  ],
  edges: [
    { from: 'source', to: 'partial', kind: 'solid', label: 'relaxes' },
    { from: 'source', to: 'pick', kind: 'solid', label: 'selects' },
    { from: 'source', to: 'omit', kind: 'solid', label: 'removes' },
    { from: 'partial', to: 'form', kind: 'dashed', label: 'feeds' },
  ],
  sources: [],
};
