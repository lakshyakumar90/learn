import type { DiagramSpec } from './types';

/** A declaration file bridges typed code and plain JavaScript. */
export const tsDtsBridgeSpec: DiagramSpec = {
  id: 'ts-dts-bridge',
  title: 'Declaration file bridge',
  nodes: [
    { id: 'app', label: 'Typed app', layer: 'language' },
    { id: 'bridge', label: 'Declaration file', layer: 'engine' },
    { id: 'library', label: 'Plain library', layer: 'runtime' },
    { id: 'hint', label: 'Editor hints', layer: 'language' },
    { id: 'check', label: 'Call checking', layer: 'engine' },
  ],
  edges: [
    { from: 'library', to: 'bridge', kind: 'dashed', label: 'described by' },
    { from: 'bridge', to: 'app', kind: 'solid', label: 'informs' },
    { from: 'bridge', to: 'hint', kind: 'solid', label: 'powers' },
    { from: 'bridge', to: 'check', kind: 'solid', label: 'enables' },
  ],
  sources: [],
};
