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
import { habitlySystemSpec } from './habitly-system';
import { habitlyAppSpec } from './habitly-app';
import { habitlyDatabaseSpec } from './habitly-database';
import { habitlyServicesSpec } from './habitly-services';
import { habitlyFeaturesAccountSpec } from './habitly-features-account';
import { habitlyFeaturesAppSpec } from './habitly-features-app';
import { habitlyFeaturesHabitsSpec } from './habitly-features-habits';
import { habitlyFeaturesTasksSpec } from './habitly-features-tasks';
import { habitlyFeaturesNavigationSpec } from './habitly-features-navigation';
import { habitlyFeaturesOnboardingSpec } from './habitly-features-onboarding';
import { habitlyFeaturesStatisticsSpec } from './habitly-features-statistics';
import { habitlyComponentsSpec } from './habitly-components';
import { habitlyThemeSpec } from './habitly-theme';
import { habitlyUtilsSpec } from './habitly-utils';
import { habitlyTestsSpec } from './habitly-tests';
import { habitlyConfigSpec } from './habitly-config';
import { habitlyNavigationSpec } from './habitly-navigation';
import { habitlySliceOnboardingSpec } from './habitly-slice-onboarding';
import { habitlySliceHabitsSpec } from './habitly-slice-habits';
import { habitlySliceTasksSpec } from './habitly-slice-tasks';
import { habitlySliceTodaySpec } from './habitly-slice-today';
import { habitlySliceStatisticsSpec } from './habitly-slice-statistics';
import { habitlySliceRemindersSpec } from './habitly-slice-reminders';
import { habitlySliceSearchSpec } from './habitly-slice-search';
import { habitlySliceSettingsSpec } from './habitly-slice-settings';
import { habitlySliceCloudSpec } from './habitly-slice-cloud';
import { jsRuntimeSpec } from './js-runtime';
import { jsCoercionSpec } from './js-coercion';
import { jsFunctionsSpec } from './js-functions';
import { jsThisSpec } from './js-this';
import { jsArrayMethodsSpec } from './js-array-methods';
import { jsModulesSpec } from './js-modules';
import { jsCallbacksSpec } from './js-callbacks';
import { jsStorageSpec } from './js-storage';
import { jsScopeChainSpec } from './js-scope-chain';
import { jsTypesSpec } from './js-types';
import { jsPrototypeChainSpec } from './js-prototype-chain';
import { jsPromiseStatesSpec } from './js-promise-states';

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
  'habitly-system': habitlySystemSpec,
  'habitly-app': habitlyAppSpec,
  'habitly-database': habitlyDatabaseSpec,
  'habitly-services': habitlyServicesSpec,
  'habitly-features-account': habitlyFeaturesAccountSpec,
  'habitly-features-app': habitlyFeaturesAppSpec,
  'habitly-features-habits': habitlyFeaturesHabitsSpec,
  'habitly-features-tasks': habitlyFeaturesTasksSpec,
  'habitly-features-navigation': habitlyFeaturesNavigationSpec,
  'habitly-features-onboarding': habitlyFeaturesOnboardingSpec,
  'habitly-features-statistics': habitlyFeaturesStatisticsSpec,
  'habitly-components': habitlyComponentsSpec,
  'habitly-theme': habitlyThemeSpec,
  'habitly-utils': habitlyUtilsSpec,
  'habitly-tests': habitlyTestsSpec,
  'habitly-config': habitlyConfigSpec,
  'habitly-navigation': habitlyNavigationSpec,
  'habitly-slice-onboarding': habitlySliceOnboardingSpec,
  'habitly-slice-habits': habitlySliceHabitsSpec,
  'habitly-slice-tasks': habitlySliceTasksSpec,
  'habitly-slice-today': habitlySliceTodaySpec,
  'habitly-slice-statistics': habitlySliceStatisticsSpec,
  'habitly-slice-reminders': habitlySliceRemindersSpec,
  'habitly-slice-search': habitlySliceSearchSpec,
  'habitly-slice-settings': habitlySliceSettingsSpec,
  'habitly-slice-cloud': habitlySliceCloudSpec,
  'js-runtime': jsRuntimeSpec,
  'js-coercion': jsCoercionSpec,
  'js-functions': jsFunctionsSpec,
  'js-this': jsThisSpec,
  'js-array-methods': jsArrayMethodsSpec,
  'js-modules': jsModulesSpec,
  'js-callbacks': jsCallbacksSpec,
  'js-storage': jsStorageSpec,
  'js-scope-chain': jsScopeChainSpec,
  'js-types': jsTypesSpec,
  'js-prototype-chain': jsPrototypeChainSpec,
  'js-promise-states': jsPromiseStatesSpec,
};

export function getDiagramSpec(id: string): DiagramSpec | undefined {
  return diagramSpecs[id];
}
