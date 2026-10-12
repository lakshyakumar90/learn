import type { DiagramSpec } from './types';

/** The language, the standard, the runtimes, and the APIs around them. */
export const jsEcosystemSpec: DiagramSpec = {
  id: 'js-ecosystem',
  title: 'JavaScript ecosystem',
  nodes: [
    { id: 'standard', label: 'ECMAScript', layer: 'language' },
    { id: 'language', label: 'JavaScript', layer: 'language' },
    { id: 'browsers', label: 'Browsers', layer: 'browser' },
    { id: 'node', label: 'Node.js', layer: 'runtime' },
    { id: 'deno', label: 'Deno', layer: 'runtime', external: true },
    { id: 'bun', label: 'Bun', layer: 'runtime', external: true },
    { id: 'webapis', label: 'Web APIs', layer: 'browser' },
    { id: 'npm', label: 'npm', layer: 'runtime' },
    { id: 'ts', label: 'TypeScript', layer: 'language', external: true },
  ],
  edges: [
    { from: 'standard', to: 'language', kind: 'solid', label: 'defines' },
    { from: 'language', to: 'browsers', kind: 'solid', label: 'runs in' },
    { from: 'language', to: 'node', kind: 'solid', label: 'runs in' },
    { from: 'language', to: 'deno', kind: 'dashed', label: 'runs in' },
    { from: 'language', to: 'bun', kind: 'dashed', label: 'runs in' },
    { from: 'browsers', to: 'webapis', kind: 'solid', label: 'provide' },
    { from: 'npm', to: 'node', kind: 'dashed', label: 'packages' },
    { from: 'ts', to: 'language', kind: 'dashed', label: 'compiles to' },
  ],
  // Teaching diagram: no repo files back it; the pages cite web sources.
  sources: [],
};
