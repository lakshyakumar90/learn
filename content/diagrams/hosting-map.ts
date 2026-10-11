import type { DiagramSpec } from './types';

/**
 * Where each part of the system is hosted on the free-tier setup:
 * web on Vercel, HTTP/WS/worker on Render, Postgres on Neon, Redis on Upstash.
 */
export const hostingMapSpec: DiagramSpec = {
  id: 'hosting-map',
  title: 'Hosting map',
  nodes: [
    { id: 'browser', label: 'Browser', layer: 'browser' },
    { id: 'vercel', label: 'Vercel', layer: 'browser', external: true },
    { id: 'http', label: 'HTTP (sleeps)', layer: 'api', external: true },
    { id: 'ws', label: 'WS (sleeps)', layer: 'realtime', external: true },
    { id: 'worker', label: 'Paid worker', layer: 'api', external: true },
    { id: 'neon', label: 'Neon Postgres', layer: 'database', external: true },
    { id: 'upstash', label: 'Upstash Redis', layer: 'cache', external: true },
  ],
  edges: [
    { from: 'browser', to: 'vercel', kind: 'solid', label: 'app' },
    { from: 'browser', to: 'http', kind: 'solid', label: 'API' },
    { from: 'browser', to: 'ws', kind: 'solid', label: 'commit' },
    { from: 'browser', to: 'ws', kind: 'dashed', label: 'presence' },
    { from: 'http', to: 'neon', kind: 'solid', label: 'scenes' },
    { from: 'http', to: 'upstash', kind: 'dashed', label: 'limits' },
    { from: 'ws', to: 'upstash', kind: 'solid', label: 'state' },
    { from: 'ws', to: 'neon', kind: 'solid', label: 'access' },
    { from: 'worker', to: 'upstash', kind: 'solid', label: 'snapshots' },
    { from: 'worker', to: 'neon', kind: 'solid', label: 'flush' },
  ],
  sources: [
    'README.md',
    'apps/web/package.json',
    'apps/web/.env.example',
    'apps/http-server/package.json',
    'apps/http-server/.env.example',
    'apps/ws-server/package.json',
    'apps/ws-server/.env.example',
    'apps/flush-worker/package.json',
    'apps/http-server/src/index.ts',
    'apps/ws-server/src/index.ts',
  ],
};
