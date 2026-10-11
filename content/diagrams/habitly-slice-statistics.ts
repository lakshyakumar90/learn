import type { DiagramSpec } from './types';

export const habitlySliceStatisticsSpec: DiagramSpec = {
  id: 'habitly-slice-statistics',
  project: 'habitly',
  title: 'Statistics slice',
  nodes: [
    { id: 'stats', label: 'Stats tab', layer: 'screens' },
    { id: 'ui', label: 'Stats UI', layer: 'features' },
    { id: 'calc', label: 'Calculations', layer: 'features' },
    { id: 'entries', label: 'Local entries', layer: 'localdata' },
  ],
  edges: [
    { from: 'stats', to: 'ui', kind: 'solid', label: 'shows' },
    { from: 'ui', to: 'calc', kind: 'solid', label: 'asks' },
    { from: 'calc', to: 'entries', kind: 'solid', label: 'reads' },
  ],
  sources: [
    'src/app/(tabs)/stats.tsx',
    'src/features/statistics/StatisticsUI.tsx',
    'src/features/statistics/calculations.ts',
  ],
};
