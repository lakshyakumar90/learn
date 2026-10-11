import type { DiagramSpec } from './types';

export const habitlyFeaturesAccountSpec: DiagramSpec = {
  id: 'habitly-features-account',
  project: 'habitly',
  title: 'Account feature',
  nodes: [
    { id: 'provider', label: 'Account provider', layer: 'features' },
    { id: 'bridge', label: 'Sync bridge', layer: 'features' },
    { id: 'signin', label: 'Google sign-in', layer: 'features' },
    { id: 'sync', label: 'Cloud sync', layer: 'cloud', external: true },
    { id: 'sqlite', label: 'SQLite', layer: 'localdata', external: true },
  ],
  edges: [
    { from: 'provider', to: 'signin', kind: 'dashed', label: 'authenticates' },
    { from: 'provider', to: 'sqlite', kind: 'solid', label: 'switches file' },
    { from: 'bridge', to: 'sync', kind: 'dashed', label: 'starts' },
  ],
  sources: [
    'src/features/account/CloudAccountProvider.tsx',
  ],
};
