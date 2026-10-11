import type { DiagramSpec } from './types';

/**
 * Who depends on whom (apps side).
 * Edges come from each app's package.json plus the @repo/* imports
 * found in apps/web/src. See the apps/ overview page for the full lists.
 */
export const appsOverviewSpec: DiagramSpec = {
  id: 'apps-overview',
  title: 'apps/ dependencies',
  nodes: [
    { id: 'web', label: 'Web', layer: 'browser' },
    { id: 'http', label: 'HTTP server', layer: 'api' },
    { id: 'ws', label: 'WS server', layer: 'realtime' },
    { id: 'worker', label: 'Flush worker', layer: 'api' },
    { id: 'engine', label: 'Engine', layer: 'shared', external: true },
    { id: 'common', label: 'Common', layer: 'shared', external: true },
    { id: 'backend', label: 'Backend-common', layer: 'shared', external: true },
    { id: 'auth', label: 'Auth', layer: 'shared', external: true },
    { id: 'db', label: 'Database', layer: 'database', external: true },
    { id: 'redis', label: 'Redis', layer: 'cache', external: true },
    { id: 'validations', label: 'Validations', layer: 'shared', external: true },
  ],
  edges: [
    { from: 'web', to: 'engine', kind: 'solid', label: 'uses' },
    { from: 'web', to: 'common', kind: 'solid', label: 'uses' },
    { from: 'web', to: 'auth', kind: 'solid', label: 'uses' },
    { from: 'http', to: 'backend', kind: 'solid', label: 'uses' },
    { from: 'http', to: 'db', kind: 'solid', label: 'uses' },
    { from: 'http', to: 'validations', kind: 'solid', label: 'uses' },
    { from: 'ws', to: 'backend', kind: 'solid', label: 'uses' },
    { from: 'ws', to: 'redis', kind: 'solid', label: 'uses' },
    { from: 'ws', to: 'common', kind: 'solid', label: 'uses' },
    { from: 'worker', to: 'db', kind: 'solid', label: 'uses' },
    { from: 'worker', to: 'redis', kind: 'solid', label: 'uses' },
  ],
  sources: [
    'apps/README.md',
    'apps/web/package.json',
    'apps/http-server/package.json',
    'apps/ws-server/package.json',
    'apps/flush-worker/package.json',
  ],
};
