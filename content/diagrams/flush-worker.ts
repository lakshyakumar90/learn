import type { DiagramSpec } from './types';

export const flushWorkerSpec: DiagramSpec = {
  id: 'flush-worker',
  title: 'flush-worker folder',
  nodes: [
    { id: 'scheduler', label: 'Scheduler', layer: 'api' },
    { id: 'jobs', label: 'Flush jobs', layer: 'api' },
    { id: 'redis', label: 'Redis', layer: 'cache', external: true },
    { id: 'postgres', label: 'Postgres', layer: 'database', external: true },
  ],
  edges: [
    { from: 'scheduler', to: 'redis', kind: 'solid', label: 'dirty rooms' },
    { from: 'redis', to: 'jobs', kind: 'solid', label: 'snapshots' },
    { from: 'jobs', to: 'postgres', kind: 'solid', label: 'revisions' },
  ],
  sources: [
    'apps/flush-worker/README.md',
    'apps/flush-worker/src/README.md',
    'apps/flush-worker/src/index.ts',
  ],
};
