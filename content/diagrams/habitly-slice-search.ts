import type { DiagramSpec } from './types';

export const habitlySliceSearchSpec: DiagramSpec = {
  id: 'habitly-slice-search',
  project: 'habitly',
  title: 'Search slice',
  nodes: [
    { id: 'search', label: 'Search screen', layer: 'screens' },
    { id: 'state', label: 'App state', layer: 'features' },
    { id: 'repos', label: 'Repositories', layer: 'localdata' },
    { id: 'sqlite', label: 'SQLite', layer: 'localdata' },
  ],
  edges: [
    { from: 'search', to: 'state', kind: 'solid', label: 'filters' },
    { from: 'state', to: 'repos', kind: 'solid', label: 'loads' },
    { from: 'repos', to: 'sqlite', kind: 'solid', label: 'reads' },
  ],
  sources: [
    'src/app/search.tsx',
    'src/features/app/AppProvider.tsx',
  ],
};
