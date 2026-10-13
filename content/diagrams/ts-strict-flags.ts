import type { DiagramSpec } from './types';

/** One switch arms the whole strict family. */
export const tsStrictFlagsSpec: DiagramSpec = {
  id: 'ts-strict-flags',
  title: 'Strict mode family',
  nodes: [
    { id: 'switch', label: 'Strict switch', layer: 'language' },
    { id: 'null', label: 'Null checks', layer: 'engine' },
    { id: 'init', label: 'Init checks', layer: 'engine' },
    { id: 'implicit', label: 'No silent any', layer: 'engine' },
    { id: 'legacy', label: 'Legacy project', layer: 'runtime' },
    { id: 'errors', label: 'New errors', layer: 'engine' },
    { id: 'fixed', label: 'Real bugs fixed', layer: 'runtime' },
  ],
  edges: [
    { from: 'switch', to: 'null', kind: 'solid', label: 'arms' },
    { from: 'switch', to: 'init', kind: 'solid', label: 'arms' },
    { from: 'switch', to: 'implicit', kind: 'solid', label: 'arms' },
    { from: 'legacy', to: 'errors', kind: 'dashed', label: 'surfaces' },
    { from: 'errors', to: 'fixed', kind: 'solid', label: 'become' },
  ],
  sources: [],
};
