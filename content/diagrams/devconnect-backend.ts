import type { DiagramSpec } from './types';

export const devconnectBackendSpec: DiagramSpec = {
  id: 'devconnect-backend',
  project: 'devconnect',
  title: 'Backend overview',
  nodes: [
    { id: 'entry', label: 'Entry point', layer: 'api' },
    { id: 'routes', label: 'Routes', layer: 'api' },
    { id: 'middleware', label: 'Middleware', layer: 'api' },
    { id: 'controllers', label: 'Controllers', layer: 'api' },
    { id: 'models', label: 'Models', layer: 'api' },
    { id: 'socket', label: 'Socket server', layer: 'realtime' },
    { id: 'redis', label: 'Redis', layer: 'cache', external: true },
    { id: 'mongo', label: 'MongoDB', layer: 'database', external: true },
    { id: 'uploads', label: 'Upload storage', layer: 'shared', external: true },
  ],
  edges: [
    { from: 'entry', to: 'routes', kind: 'solid', label: 'mounts' },
    { from: 'entry', to: 'socket', kind: 'solid', label: 'starts' },
    { from: 'routes', to: 'middleware', kind: 'solid', label: 'guards' },
    { from: 'routes', to: 'controllers', kind: 'solid' },
    { from: 'controllers', to: 'models', kind: 'solid' },
    { from: 'models', to: 'mongo', kind: 'solid', label: 'writes' },
    { from: 'controllers', to: 'uploads', kind: 'solid', label: 'files' },
    { from: 'controllers', to: 'socket', kind: 'dashed', label: 'notify' },
    { from: 'socket', to: 'redis', kind: 'dashed', label: 'adapter' },
    { from: 'socket', to: 'mongo', kind: 'solid', label: 'messages' },
  ],
  sources: [
    'backend/index.js',
    'backend/routes/authRoutes.js',
    'backend/middleware/authMiddleware.js',
    'backend/controllers/notificationController.js',
    'backend/utils/socket.js',
  ],
};
