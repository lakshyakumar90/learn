import type { FlowSpec } from './types';

export const signedInFlow: FlowSpec = {
  id: 'signedin',
  title: 'Signed in',
  diagram: 'system',
  steps: [
    {
      title: 'Draw',
      narration: 'Strokes become elements in the Editor, same as a guest.',
      nodes: ['editor'],
      edges: [],
      path: ['editor'],
      sources: ['packages/engine/src/tools/README.md', 'packages/engine/src/geometry/README.md'],
    },
    {
      title: 'Outbox',
      narration:
        'History capture becomes one durable version per changed element and queues in the Sync outbox.',
      nodes: ['editor', 'outbox'],
      edges: [{ from: 'editor', to: 'outbox', kind: 'solid' }],
      path: ['editor', 'outbox'],
      sources: ['apps/web/src/lib/sync/commits.ts', 'apps/web/src/lib/sync/outbox.ts'],
    },
    {
      title: 'Save',
      narration: 'The Sync outbox sends the queued batch to the HTTP server scenes API.',
      nodes: ['outbox', 'http'],
      edges: [{ from: 'outbox', to: 'http', kind: 'solid' }],
      path: ['outbox', 'http'],
      sources: ['apps/web/src/lib/sync/roomSync.ts', 'apps/http-server/src/routes/scenes.ts'],
    },
    {
      title: 'Store',
      narration: 'The HTTP server stores the batch as a new scene revision in Postgres.',
      nodes: ['http', 'postgres'],
      edges: [{ from: 'http', to: 'postgres', kind: 'solid' }],
      path: ['http', 'postgres'],
      sources: [
        'apps/http-server/src/routes/scenes.ts',
        'packages/db/src/prisma/sceneSync.ts',
      ],
    },
  ],
  sources: [
    'apps/web/src/lib/sync/roomSync.ts',
    'apps/web/src/lib/sync/outbox.ts',
    'apps/web/src/lib/sync/commits.ts',
    'apps/http-server/src/routes/scenes.ts',
    'packages/db/src/prisma/sceneSync.ts',
  ],
};
