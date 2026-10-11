import type { DiagramSpec } from './types';

export const habitlyFeaturesStatisticsSpec: DiagramSpec = {
  id: 'habitly-features-statistics',
  project: 'habitly',
  title: 'Statistics feature',
  nodes: [
    { id: 'ui', label: 'Stats UI', layer: 'features' },
    { id: 'calc', label: 'Calculations', layer: 'features' },
    { id: 'analytics', label: 'Summaries', layer: 'features' },
    { id: 'entries', label: 'Local entries', layer: 'localdata', external: true },
  ],
  edges: [
    { from: 'ui', to: 'calc', kind: 'solid', label: 'asks' },
    { from: 'ui', to: 'analytics', kind: 'solid', label: 'asks' },
    { from: 'calc', to: 'entries', kind: 'solid', label: 'reads' },
    { from: 'analytics', to: 'entries', kind: 'solid', label: 'reads' },
  ],
  sources: [
    'src/features/statistics/StatisticsUI.tsx',
    'src/features/statistics/calculations.ts',
    'src/features/statistics/analytics.ts',
  ],
};
