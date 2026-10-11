import type { DiagramSpec } from './types';

export const devconnectBackendUtilsSpec: DiagramSpec = {
  id: 'devconnect-backend-utils',
  project: 'devconnect',
  title: 'Backend utils folder',
  nodes: [
    { id: 'socket', label: 'Socket server', layer: 'realtime' },
    { id: 'presence', label: 'Presence map', layer: 'realtime' },
    { id: 'rooms', label: 'User rooms', layer: 'realtime' },
    { id: 'redis', label: 'Redis', layer: 'cache', external: true },
    { id: 'mongo', label: 'MongoDB', layer: 'database', external: true },
    { id: 'entry', label: 'Entry point', layer: 'api', external: true },
    { id: 'controllers', label: 'Controllers', layer: 'api', external: true },
  ],
  edges: [
    { from: 'entry', to: 'socket', kind: 'solid', label: 'starts' },
    { from: 'socket', to: 'rooms', kind: 'dashed', label: 'joins' },
    { from: 'socket', to: 'presence', kind: 'solid', label: 'tracks' },
    { from: 'presence', to: 'redis', kind: 'solid', label: 'shares' },
    { from: 'socket', to: 'redis', kind: 'dashed', label: 'adapter' },
    { from: 'socket', to: 'mongo', kind: 'solid', label: 'messages' },
    { from: 'controllers', to: 'socket', kind: 'dashed', label: 'emits' },
  ],
  sources: ['backend/utils/socket.js', 'backend/index.js'],
};
