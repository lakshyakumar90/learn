import type { DiagramSpec } from './types';

export const devconnectFeatChatSpec: DiagramSpec = {
  id: 'devconnect-feat-chat',
  project: 'devconnect',
  title: 'Real-time chat slice',
  nodes: [
    { id: 'page', label: 'Chat page', layer: 'browser' },
    { id: 'socket-client', label: 'Socket client', layer: 'browser' },
    { id: 'socket-server', label: 'Socket server', layer: 'realtime' },
    { id: 'chat', label: 'Chat model', layer: 'api' },
    { id: 'mongo', label: 'MongoDB', layer: 'database', external: true },
    { id: 'peer', label: 'Peer client', layer: 'browser', external: true },
  ],
  edges: [
    { from: 'page', to: 'socket-client', kind: 'solid', label: 'sends' },
    { from: 'socket-client', to: 'socket-server', kind: 'dashed', label: 'message' },
    { from: 'socket-server', to: 'chat', kind: 'solid', label: 'stores' },
    { from: 'chat', to: 'mongo', kind: 'solid', label: 'writes' },
    { from: 'socket-server', to: 'peer', kind: 'dashed', label: 'delivers' },
    { from: 'socket-client', to: 'socket-server', kind: 'dashed', label: 'typing' },
  ],
  sources: [
    'frontend/src/pages/ChatPage.jsx',
    'frontend/src/services/socketService.js',
    'frontend/src/services/messageService.js',
    'backend/utils/socket.js',
    'backend/models/Chat.js',
  ],
};
