import type { DiagramSpec } from './types';

export const habitlyTestsSpec: DiagramSpec = {
  id: 'habitly-tests',
  project: 'habitly',
  title: 'Tests',
  nodes: [
    { id: 'habits', label: 'Habit tests', layer: 'features' },
    { id: 'pager', label: 'Pager tests', layer: 'features' },
    { id: 'domain', label: 'Domain logic', layer: 'features', external: true },
    { id: 'nav', label: 'Pager math', layer: 'features', external: true },
  ],
  edges: [
    { from: 'habits', to: 'domain', kind: 'solid', label: 'covers' },
    { from: 'pager', to: 'nav', kind: 'solid', label: 'covers' },
  ],
  sources: [
    'tests/habits.test.ts',
    'tests/pager.test.ts',
  ],
};
