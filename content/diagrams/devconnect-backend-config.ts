import type { DiagramSpec } from './types';

export const devconnectBackendConfigSpec: DiagramSpec = {
  id: 'devconnect-backend-config',
  project: 'devconnect',
  title: 'Backend config folder',
  nodes: [
    { id: 'database', label: 'DB connector', layer: 'api' },
    { id: 'redis', label: 'Redis clients', layer: 'realtime' },
    { id: 'cloudinary', label: 'Cloudinary setup', layer: 'shared' },
    { id: 'mongo', label: 'MongoDB', layer: 'database', external: true },
    { id: 'cache', label: 'Redis server', layer: 'cache', external: true },
    { id: 'cdn', label: 'Cloudinary API', layer: 'shared', external: true },
    { id: 'entry', label: 'Entry point', layer: 'api', external: true },
    { id: 'socket', label: 'Socket server', layer: 'realtime', external: true },
    { id: 'upload', label: 'Upload middle', layer: 'api', external: true },
  ],
  edges: [
    { from: 'entry', to: 'database', kind: 'solid', label: 'requires' },
    { from: 'database', to: 'mongo', kind: 'solid' },
    { from: 'redis', to: 'cache', kind: 'dashed', label: 'lazy' },
    { from: 'socket', to: 'redis', kind: 'dashed', label: 'adapter' },
    { from: 'cloudinary', to: 'cdn', kind: 'solid', label: 'configures' },
    { from: 'upload', to: 'cloudinary', kind: 'solid', label: 'reads' },
  ],
  sources: [
    'backend/config/database.js',
    'backend/config/redis.js',
    'backend/config/cloudinary.js',
    'backend/index.js',
  ],
};
