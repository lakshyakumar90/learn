import type { DiagramSpec } from './types';

/** Every call runs in two phases: creation, then execution. */
export const jsExecContextSpec: DiagramSpec = {
  id: 'js-exec-context',
  title: 'Execution context',
  nodes: [
    { id: 'call', label: 'Call', layer: 'language' },
    { id: 'creation', label: 'Creation', layer: 'runtime' },
    { id: 'memory', label: 'Memory', layer: 'runtime' },
    { id: 'scope', label: 'Scope', layer: 'language' },
    { id: 'this', label: 'This value', layer: 'language' },
    { id: 'execution', label: 'Execution', layer: 'runtime' },
    { id: 'return', label: 'Return', layer: 'language' },
  ],
  edges: [
    { from: 'call', to: 'creation', kind: 'solid' },
    { from: 'creation', to: 'memory', kind: 'solid', label: 'reserve' },
    { from: 'creation', to: 'scope', kind: 'solid', label: 'link' },
    { from: 'creation', to: 'this', kind: 'dashed', label: 'bind' },
    { from: 'creation', to: 'execution', kind: 'solid', label: 'then' },
    { from: 'execution', to: 'return', kind: 'solid' },
  ],
  sources: [],
};
