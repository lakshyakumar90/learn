import type { DiagramSpec } from './types';

export const habitlySliceTasksSpec: DiagramSpec = {
  id: 'habitly-slice-tasks',
  project: 'habitly',
  title: 'Tasks slice',
  nodes: [
    { id: 'list', label: 'Task list', layer: 'screens' },
    { id: 'form', label: 'Task form', layer: 'features' },
    { id: 'repos', label: 'Repositories', layer: 'localdata' },
    { id: 'sqlite', label: 'SQLite', layer: 'localdata' },
  ],
  edges: [
    { from: 'list', to: 'form', kind: 'solid', label: 'creates' },
    { from: 'form', to: 'repos', kind: 'solid', label: 'saves' },
    { from: 'repos', to: 'sqlite', kind: 'solid', label: 'writes' },
  ],
  sources: [
    'src/app/(tabs)/tasks.tsx',
    'src/features/tasks/TaskForm.tsx',
    'src/database/repositories.ts',
  ],
};
