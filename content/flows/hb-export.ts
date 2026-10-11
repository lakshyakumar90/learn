import type { FlowSpec } from './types';

export const hbExportFlow: FlowSpec = {
  id: 'hb-export',
  project: 'habitly',
  title: 'Export',
  diagram: 'habitly-system',
  steps: [
    {
      title: 'Collect',
      narration: 'Settings reads habits, entries, tasks, and preferences through repositories.',
      nodes: ['details', 'feature-ui', 'app-state', 'repos', 'sqlite'],
      edges: [
        { from: 'details', to: 'feature-ui', kind: 'solid' },
        { from: 'feature-ui', to: 'app-state', kind: 'solid' },
        { from: 'app-state', to: 'repos', kind: 'solid' },
        { from: 'repos', to: 'sqlite', kind: 'solid' },
      ],
      path: ['details', 'feature-ui', 'app-state', 'repos', 'sqlite'],
      sources: ['src/app/settings.tsx', 'src/database/repositories.ts'],
    },
    {
      title: 'Share or copy',
      narration: 'The JSON file goes to the OS share sheet, or its text goes to the clipboard.',
      nodes: ['feature-ui'],
      edges: [],
      path: ['feature-ui'],
      sources: ['src/app/settings.tsx'],
    },
  ],
  sources: [
    'src/app/settings.tsx',
    'src/database/repositories.ts',
  ],
};
