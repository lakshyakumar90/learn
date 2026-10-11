import type { DiagramSpec } from './types';

export const habitlySliceCloudSpec: DiagramSpec = {
  id: 'habitly-slice-cloud',
  project: 'habitly',
  title: 'Cloud sync slice',
  nodes: [
    { id: 'settings', label: 'Backup panel', layer: 'screens' },
    { id: 'account', label: 'Account provider', layer: 'features' },
    { id: 'outbox', label: 'Outbox', layer: 'localdata' },
    { id: 'netinfo', label: 'NetInfo gate', layer: 'device' },
    { id: 'firestore', label: 'Firestore', layer: 'cloud' },
  ],
  edges: [
    { from: 'settings', to: 'account', kind: 'solid', label: 'signs in' },
    { from: 'account', to: 'outbox', kind: 'solid', label: 'queues' },
    { from: 'account', to: 'netinfo', kind: 'solid', label: 'waits for' },
    { from: 'outbox', to: 'firestore', kind: 'dashed', label: 'syncs' },
    { from: 'firestore', to: 'account', kind: 'dashed', label: 'restores' },
  ],
  sources: [
    'src/app/settings.tsx',
    'src/features/account/CloudAccountProvider.tsx',
    'src/services/cloudSync.ts',
  ],
};
