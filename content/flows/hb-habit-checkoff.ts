import type { FlowSpec } from './types';

export const hbHabitCheckoffFlow: FlowSpec = {
  id: 'hb-habit-checkoff',
  project: 'habitly',
  title: 'Check off',
  diagram: 'habitly-system',
  steps: [
    {
      title: 'Create habit',
      narration: 'The habit form captures type, target, and schedule, then saves the draft.',
      nodes: ['tabs', 'feature-ui'],
      edges: [{ from: 'tabs', to: 'feature-ui', kind: 'solid' }],
      path: ['tabs', 'feature-ui'],
      sources: ['src/app/(tabs)/habits.tsx', 'src/features/habits/HabitForm.tsx'],
    },
    {
      title: 'Save',
      narration: 'App state persists the habit through the repository into SQLite.',
      nodes: ['feature-ui', 'app-state', 'repos', 'sqlite'],
      edges: [
        { from: 'feature-ui', to: 'app-state', kind: 'solid' },
        { from: 'app-state', to: 'repos', kind: 'solid' },
        { from: 'repos', to: 'sqlite', kind: 'solid' },
      ],
      path: ['feature-ui', 'app-state', 'repos', 'sqlite'],
      sources: ['src/features/app/AppProvider.tsx', 'src/database/repositories.ts'],
    },
    {
      title: 'Check off',
      narration: 'Tapping the row toggles today entry; domain logic decides completion.',
      nodes: ['tabs', 'feature-ui', 'domain'],
      edges: [
        { from: 'tabs', to: 'feature-ui', kind: 'solid' },
        { from: 'feature-ui', to: 'domain', kind: 'solid' },
      ],
      path: ['tabs', 'feature-ui', 'domain'],
      sources: ['src/features/habits/HabitRow.tsx', 'src/features/habits/domain.ts'],
    },
    {
      title: 'Progress',
      narration: 'The Today tab recomputes progress and streaks from stored entries.',
      nodes: ['feature-ui', 'app-state', 'repos', 'sqlite'],
      edges: [
        { from: 'feature-ui', to: 'app-state', kind: 'solid' },
        { from: 'app-state', to: 'repos', kind: 'solid' },
        { from: 'repos', to: 'sqlite', kind: 'solid' },
      ],
      path: ['feature-ui', 'app-state', 'repos', 'sqlite'],
      sources: ['src/app/(tabs)/today.tsx', 'src/features/habits/domain.ts'],
    },
  ],
  sources: [
    'src/features/habits/HabitForm.tsx',
    'src/features/habits/HabitRow.tsx',
    'src/database/repositories.ts',
  ],
};
