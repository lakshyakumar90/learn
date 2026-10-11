import type { DiagramSpec } from './types';

export const devconnectFrontendAssetsSpec: DiagramSpec = {
  id: 'devconnect-frontend-assets',
  project: 'devconnect',
  title: 'Frontend static assets',
  nodes: [
    { id: 'public', label: 'Public folder', layer: 'browser' },
    { id: 'icons', label: 'Favicons', layer: 'browser' },
    { id: 'social', label: 'Social image', layer: 'browser' },
    { id: 'app', label: 'HTML shell', layer: 'browser', external: true },
  ],
  edges: [
    { from: 'app', to: 'icons', kind: 'solid', label: 'links' },
    { from: 'app', to: 'social', kind: 'dashed', label: 'shares' },
    { from: 'public', to: 'icons', kind: 'solid' },
    { from: 'public', to: 'social', kind: 'solid' },
  ],
  sources: ['frontend/index.html'],
};
