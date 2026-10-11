import type { DiagramSpec } from './types';

export const devconnectFeatJobsSpec: DiagramSpec = {
  id: 'devconnect-feat-jobs',
  project: 'devconnect',
  title: 'Jobs slice',
  nodes: [
    { id: 'page', label: 'Job pages', layer: 'browser' },
    { id: 'service', label: 'Job service', layer: 'browser' },
    { id: 'route', label: 'Job routes', layer: 'api' },
    { id: 'upload', label: 'Upload middle', layer: 'api' },
    { id: 'controller', label: 'Job control', layer: 'api' },
    { id: 'model', label: 'Job model', layer: 'api' },
  ],
  edges: [
    { from: 'page', to: 'service', kind: 'solid', label: 'applies' },
    { from: 'service', to: 'route', kind: 'solid', label: 'POST' },
    { from: 'route', to: 'upload', kind: 'solid', label: 'resume' },
    { from: 'upload', to: 'controller', kind: 'solid' },
    { from: 'controller', to: 'model', kind: 'solid', label: 'saves' },
  ],
  sources: [
    'frontend/src/pages/JobsPage.jsx',
    'frontend/src/services/jobService.js',
    'backend/routes/jobRoutes.js',
    'backend/controllers/jobController.js',
    'backend/models/Job.js',
  ],
};
