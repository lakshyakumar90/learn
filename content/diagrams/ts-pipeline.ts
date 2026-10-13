import type { DiagramSpec } from './types';

/** Source is checked, types are erased, plain JavaScript runs. */
export const tsPipelineSpec: DiagramSpec = {
  id: 'ts-pipeline',
  title: 'TypeScript pipeline',
  nodes: [
    { id: 'source', label: 'Source file', layer: 'language' },
    { id: 'checker', label: 'Type checker', layer: 'engine' },
    { id: 'errors', label: 'Error report', layer: 'engine' },
    { id: 'emit', label: 'Emit step', layer: 'engine' },
    { id: 'erased', label: 'Types erased', layer: 'language' },
    { id: 'js', label: 'Plain JavaScript', layer: 'runtime' },
    { id: 'run', label: 'Runtime', layer: 'runtime' },
  ],
  edges: [
    { from: 'source', to: 'checker', kind: 'solid', label: 'reads' },
    { from: 'checker', to: 'errors', kind: 'dashed', label: 'reports' },
    { from: 'source', to: 'emit', kind: 'solid', label: 'strips' },
    { from: 'emit', to: 'erased', kind: 'solid', label: 'drops' },
    { from: 'erased', to: 'js', kind: 'solid', label: 'leaves' },
    { from: 'js', to: 'run', kind: 'solid', label: 'executes' },
  ],
  sources: [],
};
