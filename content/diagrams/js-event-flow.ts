import type { DiagramSpec } from './types';

/** Capture travels down, bubble climbs back up. */
export const jsEventFlowSpec: DiagramSpec = {
  id: 'js-event-flow',
  title: 'Event flow',
  nodes: [
    { id: 'window', label: 'Window', layer: 'browser' },
    { id: 'document', label: 'Document', layer: 'browser' },
    { id: 'card', label: 'Card', layer: 'browser' },
    { id: 'button', label: 'Button', layer: 'browser' },
    { id: 'capture', label: 'Capture', layer: 'browser' },
    { id: 'bubble', label: 'Bubble', layer: 'browser' },
    { id: 'handler', label: 'Handler', layer: 'browser' },
  ],
  edges: [
    { from: 'window', to: 'document', kind: 'solid' },
    { from: 'document', to: 'card', kind: 'solid' },
    { from: 'card', to: 'button', kind: 'solid' },
    { from: 'window', to: 'capture', kind: 'dashed', label: 'down' },
    { from: 'button', to: 'handler', kind: 'solid', label: 'target' },
    { from: 'handler', to: 'bubble', kind: 'dashed', label: 'up' },
    { from: 'bubble', to: 'window', kind: 'dashed' },
  ],
  sources: [],
};
