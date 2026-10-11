import type { DiagramSpec } from './types';

export const devconnectBackendEntrySpec: DiagramSpec = {
  id: 'devconnect-backend-entry',
  project: 'devconnect',
  title: 'Backend entry point',
  nodes: [
    { id: 'entry', label: 'Entry point', layer: 'api' },
    { id: 'routes', label: 'Route modules', layer: 'api' },
    { id: 'socket', label: 'Socket server', layer: 'realtime' },
    { id: 'database', label: 'DB connector', layer: 'api' },
    { id: 'uploads', label: 'Uploads static', layer: 'shared' },
    { id: 'health', label: 'Health checks', layer: 'api' },
    { id: 'mongo', label: 'MongoDB', layer: 'database', external: true },
  ],
  edges: [
    { from: 'entry', to: 'database', kind: 'solid', label: 'connects' },
    { from: 'entry', to: 'routes', kind: 'solid', label: 'mounts' },
    { from: 'entry', to: 'uploads', kind: 'solid', label: 'serves' },
    { from: 'entry', to: 'health', kind: 'solid' },
    { from: 'entry', to: 'socket', kind: 'solid', label: 'starts' },
    { from: 'database', to: 'mongo', kind: 'solid' },
  ],
  sources: ['backend/index.js', 'backend/config/database.js'],
};
