import type { DiagramSpec } from './types';

export const devconnectFrontendUtilsSpec: DiagramSpec = {
  id: 'devconnect-frontend-utils',
  project: 'devconnect',
  title: 'Frontend utils folder',
  nodes: [
    { id: 'redirect', label: 'Login redirect', layer: 'browser' },
    { id: 'guard', label: 'Route guard', layer: 'browser', external: true },
    { id: 'auth', label: 'Auth pages', layer: 'browser', external: true },
  ],
  edges: [
    { from: 'guard', to: 'redirect', kind: 'solid', label: 'remembers' },
    { from: 'auth', to: 'redirect', kind: 'solid', label: 'returns' },
  ],
  sources: [
    'frontend/src/utils/redirectUtils.js',
    'frontend/src/components/ProtectedRoute.jsx',
    'frontend/src/pages/LoginPage.jsx',
  ],
};
