import type { DiagramSpec } from './types';

export const commonSpec: DiagramSpec = {
  id: 'common',
  title: 'common package',
  nodes: [
    { id: 'elements', label: 'Element models', layer: 'shared' },
    { id: 'sync', label: 'Sync reconcile', layer: 'shared' },
    { id: 'validation', label: 'Validation', layer: 'shared' },
    { id: 'collab', label: 'Collab protocol', layer: 'shared' },
    { id: 'presence', label: 'Presence types', layer: 'shared' },
    { id: 'laser', label: 'Laser', layer: 'shared' },
  ],
  edges: [
    { from: 'elements', to: 'sync', kind: 'solid', label: 'normalize' },
    { from: 'validation', to: 'sync', kind: 'solid', label: 'checks' },
    { from: 'sync', to: 'collab', kind: 'solid', label: 'commits' },
    { from: 'presence', to: 'collab', kind: 'dashed', label: 'live' },
    { from: 'laser', to: 'collab', kind: 'dashed', label: 'trails' },
  ],
  sources: [
    'packages/common/README.md',
    'packages/common/src/README.md',
    'packages/common/src/sync.ts',
    'packages/common/src/syncValidate.ts',
    'packages/common/src/collab.ts',
    'packages/common/src/presence.ts',
    'packages/common/src/laser.ts',
  ],
};
