import type { DiagramSpec } from './types';

export const devconnectFrontendStoreSpec: DiagramSpec = {
  id: 'devconnect-frontend-store',
  project: 'devconnect',
  title: 'Frontend store folder',
  nodes: [
    { id: 'store', label: 'Store setup', layer: 'browser' },
    { id: 'auth', label: 'Auth slice', layer: 'browser' },
    { id: 'chat', label: 'Chat slice', layer: 'browser' },
    { id: 'connections', label: 'Connect slice', layer: 'browser' },
    { id: 'posts', label: 'Post slices', layer: 'browser' },
    { id: 'jobs', label: 'Job slice', layer: 'browser' },
    { id: 'notify', label: 'Notify slice', layer: 'browser' },
    { id: 'presence', label: 'Presence slice', layer: 'browser' },
    { id: 'profiles', label: 'Profile slice', layer: 'browser' },
    { id: 'pages', label: 'Pages', layer: 'browser', external: true },
    { id: 'socket', label: 'Socket service', layer: 'browser', external: true },
  ],
  edges: [
    { from: 'store', to: 'auth', kind: 'solid', label: 'combines' },
    { from: 'store', to: 'chat', kind: 'solid', label: 'combines' },
    { from: 'store', to: 'presence', kind: 'solid', label: 'combines' },
    { from: 'pages', to: 'auth', kind: 'dashed', label: 'selects' },
    { from: 'pages', to: 'chat', kind: 'dashed', label: 'selects' },
    { from: 'socket', to: 'chat', kind: 'dashed', label: 'dispatches' },
    { from: 'socket', to: 'notify', kind: 'dashed', label: 'dispatches' },
    { from: 'socket', to: 'presence', kind: 'dashed', label: 'dispatches' },
  ],
  sources: [
    'frontend/src/store/store.js',
    'frontend/src/store/slices/authSlice.js',
    'frontend/src/store/slices/chatSlice.js',
    'frontend/src/store/slices/connectionSlice.js',
    'frontend/src/store/slices/notificationSlice.js',
    'frontend/src/store/slices/presenceSlice.js',
  ],
};
