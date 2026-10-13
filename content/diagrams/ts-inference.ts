import type { DiagramSpec } from './types';

/** Annotations and inference feed the same checker. */
export const tsInferenceSpec: DiagramSpec = {
  id: 'ts-inference',
  title: 'Annotations and inference',
  nodes: [
    { id: 'value', label: 'Value written', layer: 'language' },
    { id: 'annotation', label: 'Annotation', layer: 'language' },
    { id: 'inference', label: 'Inference', layer: 'engine' },
    { id: 'known', label: 'Known type', layer: 'language' },
    { id: 'mismatch', label: 'Mismatch error', layer: 'engine' },
  ],
  edges: [
    { from: 'value', to: 'inference', kind: 'solid', label: 'implies' },
    { from: 'annotation', to: 'known', kind: 'solid', label: 'declares' },
    { from: 'inference', to: 'known', kind: 'solid', label: 'fills in' },
    { from: 'annotation', to: 'mismatch', kind: 'dashed', label: 'rejects' },
  ],
  sources: [],
};
