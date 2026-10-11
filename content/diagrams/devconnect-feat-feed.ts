import type { DiagramSpec } from './types';

export const devconnectFeatFeedSpec: DiagramSpec = {
  id: 'devconnect-feat-feed',
  project: 'devconnect',
  title: 'Feed and posts slice',
  nodes: [
    { id: 'page', label: 'Feed page', layer: 'browser' },
    { id: 'service', label: 'Post service', layer: 'browser' },
    { id: 'route', label: 'Post routes', layer: 'api' },
    { id: 'upload', label: 'Upload middle', layer: 'api' },
    { id: 'controller', label: 'Post control', layer: 'api' },
    { id: 'model', label: 'Post model', layer: 'api' },
  ],
  edges: [
    { from: 'page', to: 'service', kind: 'solid', label: 'publishes' },
    { from: 'service', to: 'route', kind: 'solid', label: 'POST' },
    { from: 'route', to: 'upload', kind: 'solid', label: 'image' },
    { from: 'upload', to: 'controller', kind: 'solid' },
    { from: 'controller', to: 'model', kind: 'solid', label: 'creates' },
  ],
  sources: [
    'frontend/src/pages/FeedPage.jsx',
    'frontend/src/services/postService.js',
    'backend/routes/postRoutes.js',
    'backend/controllers/postController.js',
    'backend/models/Post.js',
  ],
};
