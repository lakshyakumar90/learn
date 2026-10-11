import type { FlowSpec } from './types';

export const dcConnectionFlow: FlowSpec = {
  id: 'dc-connection',
  project: 'devconnect',
  title: 'Connect',
  diagram: 'devconnect-system',
  steps: [
    {
      title: 'Find developers',
      narration: 'The search page lists developers the user is not yet connected to, with skill and location filters.',
      nodes: ['react-app', 'services', 'routes', 'controllers', 'models', 'mongo'],
      edges: [
        { from: 'services', to: 'routes', kind: 'solid' },
        { from: 'routes', to: 'controllers', kind: 'solid' },
        { from: 'controllers', to: 'models', kind: 'solid' },
        { from: 'models', to: 'mongo', kind: 'solid' },
      ],
      path: ['react-app', 'services', 'routes', 'controllers', 'models', 'mongo'],
      sources: [
        'frontend/src/pages/SearchPage.jsx',
        'frontend/src/services/userService.js',
        'backend/routes/userRoutes.js',
        'backend/controllers/userController.js',
      ],
    },
    {
      title: 'Send request',
      narration: 'The connection service posts to the request route; the controller stores a pending connection.',
      nodes: ['react-app', 'services', 'routes', 'controllers', 'models', 'mongo'],
      edges: [
        { from: 'services', to: 'routes', kind: 'solid' },
        { from: 'routes', to: 'controllers', kind: 'solid' },
        { from: 'controllers', to: 'models', kind: 'solid' },
        { from: 'models', to: 'mongo', kind: 'solid' },
      ],
      path: ['react-app', 'services', 'routes', 'controllers', 'models', 'mongo'],
      sources: [
        'frontend/src/services/connectionService.js',
        'backend/routes/connectionRoutes.js',
        'backend/controllers/connectionController.js',
        'backend/models/Connection.js',
      ],
    },
    {
      title: 'Recipient notified',
      narration: 'Sending a request also stores a notification and pushes it over the socket channel.',
      nodes: ['controllers', 'models', 'mongo', 'socket-server'],
      edges: [
        { from: 'controllers', to: 'models', kind: 'solid' },
        { from: 'models', to: 'mongo', kind: 'solid' },
        { from: 'controllers', to: 'socket-server', kind: 'dashed' },
      ],
      path: ['controllers', 'models', 'mongo'],
      sources: ['backend/controllers/notificationController.js'],
    },
    {
      title: 'Accept',
      narration: 'The recipient accepts from the requests page; the connection flips to accepted and the sender is notified.',
      nodes: ['react-app', 'services', 'routes', 'controllers', 'models', 'mongo'],
      edges: [
        { from: 'services', to: 'routes', kind: 'solid' },
        { from: 'routes', to: 'controllers', kind: 'solid' },
        { from: 'controllers', to: 'models', kind: 'solid' },
        { from: 'models', to: 'mongo', kind: 'solid' },
      ],
      path: ['react-app', 'services', 'routes', 'controllers', 'models', 'mongo'],
      sources: [
        'frontend/src/pages/RequestsPage.jsx',
        'backend/controllers/connectionController.js',
      ],
    },
    {
      title: 'Chat unlocked',
      narration: 'Only accepted connections (or active job pairs) may exchange messages over the socket channel.',
      nodes: ['socket-client', 'socket-server'],
      edges: [{ from: 'socket-client', to: 'socket-server', kind: 'dashed' }],
      path: ['socket-client', 'socket-server'],
      sources: ['backend/utils/socket.js', 'backend/controllers/messageController.js'],
    },
  ],
  sources: [
    'frontend/src/services/connectionService.js',
    'backend/routes/connectionRoutes.js',
    'backend/controllers/connectionController.js',
  ],
};
