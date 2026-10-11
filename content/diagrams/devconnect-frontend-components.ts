import type { DiagramSpec } from './types';

export const devconnectFrontendComponentsSpec: DiagramSpec = {
  id: 'devconnect-frontend-components',
  project: 'devconnect',
  title: 'Frontend components folder',
  nodes: [
    { id: 'ui', label: 'UI primitives', layer: 'browser' },
    { id: 'layout', label: 'App layout', layer: 'browser' },
    { id: 'posts', label: 'Post widgets', layer: 'browser' },
    { id: 'jobs', label: 'Job widgets', layer: 'browser' },
    { id: 'notify', label: 'Notify bell', layer: 'browser' },
    { id: 'pages', label: 'Pages', layer: 'browser', external: true },
    { id: 'radix', label: 'Radix UI', layer: 'browser', external: true },
  ],
  edges: [
    { from: 'pages', to: 'layout', kind: 'solid', label: 'frames' },
    { from: 'pages', to: 'posts', kind: 'solid' },
    { from: 'pages', to: 'jobs', kind: 'solid' },
    { from: 'layout', to: 'notify', kind: 'dashed', label: 'badge' },
    { from: 'ui', to: 'radix', kind: 'solid', label: 'wraps' },
    { from: 'posts', to: 'ui', kind: 'solid', label: 'uses' },
    { from: 'jobs', to: 'ui', kind: 'solid', label: 'uses' },
  ],
  sources: [
    'frontend/src/components/layout/MainLayout.jsx',
    'frontend/src/components/posts/PostCard.jsx',
    'frontend/src/components/jobs/JobCard.jsx',
    'frontend/src/components/notifications/NotificationBell.jsx',
    'frontend/src/components/ui/button.jsx',
  ],
};
