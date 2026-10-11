import type { DiagramSpec } from './types';

export const devconnectFrontendSpec: DiagramSpec = {
  id: 'devconnect-frontend',
  project: 'devconnect',
  title: 'Frontend overview',
  nodes: [
    { id: 'router', label: 'Router', layer: 'browser' },
    { id: 'pages', label: 'Pages', layer: 'browser' },
    { id: 'components', label: 'Components', layer: 'browser' },
    { id: 'store', label: 'Redux store', layer: 'browser' },
    { id: 'services', label: 'API services', layer: 'browser' },
    { id: 'socket', label: 'Socket client', layer: 'browser' },
    { id: 'api', label: 'Express API', layer: 'api', external: true },
    { id: 'socket-server', label: 'Socket server', layer: 'realtime', external: true },
  ],
  edges: [
    { from: 'router', to: 'pages', kind: 'solid', label: 'renders' },
    { from: 'pages', to: 'components', kind: 'solid', label: 'composes' },
    { from: 'pages', to: 'services', kind: 'solid', label: 'calls' },
    { from: 'pages', to: 'store', kind: 'dashed', label: 'selects' },
    { from: 'services', to: 'api', kind: 'solid', label: 'REST' },
    { from: 'socket', to: 'socket-server', kind: 'dashed', label: 'events' },
    { from: 'socket', to: 'store', kind: 'dashed', label: 'dispatches' },
  ],
  sources: [
    'frontend/src/App.jsx',
    'frontend/src/main.jsx',
    'frontend/src/store/store.js',
    'frontend/src/services/apiClient.js',
    'frontend/src/services/socketService.js',
  ],
};
