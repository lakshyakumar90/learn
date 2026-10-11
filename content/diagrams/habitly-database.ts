import type { DiagramSpec } from './types';

export const habitlyDatabaseSpec: DiagramSpec = {
  id: 'habitly-database',
  project: 'habitly',
  title: 'Local database',
  nodes: [
    { id: 'client', label: 'DB client', layer: 'localdata' },
    { id: 'repos', label: 'Repositories', layer: 'localdata' },
    { id: 'sqlite', label: 'SQLite', layer: 'localdata' },
    { id: 'outbox', label: 'Outbox', layer: 'localdata' },
    { id: 'triggers', label: 'Sync triggers', layer: 'localdata' },
    { id: 'features', label: 'Features', layer: 'features', external: true },
    { id: 'sync', label: 'Cloud sync', layer: 'cloud', external: true },
  ],
  edges: [
    { from: 'features', to: 'repos', kind: 'solid', label: 'calls' },
    { from: 'repos', to: 'sqlite', kind: 'solid', label: 'writes' },
    { from: 'client', to: 'sqlite', kind: 'solid', label: 'migrates' },
    { from: 'sqlite', to: 'triggers', kind: 'solid', label: 'fires' },
    { from: 'triggers', to: 'outbox', kind: 'solid', label: 'queues' },
    { from: 'outbox', to: 'sync', kind: 'dashed', label: 'uploads' },
  ],
  sources: [
    'src/database/client.ts',
    'src/database/repositories.ts',
  ],
};
