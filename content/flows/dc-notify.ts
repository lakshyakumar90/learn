import type { FlowSpec } from './types';

export const dcNotifyFlow: FlowSpec = {
  id: 'dc-notify',
  project: 'devconnect',
  title: 'Notify',
  diagram: 'devconnect-system',
  steps: [
    {
      title: 'Trigger action',
      narration: 'A like, comment, request, application, or message runs its controller first; notifications never start on their own.',
      nodes: ['react-app', 'services', 'routes', 'controllers'],
      edges: [
        { from: 'services', to: 'routes', kind: 'solid' },
        { from: 'routes', to: 'controllers', kind: 'solid' },
      ],
      path: ['react-app', 'services', 'routes', 'controllers'],
      sources: ['backend/controllers/postController.js', 'backend/controllers/connectionController.js'],
    },
    {
      title: 'Store',
      narration: 'The notify helper stores the notification row, skipping self-notifications, and loads the sender profile.',
      nodes: ['controllers', 'models', 'mongo'],
      edges: [
        { from: 'controllers', to: 'models', kind: 'solid' },
        { from: 'models', to: 'mongo', kind: 'solid' },
      ],
      path: ['controllers', 'models', 'mongo'],
      sources: ['backend/controllers/notificationController.js', 'backend/models/Notification.js'],
    },
    {
      title: 'Push live',
      narration: 'The helper emits into the recipient room; the socket service drops it into the notification slice at once.',
      nodes: ['controllers', 'socket-server', 'socket-client', 'redux'],
      edges: [
        { from: 'controllers', to: 'socket-server', kind: 'dashed' },
        { from: 'socket-server', to: 'socket-client', kind: 'dashed' },
        { from: 'socket-client', to: 'redux', kind: 'dashed' },
      ],
      path: ['controllers', 'socket-server', 'socket-client', 'redux'],
      sources: ['backend/controllers/notificationController.js', 'frontend/src/services/socketService.js'],
    },
    {
      title: 'Catch up',
      narration: 'The bell fetches the paged list with the unread count; opening it marks items read one by one or all at once.',
      nodes: ['react-app', 'services', 'routes', 'controllers', 'models'],
      edges: [
        { from: 'services', to: 'routes', kind: 'solid' },
        { from: 'routes', to: 'controllers', kind: 'solid' },
        { from: 'controllers', to: 'models', kind: 'solid' },
      ],
      path: ['react-app', 'services', 'routes', 'controllers', 'models'],
      sources: [
        'frontend/src/components/notifications/NotificationBell.jsx',
        'frontend/src/services/notificationService.js',
        'backend/routes/notificationRoutes.js',
      ],
    },
  ],
  sources: [
    'backend/controllers/notificationController.js',
    'frontend/src/services/notificationService.js',
    'backend/routes/notificationRoutes.js',
  ],
};
