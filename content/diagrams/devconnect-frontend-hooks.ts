import type { DiagramSpec } from './types';

export const devconnectFrontendHooksSpec: DiagramSpec = {
  id: 'devconnect-frontend-hooks',
  project: 'devconnect',
  title: 'Frontend hooks folder',
  nodes: [
    { id: 'swipe', label: 'Swipe gesture', layer: 'browser' },
    { id: 'chat', label: 'Chat page', layer: 'browser', external: true },
  ],
  edges: [{ from: 'chat', to: 'swipe', kind: 'solid', label: 'uses' }],
  sources: ['frontend/src/hooks/useSwipeGesture.js', 'frontend/src/pages/ChatPage.jsx'],
};
