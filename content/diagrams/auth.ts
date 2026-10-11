import type { DiagramSpec } from './types';

export const authSpec: DiagramSpec = {
  id: 'auth',
  title: 'auth package',
  nodes: [
    { id: 'web', label: 'Web client', layer: 'browser', external: true },
    { id: 'client', label: 'Auth client', layer: 'shared' },
    { id: 'server', label: 'Auth server', layer: 'shared' },
    { id: 'tickets', label: 'Presence tickets', layer: 'shared' },
    { id: 'invites', label: 'Room invites', layer: 'shared' },
    { id: 'email', label: 'Email', layer: 'shared', external: true },
    { id: 'ws', label: 'WS server', layer: 'realtime', external: true },
  ],
  edges: [
    { from: 'web', to: 'client', kind: 'solid', label: 'sign in' },
    { from: 'client', to: 'server', kind: 'solid', label: 'session' },
    { from: 'server', to: 'email', kind: 'solid', label: 'verify' },
    { from: 'tickets', to: 'ws', kind: 'dashed', label: 'ticket' },
    { from: 'invites', to: 'server', kind: 'solid', label: 'accept' },
  ],
  sources: [
    'packages/auth/README.md',
    'packages/auth/src/README.md',
    'packages/auth/src/client.ts',
    'packages/auth/src/server.ts',
    'packages/auth/src/presenceTicket.ts',
    'packages/auth/src/roomInvitation.ts',
  ],
};
