import type { DiagramSpec } from './types';

export const habitlyFeaturesTasksSpec: DiagramSpec = {
  id: 'habitly-features-tasks',
  project: 'habitly',
  title: 'Tasks feature',
  nodes: [
    { id: 'form', label: 'Task form', layer: 'features' },
    { id: 'types', label: 'Task types', layer: 'features' },
    { id: 'repos', label: 'Repositories', layer: 'localdata', external: true },
    { id: 'screens', label: 'Task screens', layer: 'screens', external: true },
  ],
  edges: [
    { from: 'screens', to: 'form', kind: 'solid', label: 'edits' },
    { from: 'form', to: 'types', kind: 'solid', label: 'shapes' },
    { from: 'form', to: 'repos', kind: 'solid', label: 'saves' },
  ],
  sources: [
    'src/features/tasks/TaskForm.tsx',
    'src/features/tasks/types.ts',
  ],
};
