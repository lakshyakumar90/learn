import type { DiagramSpec } from './types';

export const devconnectBackendMiddlewareSpec: DiagramSpec = {
  id: 'devconnect-backend-middleware',
  project: 'devconnect',
  title: 'Backend middleware folder',
  nodes: [
    { id: 'protect', label: 'Auth guard', layer: 'api' },
    { id: 'limits', label: 'Rate limits', layer: 'api' },
    { id: 'upload', label: 'Upload middle', layer: 'api' },
    { id: 'routes', label: 'Routes', layer: 'api', external: true },
    { id: 'models', label: 'User model', layer: 'api', external: true },
    { id: 'cloudinary', label: 'Cloudinary', layer: 'shared', external: true },
    { id: 'local', label: 'Local uploads', layer: 'shared', external: true },
  ],
  edges: [
    { from: 'routes', to: 'protect', kind: 'solid', label: 'verifies' },
    { from: 'protect', to: 'models', kind: 'solid', label: 'loads user' },
    { from: 'routes', to: 'limits', kind: 'dashed', label: 'throttles' },
    { from: 'routes', to: 'upload', kind: 'solid', label: 'parses files' },
    { from: 'upload', to: 'cloudinary', kind: 'solid', label: 'or cloud' },
    { from: 'upload', to: 'local', kind: 'solid', label: 'or local' },
  ],
  sources: [
    'backend/middleware/authMiddleware.js',
    'backend/middleware/rateLimiter.js',
    'backend/middleware/upload.js',
  ],
};
