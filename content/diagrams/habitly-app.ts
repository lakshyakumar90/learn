import type { DiagramSpec } from './types';

export const habitlyAppSpec: DiagramSpec = {
  id: 'habitly-app',
  project: 'habitly',
  title: 'Routes by purpose',
  nodes: [
    { id: 'index', label: 'Launch gate', layer: 'screens' },
    { id: 'welcome', label: 'Welcome', layer: 'screens' },
    { id: 'onboarding', label: 'Onboarding', layer: 'screens' },
    { id: 'tabs', label: 'Tab pager', layer: 'screens' },
    { id: 'stacks', label: 'Stack screens', layer: 'screens' },
    { id: 'providers', label: 'Providers', layer: 'features', external: true },
  ],
  edges: [
    { from: 'index', to: 'welcome', kind: 'solid', label: 'first run' },
    { from: 'index', to: 'tabs', kind: 'solid', label: 'returning' },
    { from: 'welcome', to: 'onboarding', kind: 'solid', label: 'starts' },
    { from: 'onboarding', to: 'tabs', kind: 'solid', label: 'finishes' },
    { from: 'tabs', to: 'stacks', kind: 'solid', label: 'opens' },
    { from: 'providers', to: 'index', kind: 'solid', label: 'wraps' },
  ],
  sources: [
    'src/app/index.tsx',
    'src/app/_layout.tsx',
    'src/app/welcome.tsx',
    'src/app/onboarding.tsx',
    'src/app/(tabs)/_layout.tsx',
  ],
};
