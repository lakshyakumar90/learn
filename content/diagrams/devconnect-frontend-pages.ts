import type { DiagramSpec } from './types';

export const devconnectFrontendPagesSpec: DiagramSpec = {
  id: 'devconnect-frontend-pages',
  project: 'devconnect',
  title: 'Frontend pages folder',
  nodes: [
    { id: 'router', label: 'Router', layer: 'browser', external: true },
    { id: 'landing', label: 'Landing page', layer: 'browser' },
    { id: 'auth', label: 'Auth pages', layer: 'browser' },
    { id: 'feed', label: 'Feed page', layer: 'browser' },
    { id: 'chat', label: 'Chat page', layer: 'browser' },
    { id: 'jobs', label: 'Job pages', layer: 'browser' },
    { id: 'profiles', label: 'Profile pages', layer: 'browser' },
    { id: 'guard', label: 'Route guard', layer: 'browser', external: true },
    { id: 'layout', label: 'Main layout', layer: 'browser', external: true },
  ],
  edges: [
    { from: 'router', to: 'landing', kind: 'solid', label: 'public' },
    { from: 'router', to: 'auth', kind: 'solid', label: 'public' },
    { from: 'router', to: 'guard', kind: 'solid', label: 'protected' },
    { from: 'guard', to: 'layout', kind: 'solid' },
    { from: 'layout', to: 'feed', kind: 'solid' },
    { from: 'layout', to: 'chat', kind: 'solid' },
    { from: 'layout', to: 'jobs', kind: 'solid' },
    { from: 'layout', to: 'profiles', kind: 'solid' },
  ],
  sources: [
    'frontend/src/App.jsx',
    'frontend/src/pages/LandingPage.jsx',
    'frontend/src/pages/LoginPage.jsx',
    'frontend/src/pages/SignupPage.jsx',
    'frontend/src/pages/FeedPage.jsx',
    'frontend/src/pages/ChatPage.jsx',
    'frontend/src/pages/JobsPage.jsx',
    'frontend/src/pages/ProfilePage.jsx',
  ],
};
