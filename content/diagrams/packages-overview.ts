import type { DiagramSpec } from './types';

/**
 * Who depends on whom (packages side).
 * Edges come from each package's package.json. UI, validations,
 * and the tooling configs stand alone with no @repo/* dependencies.
 */
export const packagesOverviewSpec: DiagramSpec = {
  id: 'packages-overview',
  title: 'packages/ dependencies',
  nodes: [
    { id: 'common', label: 'Common', layer: 'shared' },
    { id: 'engine', label: 'Engine', layer: 'shared' },
    { id: 'backend', label: 'Backend-common', layer: 'shared' },
    { id: 'auth', label: 'Auth', layer: 'shared' },
    { id: 'db', label: 'Database', layer: 'database' },
    { id: 'redis', label: 'Redis', layer: 'cache' },
    { id: 'validations', label: 'Validations', layer: 'shared' },
    { id: 'ui', label: 'UI', layer: 'shared' },
    { id: 'tooling', label: 'Tooling configs', layer: 'shared' },
  ],
  edges: [
    { from: 'engine', to: 'common', kind: 'solid', label: 'uses' },
    { from: 'backend', to: 'common', kind: 'solid', label: 'uses' },
    { from: 'backend', to: 'db', kind: 'solid', label: 'uses' },
    { from: 'backend', to: 'redis', kind: 'solid', label: 'uses' },
    { from: 'auth', to: 'db', kind: 'solid', label: 'uses' },
  ],
  sources: [
    'packages/common/package.json',
    'packages/engine/package.json',
    'packages/backend-common/package.json',
    'packages/auth/package.json',
    'packages/db/package.json',
    'packages/redis/package.json',
    'packages/validations/package.json',
    'packages/ui/package.json',
    'packages/typescript-config/package.json',
  ],
};
