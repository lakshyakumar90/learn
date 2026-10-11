import type { DiagramSpec } from './types';

export const devconnectFrontendLibSpec: DiagramSpec = {
  id: 'devconnect-frontend-lib',
  project: 'devconnect',
  title: 'Frontend lib folder',
  nodes: [
    { id: 'cn', label: 'Class merge', layer: 'browser' },
    { id: 'ui', label: 'UI primitives', layer: 'browser', external: true },
  ],
  edges: [{ from: 'ui', to: 'cn', kind: 'solid', label: 'uses' }],
  sources: ['frontend/src/lib/utils.js', 'frontend/src/components/ui/button.jsx'],
};
