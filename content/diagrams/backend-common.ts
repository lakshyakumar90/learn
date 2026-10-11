import type { DiagramSpec } from './types';

export const backendCommonSpec: DiagramSpec = {
  id: 'backend-common',
  title: 'backend-common package',
  nodes: [
    { id: 'commit', label: 'Commit path', layer: 'shared' },
    { id: 'files', label: 'File attach', layer: 'shared' },
    { id: 'syncread', label: 'Sync read', layer: 'shared' },
    { id: 'presence', label: 'Presence transport', layer: 'shared' },
    { id: 'reconcile', label: 'Reconcile', layer: 'shared', external: true },
    { id: 'db', label: 'Database', layer: 'database', external: true },
    { id: 'redis', label: 'Redis', layer: 'cache', external: true },
  ],
  edges: [
    { from: 'commit', to: 'reconcile', kind: 'solid', label: 'merge' },
    { from: 'commit', to: 'redis', kind: 'solid', label: 'snapshot' },
    { from: 'commit', to: 'db', kind: 'solid', label: 'append' },
    { from: 'syncread', to: 'redis', kind: 'solid', label: 'warm' },
    { from: 'syncread', to: 'db', kind: 'solid', label: 'head' },
    { from: 'files', to: 'db', kind: 'solid', label: 'store' },
    { from: 'presence', to: 'redis', kind: 'dashed', label: 'live' },
  ],
  sources: [
    'packages/backend-common/README.md',
    'packages/backend-common/src/README.md',
    'packages/backend-common/src/collaboration.ts',
    'packages/backend-common/src/presenceTransport.ts',
  ],
};
