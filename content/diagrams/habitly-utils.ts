import type { DiagramSpec } from './types';

export const habitlyUtilsSpec: DiagramSpec = {
  id: 'habitly-utils',
  project: 'habitly',
  title: 'Utilities',
  nodes: [
    { id: 'dates', label: 'Date keys', layer: 'features' },
    { id: 'routes', label: 'Route table', layer: 'features' },
    { id: 'repos', label: 'Repositories', layer: 'localdata', external: true },
    { id: 'router', label: 'Expo Router', layer: 'screens', external: true },
  ],
  edges: [
    { from: 'repos', to: 'dates', kind: 'solid', label: 'keys by' },
    { from: 'router', to: 'routes', kind: 'solid', label: 'checks' },
  ],
  sources: [
    'src/utils/dates.ts',
    'src/utils/routes.ts',
  ],
};
