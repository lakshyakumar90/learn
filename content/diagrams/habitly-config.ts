import type { DiagramSpec } from './types';

export const habitlyConfigSpec: DiagramSpec = {
  id: 'habitly-config',
  project: 'habitly',
  title: 'Config and tooling',
  nodes: [
    { id: 'appjson', label: 'App manifest', layer: 'screens' },
    { id: 'appconfig', label: 'Dynamic config', layer: 'screens' },
    { id: 'eas', label: 'Build profiles', layer: 'cloud' },
    { id: 'styles', label: 'Style pipeline', layer: 'features' },
    { id: 'lint', label: 'Lint and types', layer: 'features' },
    { id: 'rules', label: 'Sync rules', layer: 'cloud' },
  ],
  edges: [
    { from: 'appconfig', to: 'appjson', kind: 'solid', label: 'extends' },
    { from: 'eas', to: 'appconfig', kind: 'dashed', label: 'builds' },
    { from: 'rules', to: 'eas', kind: 'dashed', label: 'deploys' },
  ],
  sources: [
    'app.json',
    'app.config.js',
    'eas.json',
    'firebase.json',
    'firestore.rules',
  ],
};
