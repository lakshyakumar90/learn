import type { DiagramSpec } from './types';

export const engineSpec: DiagramSpec = {
  id: 'engine',
  title: 'engine package',
  nodes: [
    { id: 'tools', label: 'Tools', layer: 'shared' },
    { id: 'geometry', label: 'Geometry', layer: 'shared' },
    { id: 'scene', label: 'Scene', layer: 'shared' },
    { id: 'renderer', label: 'Renderer', layer: 'shared' },
    { id: 'history', label: 'History', layer: 'shared' },
    { id: 'text', label: 'Text', layer: 'shared' },
  ],
  edges: [
    { from: 'tools', to: 'geometry', kind: 'solid', label: 'shapes' },
    { from: 'tools', to: 'scene', kind: 'solid', label: 'edits' },
    { from: 'scene', to: 'history', kind: 'solid', label: 'capture' },
    { from: 'scene', to: 'renderer', kind: 'solid', label: 'draw' },
    { from: 'geometry', to: 'renderer', kind: 'solid', label: 'paths' },
    { from: 'text', to: 'renderer', kind: 'solid', label: 'glyphs' },
  ],
  sources: [
    'packages/engine/README.md',
    'packages/engine/src/README.md',
    'packages/engine/src/tools/README.md',
    'packages/engine/src/geometry/README.md',
    'packages/engine/src/scene/README.md',
    'packages/engine/src/renderer/README.md',
    'packages/engine/src/text/README.md',
  ],
};
