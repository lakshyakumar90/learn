import type { DiagramSpec } from './types';

/** The call site picks the rule; arrows inherit instead. */
export const jsThisSpec: DiagramSpec = {
  id: 'js-this',
  title: 'This rules',
  nodes: [
    { id: 'call', label: 'Call site', layer: 'language' },
    { id: 'new', label: 'New object', layer: 'language' },
    { id: 'explicit', label: 'Call or bind', layer: 'language' },
    { id: 'implicit', label: 'Method call', layer: 'language' },
    { id: 'default', label: 'Bare call', layer: 'language' },
    { id: 'arrow', label: 'Arrow inherit', layer: 'runtime' },
  ],
  edges: [
    { from: 'call', to: 'new', kind: 'solid', label: 'new wins' },
    { from: 'call', to: 'explicit', kind: 'solid', label: 'then' },
    { from: 'call', to: 'implicit', kind: 'solid', label: 'then' },
    { from: 'call', to: 'default', kind: 'dashed', label: 'fallback' },
    { from: 'call', to: 'arrow', kind: 'dashed', label: 'lexical' },
  ],
  sources: [],
};
