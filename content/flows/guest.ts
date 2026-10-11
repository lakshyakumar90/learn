import type { FlowSpec } from './types';

export const guestFlow: FlowSpec = {
  id: 'guest',
  title: 'Guest',
  diagram: 'system',
  steps: [
    {
      title: 'Draw',
      narration: 'Strokes become elements in the Editor.',
      nodes: ['editor'],
      edges: [],
      path: ['editor'],
      sources: ['packages/engine/src/tools/README.md', 'packages/engine/src/geometry/README.md'],
    },
    {
      title: 'Scene',
      narration:
        'Finished strokes join the scene, and history keeps one durable version per changed element.',
      nodes: ['editor'],
      edges: [],
      path: ['editor'],
      sources: ['packages/engine/src/scene/README.md', 'apps/web/src/lib/sync/commits.ts'],
    },
    {
      title: 'Render',
      narration: 'The Renderer replays the scene as sketch-style paths.',
      nodes: ['editor'],
      edges: [],
      path: ['editor'],
      sources: ['packages/engine/src/renderer/README.md'],
    },
    {
      title: 'Autosave',
      narration:
        'Autosave writes the scene to IndexedDB on this device. Nothing reaches a server.',
      nodes: ['editor', 'indexeddb'],
      edges: [{ from: 'editor', to: 'indexeddb', kind: 'solid' }],
      path: ['editor', 'indexeddb'],
      sources: [
        'apps/web/src/lib/persistence/README.md',
        'apps/web/src/lib/persistence/indexedDb.ts',
      ],
    },
  ],
  sources: [
    'apps/web/README.md',
    'apps/web/src/lib/persistence/indexedDb.ts',
    'apps/web/src/lib/sync/commits.ts',
  ],
};
