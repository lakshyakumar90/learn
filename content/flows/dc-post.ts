import type { FlowSpec } from './types';

export const dcPostFlow: FlowSpec = {
  id: 'dc-post',
  project: 'devconnect',
  title: 'Post',
  diagram: 'devconnect-system',
  steps: [
    {
      title: 'Compose',
      narration: 'The create-post modal gathers text, code snippet, tags, and an optional image file.',
      nodes: ['react-app'],
      edges: [],
      path: ['react-app'],
      sources: ['frontend/src/components/posts/CreatePostModal.jsx'],
    },
    {
      title: 'Upload image',
      narration: 'The image goes up as multipart data; the upload middleware stores it on Cloudinary or locally and returns a URL.',
      nodes: ['react-app', 'services', 'routes', 'controllers', 'cloudinary'],
      edges: [
        { from: 'services', to: 'routes', kind: 'solid' },
        { from: 'routes', to: 'controllers', kind: 'solid' },
        { from: 'controllers', to: 'cloudinary', kind: 'solid' },
      ],
      path: ['react-app', 'services', 'routes', 'controllers', 'cloudinary'],
      sources: [
        'frontend/src/services/postService.js',
        'backend/routes/postRoutes.js',
        'backend/middleware/upload.js',
        'backend/controllers/postController.js',
      ],
    },
    {
      title: 'Publish',
      narration: 'The post is created with the image URL attached; likes and comments arrive through the same controller.',
      nodes: ['services', 'routes', 'controllers', 'models', 'mongo'],
      edges: [
        { from: 'services', to: 'routes', kind: 'solid' },
        { from: 'routes', to: 'controllers', kind: 'solid' },
        { from: 'controllers', to: 'models', kind: 'solid' },
        { from: 'models', to: 'mongo', kind: 'solid' },
      ],
      path: ['services', 'routes', 'controllers', 'models', 'mongo'],
      sources: ['backend/controllers/postController.js', 'backend/models/Post.js'],
    },
    {
      title: 'Feed',
      narration: 'The feed page pages through posts by cursor, with recent and top tabs plus tag filters.',
      nodes: ['react-app', 'services', 'routes', 'controllers', 'models'],
      edges: [
        { from: 'services', to: 'routes', kind: 'solid' },
        { from: 'routes', to: 'controllers', kind: 'solid' },
        { from: 'controllers', to: 'models', kind: 'solid' },
      ],
      path: ['react-app', 'services', 'routes', 'controllers', 'models'],
      sources: ['frontend/src/pages/FeedPage.jsx', 'backend/controllers/postController.js'],
    },
  ],
  sources: [
    'frontend/src/components/posts/CreatePostModal.jsx',
    'frontend/src/services/postService.js',
    'backend/routes/postRoutes.js',
    'backend/controllers/postController.js',
  ],
};
