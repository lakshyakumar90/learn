import type { DiagramSpec } from './types';

export const habitlySliceHabitsSpec: DiagramSpec = {
  id: 'habitly-slice-habits',
  project: 'habitly',
  title: 'Habits slice',
  nodes: [
    { id: 'list', label: 'Habit list', layer: 'screens' },
    { id: 'form', label: 'Habit form', layer: 'features' },
    { id: 'domain', label: 'Domain logic', layer: 'features' },
    { id: 'repos', label: 'Repositories', layer: 'localdata' },
    { id: 'sqlite', label: 'SQLite', layer: 'localdata' },
  ],
  edges: [
    { from: 'list', to: 'form', kind: 'solid', label: 'creates' },
    { from: 'form', to: 'repos', kind: 'solid', label: 'saves' },
    { from: 'repos', to: 'sqlite', kind: 'solid', label: 'writes' },
    { from: 'list', to: 'domain', kind: 'solid', label: 'checks off' },
    { from: 'domain', to: 'repos', kind: 'solid', label: 'stores' },
  ],
  sources: [
    'src/app/(tabs)/habits.tsx',
    'src/features/habits/HabitForm.tsx',
    'src/features/habits/HabitRow.tsx',
    'src/features/habits/domain.ts',
    'src/database/repositories.ts',
  ],
};
