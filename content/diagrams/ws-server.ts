import type { DiagramSpec } from './types';

export const wsServerSpec: DiagramSpec = {
  id: 'ws-server',
  title: 'ws-server folder',
  nodes: [
    { id: 'client', label: 'Browser client', layer: 'browser', external: true },
    { id: 'presence', label: 'Presence', layer: 'realtime' },
    { id: 'commits', label: 'Commits', layer: 'realtime' },
    { id: 'previews', label: 'Previews', layer: 'realtime' },
    { id: 'sync', label: 'Sync snapshots', layer: 'realtime' },
    { id: 'collab', label: 'Collab service', layer: 'shared', external: true },
    { id: 'redis', label: 'Redis', layer: 'cache', external: true },
  ],
  edges: [
    { from: 'client', to: 'presence', kind: 'dashed', label: 'live' },
    { from: 'client', to: 'commits', kind: 'solid', label: 'edits' },
    { from: 'client', to: 'previews', kind: 'dashed', label: 'drafts' },
    { from: 'client', to: 'sync', kind: 'solid', label: 'request' },
    { from: 'commits', to: 'collab', kind: 'solid', label: 'apply' },
    { from: 'sync', to: 'collab', kind: 'solid', label: 'read' },
    { from: 'collab', to: 'redis', kind: 'solid', label: 'state' },
    { from: 'presence', to: 'redis', kind: 'dashed', label: 'join' },
    { from: 'previews', to: 'client', kind: 'dashed', label: 'fan-out' },
  ],
  sources: [
    'apps/ws-server/README.md',
    'apps/ws-server/src/README.md',
    'apps/ws-server/src/server.ts',
    'apps/ws-server/src/roomStore.ts',
    'packages/backend-common/src/collaboration.ts',
  ],
};
