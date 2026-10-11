import type { DiagramSpec } from './types';
import { systemSpec } from './system';
import { appsOverviewSpec } from './apps-overview';
import { packagesOverviewSpec } from './packages-overview';
import { webSpec } from './web';
import { engineSpec } from './engine';
import { commonSpec } from './common';
import { httpServerSpec } from './http-server';
import { wsServerSpec } from './ws-server';
import { flushWorkerSpec } from './flush-worker';
import { redisSpec } from './redis';
import { backendCommonSpec } from './backend-common';
import { dbSpec } from './db';
import { authSpec } from './auth';
import { hostingMapSpec } from './hosting-map';
import { keepAliveSpec } from './keep-alive';

/**
 * Every reusable diagram, keyed by the id used in MDX (`<Diagram id="web" />`).
 * Adding a diagram means adding one file here — no new components.
 */
export const diagramSpecs: Record<string, DiagramSpec> = {
  system: systemSpec,
  'apps-overview': appsOverviewSpec,
  'packages-overview': packagesOverviewSpec,
  web: webSpec,
  engine: engineSpec,
  common: commonSpec,
  'http-server': httpServerSpec,
  'ws-server': wsServerSpec,
  'flush-worker': flushWorkerSpec,
  redis: redisSpec,
  'backend-common': backendCommonSpec,
  db: dbSpec,
  auth: authSpec,
  'hosting-map': hostingMapSpec,
  'keep-alive': keepAliveSpec,
};

export function getDiagramSpec(id: string): DiagramSpec | undefined {
  return diagramSpecs[id];
}
