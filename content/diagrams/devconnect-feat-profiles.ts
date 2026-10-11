import type { DiagramSpec } from './types';

export const devconnectFeatProfilesSpec: DiagramSpec = {
  id: 'devconnect-feat-profiles',
  project: 'devconnect',
  title: 'Profiles and uploads slice',
  nodes: [
    { id: 'page', label: 'Profile page', layer: 'browser' },
    { id: 'service', label: 'User service', layer: 'browser' },
    { id: 'route', label: 'User routes', layer: 'api' },
    { id: 'upload', label: 'Upload middle', layer: 'api' },
    { id: 'controller', label: 'User control', layer: 'api' },
    { id: 'cloudinary', label: 'Cloudinary', layer: 'shared', external: true },
  ],
  edges: [
    { from: 'page', to: 'service', kind: 'solid', label: 'saves' },
    { from: 'service', to: 'route', kind: 'solid', label: 'PUT' },
    { from: 'route', to: 'upload', kind: 'solid', label: 'file' },
    { from: 'upload', to: 'cloudinary', kind: 'solid', label: 'stores' },
    { from: 'upload', to: 'controller', kind: 'solid' },
  ],
  sources: [
    'frontend/src/pages/ProfilePage.jsx',
    'frontend/src/services/userService.js',
    'backend/routes/userRoutes.js',
    'backend/middleware/upload.js',
    'backend/controllers/userController.js',
  ],
};
