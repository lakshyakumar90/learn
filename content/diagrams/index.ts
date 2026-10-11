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
import { devconnectSystemSpec } from './devconnect-system';
import { devconnectBackendSpec } from './devconnect-backend';
import { devconnectFrontendSpec } from './devconnect-frontend';
import { devconnectBackendEntrySpec } from './devconnect-backend-entry';
import { devconnectBackendConfigSpec } from './devconnect-backend-config';
import { devconnectBackendRoutesSpec } from './devconnect-backend-routes';
import { devconnectBackendControllersSpec } from './devconnect-backend-controllers';
import { devconnectBackendMiddlewareSpec } from './devconnect-backend-middleware';
import { devconnectBackendModelsSpec } from './devconnect-backend-models';
import { devconnectBackendUtilsSpec } from './devconnect-backend-utils';
import { devconnectFrontendPagesSpec } from './devconnect-frontend-pages';
import { devconnectFrontendComponentsSpec } from './devconnect-frontend-components';
import { devconnectFrontendServicesSpec } from './devconnect-frontend-services';
import { devconnectFrontendStoreSpec } from './devconnect-frontend-store';
import { devconnectFrontendHooksSpec } from './devconnect-frontend-hooks';
import { devconnectFrontendLibSpec } from './devconnect-frontend-lib';
import { devconnectFrontendUtilsSpec } from './devconnect-frontend-utils';
import { devconnectFrontendAssetsSpec } from './devconnect-frontend-assets';
import { devconnectFeatAuthSpec } from './devconnect-feat-auth';
import { devconnectFeatProfilesSpec } from './devconnect-feat-profiles';
import { devconnectFeatConnectionsSpec } from './devconnect-feat-connections';
import { devconnectFeatFeedSpec } from './devconnect-feat-feed';
import { devconnectFeatJobsSpec } from './devconnect-feat-jobs';
import { devconnectFeatNotificationsSpec } from './devconnect-feat-notifications';
import { devconnectFeatChatSpec } from './devconnect-feat-chat';

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
  'devconnect-system': devconnectSystemSpec,
  'devconnect-backend': devconnectBackendSpec,
  'devconnect-frontend': devconnectFrontendSpec,
  'devconnect-backend-entry': devconnectBackendEntrySpec,
  'devconnect-backend-config': devconnectBackendConfigSpec,
  'devconnect-backend-routes': devconnectBackendRoutesSpec,
  'devconnect-backend-controllers': devconnectBackendControllersSpec,
  'devconnect-backend-middleware': devconnectBackendMiddlewareSpec,
  'devconnect-backend-models': devconnectBackendModelsSpec,
  'devconnect-backend-utils': devconnectBackendUtilsSpec,
  'devconnect-frontend-pages': devconnectFrontendPagesSpec,
  'devconnect-frontend-components': devconnectFrontendComponentsSpec,
  'devconnect-frontend-services': devconnectFrontendServicesSpec,
  'devconnect-frontend-store': devconnectFrontendStoreSpec,
  'devconnect-frontend-hooks': devconnectFrontendHooksSpec,
  'devconnect-frontend-lib': devconnectFrontendLibSpec,
  'devconnect-frontend-utils': devconnectFrontendUtilsSpec,
  'devconnect-frontend-assets': devconnectFrontendAssetsSpec,
  'devconnect-feat-auth': devconnectFeatAuthSpec,
  'devconnect-feat-profiles': devconnectFeatProfilesSpec,
  'devconnect-feat-connections': devconnectFeatConnectionsSpec,
  'devconnect-feat-feed': devconnectFeatFeedSpec,
  'devconnect-feat-jobs': devconnectFeatJobsSpec,
  'devconnect-feat-notifications': devconnectFeatNotificationsSpec,
  'devconnect-feat-chat': devconnectFeatChatSpec,
};

export function getDiagramSpec(id: string): DiagramSpec | undefined {
  return diagramSpecs[id];
}
