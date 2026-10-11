import type { DiagramSpec } from './types';

export const devconnectBackendModelsSpec: DiagramSpec = {
  id: 'devconnect-backend-models',
  project: 'devconnect',
  title: 'Backend models folder',
  nodes: [
    { id: 'user', label: 'User model', layer: 'api' },
    { id: 'connection', label: 'Connection model', layer: 'api' },
    { id: 'post', label: 'Post model', layer: 'api' },
    { id: 'chat', label: 'Chat model', layer: 'api' },
    { id: 'notify', label: 'Notify model', layer: 'api' },
    { id: 'job', label: 'Job model', layer: 'api' },
    { id: 'mongo', label: 'MongoDB', layer: 'database', external: true },
    { id: 'controllers', label: 'Controllers', layer: 'api', external: true },
  ],
  edges: [
    { from: 'controllers', to: 'user', kind: 'solid' },
    { from: 'controllers', to: 'connection', kind: 'solid' },
    { from: 'controllers', to: 'post', kind: 'solid' },
    { from: 'controllers', to: 'chat', kind: 'solid' },
    { from: 'controllers', to: 'notify', kind: 'solid' },
    { from: 'controllers', to: 'job', kind: 'solid' },
    { from: 'user', to: 'mongo', kind: 'solid', label: 'users' },
    { from: 'chat', to: 'mongo', kind: 'solid', label: 'messages' },
    { from: 'post', to: 'mongo', kind: 'solid', label: 'posts' },
  ],
  sources: [
    'backend/models/User.js',
    'backend/models/Connection.js',
    'backend/models/Post.js',
    'backend/models/Chat.js',
    'backend/models/Notification.js',
    'backend/models/Job.js',
  ],
};
