import type { DiagramSpec } from './types';

/** Cookies travel; storages stay; sessions die with the tab. */
export const jsStorageSpec: DiagramSpec = {
  id: 'js-storage',
  title: 'Browser storage',
  nodes: [
    { id: 'data', label: 'Small data', layer: 'browser' },
    { id: 'cookie', label: 'Cookie', layer: 'browser' },
    { id: 'local', label: 'Local storage', layer: 'browser' },
    { id: 'session', label: 'Session storage', layer: 'browser' },
    { id: 'sent', label: 'Sent always', layer: 'runtime' },
    { id: 'stays', label: 'Stays local', layer: 'runtime' },
    { id: 'tab', label: 'Dies with tab', layer: 'runtime' },
  ],
  edges: [
    { from: 'data', to: 'cookie', kind: 'solid' },
    { from: 'data', to: 'local', kind: 'solid' },
    { from: 'data', to: 'session', kind: 'solid' },
    { from: 'cookie', to: 'sent', kind: 'dashed', label: 'travels' },
    { from: 'local', to: 'stays', kind: 'solid', label: 'persists' },
    { from: 'session', to: 'tab', kind: 'dashed', label: 'temporary' },
  ],
  sources: [],
};
