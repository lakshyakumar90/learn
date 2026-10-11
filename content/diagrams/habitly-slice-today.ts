import type { DiagramSpec } from './types';

export const habitlySliceTodaySpec: DiagramSpec = {
  id: 'habitly-slice-today',
  project: 'habitly',
  title: 'Today slice',
  nodes: [
    { id: 'today', label: 'Today tab', layer: 'screens' },
    { id: 'state', label: 'App state', layer: 'features' },
    { id: 'domain', label: 'Domain logic', layer: 'features' },
    { id: 'repos', label: 'Repositories', layer: 'localdata' },
    { id: 'sqlite', label: 'SQLite', layer: 'localdata' },
  ],
  edges: [
    { from: 'today', to: 'state', kind: 'solid', label: 'reads' },
    { from: 'state', to: 'repos', kind: 'solid', label: 'loads' },
    { from: 'repos', to: 'sqlite', kind: 'solid', label: 'reads' },
    { from: 'today', to: 'domain', kind: 'solid', label: 'progress' },
  ],
  sources: [
    'src/app/(tabs)/today.tsx',
    'src/features/app/AppProvider.tsx',
    'src/features/habits/domain.ts',
  ],
};
