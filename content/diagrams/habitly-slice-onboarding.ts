import type { DiagramSpec } from './types';

export const habitlySliceOnboardingSpec: DiagramSpec = {
  id: 'habitly-slice-onboarding',
  project: 'habitly',
  title: 'Onboarding slice',
  nodes: [
    { id: 'welcome', label: 'Welcome', layer: 'screens' },
    { id: 'flow', label: 'Flow steps', layer: 'features' },
    { id: 'guest', label: 'Guest profile', layer: 'features' },
    { id: 'prefs', label: 'Preferences', layer: 'localdata' },
    { id: 'seeds', label: 'Sample data', layer: 'localdata' },
  ],
  edges: [
    { from: 'welcome', to: 'flow', kind: 'solid', label: 'starts' },
    { from: 'flow', to: 'guest', kind: 'solid', label: 'creates' },
    { from: 'guest', to: 'prefs', kind: 'solid', label: 'saves' },
    { from: 'prefs', to: 'seeds', kind: 'solid', label: 'seeds' },
  ],
  sources: [
    'src/app/welcome.tsx',
    'src/features/onboarding/OnboardingFlow.tsx',
    'src/database/client.ts',
  ],
};
