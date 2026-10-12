import type { DiagramSpec } from './types';

/** Imports point at one shared module instance. */
export const jsModuleGraphSpec: DiagramSpec = {
  id: 'js-module-graph',
  title: 'Module graph',
  nodes: [
    { id: 'app', label: 'App', layer: 'features' },
    { id: 'header', label: 'Header', layer: 'features' },
    { id: 'cart', label: 'Cart', layer: 'features' },
    { id: 'store', label: 'Store', layer: 'shared' },
    { id: 'api', label: 'Api client', layer: 'api' },
    { id: 'utils', label: 'Utils', layer: 'shared' },
  ],
  edges: [
    { from: 'app', to: 'header', kind: 'solid', label: 'imports' },
    { from: 'app', to: 'cart', kind: 'solid', label: 'imports' },
    { from: 'header', to: 'store', kind: 'solid', label: 'imports' },
    { from: 'cart', to: 'store', kind: 'solid', label: 'imports' },
    { from: 'cart', to: 'api', kind: 'solid', label: 'imports' },
    { from: 'store', to: 'utils', kind: 'solid', label: 'imports' },
    { from: 'api', to: 'utils', kind: 'dashed', label: 'imports' },
  ],
  sources: [],
};
