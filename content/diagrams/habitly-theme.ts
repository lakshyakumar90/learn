import type { DiagramSpec } from './types';

export const habitlyThemeSpec: DiagramSpec = {
  id: 'habitly-theme',
  project: 'habitly',
  title: 'Theme tokens',
  nodes: [
    { id: 'tokens', label: 'Token table', layer: 'features' },
    { id: 'screens', label: 'Screens', layer: 'screens', external: true },
    { id: 'prefs', label: 'Preferences', layer: 'localdata', external: true },
  ],
  edges: [
    { from: 'screens', to: 'tokens', kind: 'solid', label: 'reads' },
    { from: 'prefs', to: 'tokens', kind: 'solid', label: 'selects' },
  ],
  sources: [
    'src/theme/tokens.ts',
  ],
};
