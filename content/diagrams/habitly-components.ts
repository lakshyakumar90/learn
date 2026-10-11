import type { DiagramSpec } from './types';

export const habitlyComponentsSpec: DiagramSpec = {
  id: 'habitly-components',
  project: 'habitly',
  title: 'Shared components',
  nodes: [
    { id: 'primitives', label: 'Primitives', layer: 'features' },
    { id: 'sheets', label: 'Action sheets', layer: 'features' },
    { id: 'dialogs', label: 'Date dialogs', layer: 'features' },
    { id: 'switch', label: 'Switches', layer: 'features' },
    { id: 'blobs', label: 'Background art', layer: 'features' },
    { id: 'screens', label: 'Screens', layer: 'screens', external: true },
  ],
  edges: [
    { from: 'screens', to: 'primitives', kind: 'solid', label: 'uses' },
    { from: 'screens', to: 'sheets', kind: 'solid', label: 'uses' },
    { from: 'screens', to: 'dialogs', kind: 'solid', label: 'uses' },
    { from: 'screens', to: 'switch', kind: 'solid', label: 'uses' },
    { from: 'screens', to: 'blobs', kind: 'solid', label: 'decorates' },
  ],
  sources: [
    'src/components/ui/Primitives.tsx',
    'src/components/ui/ActionSheet.tsx',
    'src/components/ui/DateTimeDialogs.tsx',
    'src/components/ui/SmoothSwitch.tsx',
    'src/components/decorative/BackgroundBlobs.tsx',
  ],
};
