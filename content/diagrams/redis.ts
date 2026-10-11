import type { DiagramSpec } from './types';

export const redisSpec: DiagramSpec = {
  id: 'redis',
  title: 'redis package',
  nodes: [
    { id: 'ws', label: 'WS server', layer: 'realtime', external: true },
    { id: 'worker', label: 'Flush worker', layer: 'api', external: true },
    { id: 'snapshots', label: 'Room snapshots', layer: 'cache' },
    { id: 'bus', label: 'Event bus', layer: 'cache' },
    { id: 'queue', label: 'Flush queue', layer: 'cache' },
    { id: 'presence', label: 'Participants', layer: 'cache' },
    { id: 'limits', label: 'Rate limits', layer: 'cache' },
  ],
  edges: [
    { from: 'ws', to: 'snapshots', kind: 'solid', label: 'writes' },
    { from: 'ws', to: 'bus', kind: 'solid', label: 'events' },
    { from: 'ws', to: 'presence', kind: 'dashed', label: 'join' },
    { from: 'ws', to: 'limits', kind: 'dashed', label: 'budgets' },
    { from: 'snapshots', to: 'queue', kind: 'solid', label: 'schedule' },
    { from: 'queue', to: 'worker', kind: 'solid', label: 'jobs' },
  ],
  sources: [
    'packages/redis/README.md',
    'packages/redis/src/README.md',
    'packages/redis/src/index.ts',
  ],
};
