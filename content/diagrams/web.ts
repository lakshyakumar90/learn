import type { DiagramSpec } from './types';

export const webSpec: DiagramSpec = {
  id: 'web',
  title: 'web folder',
  nodes: [
    { id: 'editor', label: 'Editor', layer: 'browser' },
    { id: 'roomsync', label: 'Room sync', layer: 'browser' },
    { id: 'outbox', label: 'Sync outbox', layer: 'browser' },
    { id: 'indexeddb', label: 'IndexedDB', layer: 'browser' },
    { id: 'http', label: 'HTTP API', layer: 'api', external: true },
    { id: 'ws', label: 'WS server', layer: 'realtime', external: true },
  ],
  edges: [
    { from: 'editor', to: 'outbox', kind: 'solid', label: 'commits' },
    { from: 'editor', to: 'indexeddb', kind: 'solid', label: 'autosave' },
    { from: 'outbox', to: 'http', kind: 'solid', label: 'save' },
    { from: 'roomsync', to: 'ws', kind: 'solid', label: 'commit' },
    { from: 'roomsync', to: 'ws', kind: 'dashed', label: 'presence' },
    { from: 'roomsync', to: 'indexeddb', kind: 'solid', label: 'drafts' },
  ],
  sources: [
    'apps/web/README.md',
    'apps/web/src/README.md',
    'apps/web/src/lib/README.md',
    'apps/web/src/lib/sync/README.md',
    'apps/web/src/lib/persistence/README.md',
    'apps/web/src/lib/sync/roomSync.ts',
    'apps/web/src/lib/sync/outbox.ts',
    'apps/web/src/lib/sync/commits.ts',
    'apps/web/src/lib/persistence/indexedDb.ts',
    'apps/web/src/lib/persistence/roomDraft.ts',
  ],
};
