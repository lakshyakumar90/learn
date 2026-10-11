import type { DiagramSpec } from './types';

export const dbSpec: DiagramSpec = {
  id: 'db',
  title: 'db package',
  nodes: [
    { id: 'http', label: 'HTTP server', layer: 'api', external: true },
    { id: 'worker', label: 'Flush worker', layer: 'api', external: true },
    { id: 'scenes', label: 'Scene revisions', layer: 'database' },
    { id: 'access', label: 'Room access', layer: 'database' },
    { id: 'library', label: 'Library items', layer: 'database' },
    { id: 'client', label: 'DB client', layer: 'database' },
    { id: 'postgres', label: 'Postgres', layer: 'database', external: true },
  ],
  edges: [
    { from: 'http', to: 'scenes', kind: 'solid', label: 'CRUD' },
    { from: 'http', to: 'access', kind: 'solid', label: 'roles' },
    { from: 'http', to: 'library', kind: 'solid', label: 'CRUD' },
    { from: 'worker', to: 'scenes', kind: 'solid', label: 'flush' },
    { from: 'scenes', to: 'postgres', kind: 'solid', label: 'rows' },
    { from: 'access', to: 'postgres', kind: 'solid', label: 'rows' },
    { from: 'library', to: 'postgres', kind: 'solid', label: 'rows' },
    { from: 'client', to: 'postgres', kind: 'solid', label: 'pool' },
  ],
  sources: [
    'packages/db/README.md',
    'packages/db/src/README.md',
    'packages/db/src/prisma/README.md',
    'packages/db/src/prisma/db.ts',
    'packages/db/src/prisma/sceneSync.ts',
    'packages/db/src/prisma/roomAccess.ts',
    'packages/db/src/prisma/library.ts',
  ],
};
