import type { FlowSpec } from './types';

export const roomFlow: FlowSpec = {
  id: 'room',
  title: 'Room',
  diagram: 'system',
  steps: [
    {
      title: 'Ticket',
      narration: 'The Editor asks the HTTP server rooms API for a presence ticket.',
      nodes: ['editor', 'http'],
      edges: [],
      path: ['editor', 'http'],
      sources: ['apps/http-server/src/routes/rooms.ts'],
    },
    {
      title: 'Connect',
      narration:
        'The socket upgrade verifies the ticket, and the Editor joins the WS server room.',
      nodes: ['editor', 'ws'],
      edges: [],
      path: ['editor', 'ws'],
      sources: ['apps/ws-server/src/server.ts'],
    },
    {
      title: 'Commit',
      narration: 'The Editor sends a commit over the solid edge to the WS server.',
      nodes: ['editor', 'ws'],
      edges: [{ from: 'editor', to: 'ws', kind: 'solid' }],
      path: ['editor', 'ws'],
      sources: ['apps/ws-server/src/server.ts', 'packages/common/src/collab.ts'],
    },
    {
      title: 'Reconcile',
      narration:
        'The WS server reconciles winners per element and writes the Redis snapshot.',
      nodes: ['ws', 'redis'],
      edges: [{ from: 'ws', to: 'redis', kind: 'solid' }],
      path: ['ws', 'redis'],
      sources: [
        'packages/backend-common/src/collaboration.ts',
        'packages/redis/src/index.ts',
        'packages/common/src/sync.ts',
      ],
    },
    {
      title: 'Publish',
      narration:
        'Committed winners broadcast back to the Editor, which acknowledges them.',
      nodes: ['ws', 'editor'],
      edges: [{ from: 'ws', to: 'editor', kind: 'dashed' }],
      path: ['ws', 'editor'],
      sources: ['apps/ws-server/src/server.ts'],
    },
    {
      title: 'Flush',
      narration:
        'Separately, the Flush worker debounce fires and writes a durable revision to Postgres.',
      nodes: ['redis', 'worker', 'postgres'],
      edges: [
        { from: 'redis', to: 'worker', kind: 'solid' },
        { from: 'worker', to: 'postgres', kind: 'solid' },
      ],
      path: ['redis', 'worker', 'postgres'],
      sources: ['apps/flush-worker/src/index.ts', 'packages/redis/src/index.ts'],
    },
    {
      title: 'Ephemeral',
      narration:
        'Cursors and previews travel the dashed edge and are never stored.',
      nodes: ['editor', 'ws'],
      edges: [{ from: 'editor', to: 'ws', kind: 'dashed' }],
      path: ['editor', 'ws'],
      sources: ['apps/ws-server/src/server.ts', 'apps/ws-server/src/roomStore.ts'],
    },
  ],
  sources: [
    'apps/http-server/src/routes/rooms.ts',
    'apps/ws-server/src/server.ts',
    'packages/backend-common/src/collaboration.ts',
    'packages/redis/src/index.ts',
    'apps/flush-worker/src/index.ts',
  ],
};
