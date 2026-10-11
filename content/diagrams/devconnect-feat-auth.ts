import type { DiagramSpec } from './types';

export const devconnectFeatAuthSpec: DiagramSpec = {
  id: 'devconnect-feat-auth',
  project: 'devconnect',
  title: 'Authentication slice',
  nodes: [
    { id: 'page', label: 'Auth pages', layer: 'browser' },
    { id: 'service', label: 'User service', layer: 'browser' },
    { id: 'route', label: 'User routes', layer: 'api' },
    { id: 'controller', label: 'User control', layer: 'api' },
    { id: 'model', label: 'User model', layer: 'api' },
    { id: 'mongo', label: 'MongoDB', layer: 'database', external: true },
  ],
  edges: [
    { from: 'page', to: 'service', kind: 'solid', label: 'register' },
    { from: 'service', to: 'route', kind: 'solid', label: 'POST' },
    { from: 'route', to: 'controller', kind: 'solid' },
    { from: 'controller', to: 'model', kind: 'solid', label: 'creates' },
    { from: 'model', to: 'mongo', kind: 'solid', label: 'writes' },
  ],
  sources: [
    'frontend/src/pages/SignupPage.jsx',
    'frontend/src/services/userService.js',
    'backend/routes/userRoutes.js',
    'backend/controllers/userController.js',
    'backend/models/User.js',
  ],
};
