import type { DiagramSpec } from './types';

/** V8 runs scripts; libuv runs the world around them. */
export const jsNodeArchSpec: DiagramSpec = {
  id: 'js-node-arch',
  title: 'Node architecture',
  nodes: [
    { id: 'app', label: 'App code', layer: 'language' },
    { id: 'v8', label: 'V8', layer: 'engine' },
    { id: 'bindings', label: 'Bindings', layer: 'runtime' },
    { id: 'libuv', label: 'libuv', layer: 'runtime' },
    { id: 'loop', label: 'Event loop', layer: 'runtime' },
    { id: 'system', label: 'System', layer: 'runtime' },
  ],
  edges: [
    { from: 'app', to: 'v8', kind: 'solid', label: 'runs on' },
    { from: 'v8', to: 'bindings', kind: 'solid', label: 'calls' },
    { from: 'bindings', to: 'libuv', kind: 'solid' },
    { from: 'libuv', to: 'loop', kind: 'solid', label: 'phases' },
    { from: 'loop', to: 'app', kind: 'dashed', label: 'callbacks' },
    { from: 'loop', to: 'system', kind: 'dashed', label: 'polls' },
  ],
  sources: [],
};
