import type { FlowSpec } from './types';

export const dcChatFlow: FlowSpec = {
  id: 'dc-chat',
  project: 'devconnect',
  title: 'Chat',
  diagram: 'devconnect-system',
  steps: [
    {
      title: 'Register socket',
      narration: 'After login the socket service connects, registers the user id, and joins the personal room; presence lands in Redis.',
      nodes: ['react-app', 'socket-client', 'socket-server', 'redis'],
      edges: [
        { from: 'socket-client', to: 'socket-server', kind: 'dashed' },
        { from: 'socket-server', to: 'redis', kind: 'solid' },
      ],
      path: ['socket-client', 'socket-server', 'redis'],
      sources: ['frontend/src/services/socketService.js', 'backend/utils/socket.js'],
    },
    {
      title: 'Typing',
      narration: 'While typing, the page emits typing events; the server relays them to the peer room and never stores them.',
      nodes: ['socket-client', 'socket-server'],
      edges: [
        { from: 'socket-client', to: 'socket-server', kind: 'dashed' },
        { from: 'socket-server', to: 'socket-client', kind: 'dashed' },
      ],
      path: ['socket-client', 'socket-server', 'socket-client'],
      sources: ['frontend/src/pages/ChatPage.jsx', 'backend/utils/socket.js'],
    },
    {
      title: 'Send',
      narration: 'The message event is checked against connections and jobs, stored in the chat, and marked sent or delivered.',
      nodes: ['socket-client', 'socket-server', 'mongo'],
      edges: [
        { from: 'socket-client', to: 'socket-server', kind: 'dashed' },
        { from: 'socket-server', to: 'mongo', kind: 'solid' },
      ],
      path: ['socket-client', 'socket-server', 'mongo'],
      sources: ['backend/utils/socket.js', 'backend/models/Chat.js'],
    },
    {
      title: 'Deliver',
      narration: 'The server emits to the receiver room and confirms back to the sender; the store swaps the temp id for the real one.',
      nodes: ['socket-server', 'socket-client', 'redux'],
      edges: [
        { from: 'socket-server', to: 'socket-client', kind: 'dashed' },
        { from: 'socket-client', to: 'redux', kind: 'dashed' },
      ],
      path: ['socket-server', 'socket-client', 'redux'],
      sources: ['backend/utils/socket.js', 'frontend/src/services/socketService.js'],
    },
    {
      title: 'Read',
      narration: 'Opening the chat marks messages read over REST and socket; the sender sees ticks flip to read.',
      nodes: ['socket-client', 'socket-server', 'mongo'],
      edges: [
        { from: 'socket-client', to: 'socket-server', kind: 'dashed' },
        { from: 'socket-server', to: 'mongo', kind: 'solid' },
      ],
      path: ['socket-client', 'socket-server', 'mongo'],
      sources: ['backend/controllers/messageController.js', 'backend/utils/socket.js'],
    },
  ],
  sources: [
    'frontend/src/pages/ChatPage.jsx',
    'frontend/src/services/socketService.js',
    'backend/utils/socket.js',
    'backend/models/Chat.js',
  ],
};
