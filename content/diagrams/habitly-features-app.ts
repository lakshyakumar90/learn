import type { DiagramSpec } from './types';

export const habitlyFeaturesAppSpec: DiagramSpec = {
  id: 'habitly-features-app',
  project: 'habitly',
  title: 'App state feature',
  nodes: [
    { id: 'provider', label: 'App provider', layer: 'features' },
    { id: 'habits', label: 'Habit state', layer: 'features' },
    { id: 'tasks', label: 'Task state', layer: 'features' },
    { id: 'theme', label: 'Theme state', layer: 'features' },
    { id: 'repos', label: 'Repositories', layer: 'localdata', external: true },
    { id: 'screens', label: 'Screens', layer: 'screens', external: true },
  ],
  edges: [
    { from: 'screens', to: 'provider', kind: 'solid', label: 'reads' },
    { from: 'provider', to: 'habits', kind: 'solid', label: 'holds' },
    { from: 'provider', to: 'tasks', kind: 'solid', label: 'holds' },
    { from: 'provider', to: 'theme', kind: 'solid', label: 'holds' },
    { from: 'provider', to: 'repos', kind: 'solid', label: 'persists' },
  ],
  sources: [
    'src/features/app/AppProvider.tsx',
  ],
};
