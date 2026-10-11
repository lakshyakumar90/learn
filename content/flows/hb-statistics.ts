import type { FlowSpec } from './types';

export const hbStatisticsFlow: FlowSpec = {
  id: 'hb-statistics',
  project: 'habitly',
  title: 'Statistics',
  diagram: 'habitly-system',
  steps: [
    {
      title: 'Open stats',
      narration: 'The Stats tab loads habits and entries into app state.',
      nodes: ['tabs', 'feature-ui', 'app-state'],
      edges: [
        { from: 'tabs', to: 'feature-ui', kind: 'solid' },
        { from: 'feature-ui', to: 'app-state', kind: 'solid' },
      ],
      path: ['tabs', 'feature-ui', 'app-state'],
      sources: ['src/app/(tabs)/stats.tsx', 'src/features/statistics/StatisticsUI.tsx'],
    },
    {
      title: 'Calculate',
      narration: 'Pure functions derive consistency, streaks, and best weekday.',
      nodes: ['feature-ui', 'domain'],
      edges: [{ from: 'feature-ui', to: 'domain', kind: 'solid' }],
      path: ['feature-ui', 'domain'],
      sources: ['src/features/statistics/calculations.ts', 'src/features/statistics/analytics.ts'],
    },
    {
      title: 'History',
      narration: 'Drilling into a habit shows its own summary and month history.',
      nodes: ['details', 'feature-ui', 'domain'],
      edges: [
        { from: 'details', to: 'feature-ui', kind: 'solid' },
        { from: 'feature-ui', to: 'domain', kind: 'solid' },
      ],
      path: ['details', 'feature-ui', 'domain'],
      sources: ['src/app/statistics/[id].tsx', 'src/app/statistics/history/[id].tsx'],
    },
  ],
  sources: [
    'src/features/statistics/calculations.ts',
    'src/features/statistics/analytics.ts',
    'src/features/statistics/StatisticsUI.tsx',
  ],
};
