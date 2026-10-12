import type { DiagramSpec } from './types';

/** Static imports analyze; dynamic requires execute. */
export const jsModulesSpec: DiagramSpec = {
  id: 'js-modules',
  title: 'Module systems',
  nodes: [
    { id: 'esm', label: 'ES modules', layer: 'language' },
    { id: 'import', label: 'Import', layer: 'language' },
    { id: 'export', label: 'Export', layer: 'language' },
    { id: 'cjs', label: 'CommonJS', layer: 'runtime' },
    { id: 'require', label: 'Require', layer: 'runtime' },
    { id: 'bundle', label: 'Bundler', layer: 'runtime' },
  ],
  edges: [
    { from: 'esm', to: 'import', kind: 'solid' },
    { from: 'esm', to: 'export', kind: 'solid' },
    { from: 'cjs', to: 'require', kind: 'solid' },
    { from: 'import', to: 'bundle', kind: 'dashed', label: 'analyzes' },
    { from: 'export', to: 'bundle', kind: 'dashed', label: 'shakes' },
    { from: 'require', to: 'bundle', kind: 'dashed', label: 'executes' },
  ],
  sources: [],
};
