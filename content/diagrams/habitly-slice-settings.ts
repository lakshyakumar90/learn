import type { DiagramSpec } from './types';

export const habitlySliceSettingsSpec: DiagramSpec = {
  id: 'habitly-slice-settings',
  project: 'habitly',
  title: 'Settings slice',
  nodes: [
    { id: 'settings', label: 'Settings', layer: 'screens' },
    { id: 'prefs', label: 'Preferences', layer: 'localdata' },
    { id: 'export', label: 'Export JSON', layer: 'device' },
    { id: 'share', label: 'Share sheet', layer: 'device' },
  ],
  edges: [
    { from: 'settings', to: 'prefs', kind: 'solid', label: 'saves' },
    { from: 'settings', to: 'export', kind: 'solid', label: 'builds' },
    { from: 'export', to: 'share', kind: 'solid', label: 'shares' },
  ],
  sources: [
    'src/app/settings.tsx',
    'src/database/repositories.ts',
  ],
};
