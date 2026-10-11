import type { DiagramSpec } from './types';

export const devconnectFeatConnectionsSpec: DiagramSpec = {
  id: 'devconnect-feat-connections',
  project: 'devconnect',
  title: 'Connections slice',
  nodes: [
    { id: 'page', label: 'Search page', layer: 'browser' },
    { id: 'service', label: 'Connect service', layer: 'browser' },
    { id: 'route', label: 'Connect routes', layer: 'api' },
    { id: 'controller', label: 'Connect control', layer: 'api' },
    { id: 'model', label: 'Connect model', layer: 'api' },
    { id: 'notify', label: 'Notify helper', layer: 'api', external: true },
  ],
  edges: [
    { from: 'page', to: 'service', kind: 'solid', label: 'requests' },
    { from: 'service', to: 'route', kind: 'solid', label: 'POST' },
    { from: 'route', to: 'controller', kind: 'solid' },
    { from: 'controller', to: 'model', kind: 'solid', label: 'creates' },
    { from: 'controller', to: 'notify', kind: 'solid', label: 'notifies' },
  ],
  sources: [
    'frontend/src/pages/SearchPage.jsx',
    'frontend/src/services/connectionService.js',
    'backend/routes/connectionRoutes.js',
    'backend/controllers/connectionController.js',
    'backend/models/Connection.js',
  ],
};
