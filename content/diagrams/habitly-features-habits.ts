import type { DiagramSpec } from './types';

export const habitlyFeaturesHabitsSpec: DiagramSpec = {
  id: 'habitly-features-habits',
  project: 'habitly',
  title: 'Habits feature',
  nodes: [
    { id: 'row', label: 'Habit row', layer: 'features' },
    { id: 'form', label: 'Habit form', layer: 'features' },
    { id: 'celebration', label: 'Celebration', layer: 'features' },
    { id: 'domain', label: 'Domain logic', layer: 'features' },
    { id: 'types', label: 'Habit types', layer: 'features' },
    { id: 'repos', label: 'Repositories', layer: 'localdata', external: true },
  ],
  edges: [
    { from: 'row', to: 'domain', kind: 'solid', label: 'toggles' },
    { from: 'form', to: 'types', kind: 'solid', label: 'edits' },
    { from: 'row', to: 'celebration', kind: 'solid', label: 'triggers' },
    { from: 'domain', to: 'repos', kind: 'solid', label: 'saves' },
  ],
  sources: [
    'src/features/habits/HabitRow.tsx',
    'src/features/habits/HabitForm.tsx',
    'src/features/habits/CelebrationModal.tsx',
    'src/features/habits/domain.ts',
    'src/features/habits/types.ts',
  ],
};
