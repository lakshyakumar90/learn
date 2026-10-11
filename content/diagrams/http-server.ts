import type { DiagramSpec } from './types';

export const httpServerSpec: DiagramSpec = {
  id: 'http-server',
  title: 'http-server folder',
  nodes: [
    { id: 'client', label: 'Web client', layer: 'browser', external: true },
    { id: 'scenes', label: 'Scenes', layer: 'api' },
    { id: 'rooms', label: 'Rooms', layer: 'api' },
    { id: 'invites', label: 'Invites', layer: 'api' },
    { id: 'library', label: 'Library', layer: 'api' },
    { id: 'guest', label: 'Guest import', layer: 'api' },
    { id: 'db', label: 'Database', layer: 'database', external: true },
  ],
  edges: [
    { from: 'client', to: 'scenes', kind: 'solid', label: 'CRUD' },
    { from: 'client', to: 'rooms', kind: 'solid', label: 'CRUD' },
    { from: 'client', to: 'invites', kind: 'solid', label: 'invites' },
    { from: 'client', to: 'library', kind: 'solid', label: 'CRUD' },
    { from: 'guest', to: 'scenes', kind: 'solid', label: 'import' },
    { from: 'scenes', to: 'db', kind: 'solid', label: 'store' },
    { from: 'rooms', to: 'db', kind: 'solid', label: 'store' },
    { from: 'library', to: 'db', kind: 'solid', label: 'store' },
  ],
  sources: [
    'apps/http-server/README.md',
    'apps/http-server/src/README.md',
    'apps/http-server/src/routes/README.md',
    'apps/http-server/src/routes/scenes.ts',
    'apps/http-server/src/routes/rooms.ts',
    'apps/http-server/src/routes/roomInvites.ts',
    'apps/http-server/src/routes/library.ts',
    'apps/http-server/src/routes/guestImport.ts',
  ],
};
