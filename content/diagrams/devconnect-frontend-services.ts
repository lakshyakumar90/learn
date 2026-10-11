import type { DiagramSpec } from './types';

export const devconnectFrontendServicesSpec: DiagramSpec = {
  id: 'devconnect-frontend-services',
  project: 'devconnect',
  title: 'Frontend services folder',
  nodes: [
    { id: 'client', label: 'API client', layer: 'browser' },
    { id: 'users', label: 'User service', layer: 'browser' },
    { id: 'connections', label: 'Connect service', layer: 'browser' },
    { id: 'posts', label: 'Post service', layer: 'browser' },
    { id: 'messages', label: 'Message service', layer: 'browser' },
    { id: 'jobs', label: 'Job service', layer: 'browser' },
    { id: 'notify', label: 'Notify service', layer: 'browser' },
    { id: 'socket', label: 'Socket service', layer: 'browser' },
    { id: 'api', label: 'Express API', layer: 'api', external: true },
  ],
  edges: [
    { from: 'users', to: 'client', kind: 'solid', label: 'uses' },
    { from: 'connections', to: 'client', kind: 'solid', label: 'uses' },
    { from: 'posts', to: 'client', kind: 'solid', label: 'uses' },
    { from: 'messages', to: 'client', kind: 'solid', label: 'uses' },
    { from: 'jobs', to: 'client', kind: 'solid', label: 'uses' },
    { from: 'notify', to: 'client', kind: 'solid', label: 'uses' },
    { from: 'client', to: 'api', kind: 'solid', label: 'REST' },
    { from: 'socket', to: 'api', kind: 'dashed', label: 'live' },
  ],
  sources: [
    'frontend/src/services/apiClient.js',
    'frontend/src/services/userService.js',
    'frontend/src/services/connectionService.js',
    'frontend/src/services/postService.js',
    'frontend/src/services/messageService.js',
    'frontend/src/services/jobService.js',
    'frontend/src/services/notificationService.js',
    'frontend/src/services/socketService.js',
  ],
};
