import type { DiagramSpec } from './types';

/** JavaScript invalidates; the browser repaints in stages. */
export const jsRenderPipelineSpec: DiagramSpec = {
  id: 'js-render-pipeline',
  title: 'Render pipeline',
  nodes: [
    { id: 'script', label: 'Script', layer: 'language' },
    { id: 'style', label: 'Style', layer: 'browser' },
    { id: 'layout', label: 'Layout', layer: 'browser' },
    { id: 'paint', label: 'Paint', layer: 'browser' },
    { id: 'composite', label: 'Composite', layer: 'browser' },
    { id: 'frame', label: 'Frame', layer: 'browser' },
  ],
  edges: [
    { from: 'script', to: 'style', kind: 'solid', label: 'invalidates' },
    { from: 'style', to: 'layout', kind: 'solid' },
    { from: 'layout', to: 'paint', kind: 'solid' },
    { from: 'paint', to: 'composite', kind: 'solid' },
    { from: 'composite', to: 'frame', kind: 'solid', label: 'pixels' },
  ],
  sources: [],
};
