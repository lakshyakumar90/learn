import type { DiagramSpec } from './types';

/** Migrate file by file, tightening checks as you go. */
export const tsMigrationSpec: DiagramSpec = {
  id: 'ts-migration',
  title: 'Migration path',
  nodes: [
    { id: 'js', label: 'Plain files', layer: 'runtime' },
    { id: 'allow', label: 'Allow JS mode', layer: 'engine' },
    { id: 'annotate', label: 'Add notes', layer: 'language' },
    { id: 'rename', label: 'Rename files', layer: 'language' },
    { id: 'strict', label: 'Tighten checks', layer: 'engine' },
    { id: 'typed', label: 'Typed project', layer: 'language' },
  ],
  edges: [
    { from: 'js', to: 'allow', kind: 'solid', label: 'checked as is' },
    { from: 'allow', to: 'annotate', kind: 'dashed', label: 'describe' },
    { from: 'annotate', to: 'rename', kind: 'solid', label: 'convert' },
    { from: 'rename', to: 'strict', kind: 'solid', label: 'raise bar' },
    { from: 'strict', to: 'typed', kind: 'solid', label: 'lands' },
  ],
  sources: [],
};
