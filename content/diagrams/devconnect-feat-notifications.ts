import type { DiagramSpec } from './types';

export const devconnectFeatNotificationsSpec: DiagramSpec = {
  id: 'devconnect-feat-notifications',
  project: 'devconnect',
  title: 'Notifications slice',
  nodes: [
    { id: 'bell', label: 'Notify bell', layer: 'browser' },
    { id: 'service', label: 'Notify service', layer: 'browser' },
    { id: 'route', label: 'Notify routes', layer: 'api' },
    { id: 'controller', label: 'Notify control', layer: 'api' },
    { id: 'model', label: 'Notify model', layer: 'api' },
    { id: 'socket', label: 'Socket server', layer: 'realtime', external: true },
  ],
  edges: [
    { from: 'bell', to: 'service', kind: 'solid', label: 'fetches' },
    { from: 'service', to: 'route', kind: 'solid', label: 'GET' },
    { from: 'route', to: 'controller', kind: 'solid' },
    { from: 'controller', to: 'model', kind: 'solid', label: 'reads' },
    { from: 'socket', to: 'bell', kind: 'dashed', label: 'pushes' },
  ],
  sources: [
    'frontend/src/components/notifications/NotificationBell.jsx',
    'frontend/src/services/notificationService.js',
    'backend/routes/notificationRoutes.js',
    'backend/controllers/notificationController.js',
    'backend/models/Notification.js',
  ],
};
