import type { DiagramSpec } from './types';

export const habitlyFeaturesNavigationSpec: DiagramSpec = {
  id: 'habitly-features-navigation',
  project: 'habitly',
  title: 'Navigation helpers',
  nodes: [
    { id: 'pager', label: 'Pager math', layer: 'features' },
    { id: 'return', label: 'Return to tab', layer: 'features' },
    { id: 'tabs', label: 'Tab pager', layer: 'screens', external: true },
    { id: 'stacks', label: 'Stack screens', layer: 'screens', external: true },
  ],
  edges: [
    { from: 'tabs', to: 'pager', kind: 'solid', label: 'indexes' },
    { from: 'stacks', to: 'return', kind: 'solid', label: 'exits' },
  ],
  sources: [
    'src/features/navigation/pager.ts',
    'src/features/navigation/returnToTab.ts',
  ],
};
