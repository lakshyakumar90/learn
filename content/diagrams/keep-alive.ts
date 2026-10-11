import type { DiagramSpec } from './types';

/**
 * Keep-alive pings: an external scheduler hits the HTTP health URL and
 * the WS public URL inside a daily window so Render sees inbound traffic.
 */
export const keepAliveSpec: DiagramSpec = {
  id: 'keep-alive',
  title: 'Keep-alive pings',
  nodes: [
    { id: 'cron', label: 'Cloudflare cron', layer: 'api', external: true },
    { id: 'scheduler', label: 'cron-job.org', layer: 'api', external: true },
    { id: 'http', label: 'HTTP service', layer: 'api', external: true },
    { id: 'ws', label: 'WS service', layer: 'realtime', external: true },
  ],
  edges: [
    { from: 'cron', to: 'http', kind: 'dashed', label: 'ping /health' },
    { from: 'cron', to: 'ws', kind: 'dashed', label: 'ping URL' },
    { from: 'scheduler', to: 'http', kind: 'dashed', label: 'ping /health' },
    { from: 'scheduler', to: 'ws', kind: 'dashed', label: 'ping URL' },
  ],
  sources: [
    'apps/http-server/src/app.ts',
    'apps/http-server/src/index.ts',
    'apps/ws-server/src/server.ts',
    'apps/ws-server/src/index.ts',
  ],
};
