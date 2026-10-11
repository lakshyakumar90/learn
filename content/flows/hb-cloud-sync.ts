import type { FlowSpec } from './types';

export const hbCloudSyncFlow: FlowSpec = {
  id: 'hb-cloud-sync',
  project: 'habitly',
  title: 'Cloud sync',
  diagram: 'habitly-system',
  steps: [
    {
      title: 'Sign in',
      narration: 'Google sign-in needs a dev build with Firebase values; Expo Go cannot run it.',
      nodes: ['details', 'feature-ui'],
      edges: [{ from: 'details', to: 'feature-ui', kind: 'solid' }],
      path: ['details', 'feature-ui'],
      sources: ['src/features/account/CloudAccountProvider.tsx', 'src/services/firebase.ts'],
    },
    {
      title: 'Guest import',
      narration: 'A brand-new cloud account copies the guest database in once.',
      nodes: ['feature-ui', 'app-state', 'repos', 'sqlite'],
      edges: [
        { from: 'feature-ui', to: 'app-state', kind: 'solid' },
        { from: 'app-state', to: 'repos', kind: 'solid' },
        { from: 'repos', to: 'sqlite', kind: 'solid' },
      ],
      path: ['feature-ui', 'app-state', 'repos', 'sqlite'],
      sources: ['src/services/accountBootstrap.ts'],
    },
    {
      title: 'Sync',
      narration: 'The outbox uploads local edits when NetInfo reports a connection.',
      nodes: ['repos', 'sqlite', 'outbox', 'firestore'],
      edges: [
        { from: 'repos', to: 'sqlite', kind: 'solid' },
        { from: 'outbox', to: 'firestore', kind: 'dashed' },
      ],
      path: ['repos', 'sqlite', 'outbox', 'firestore'],
      sources: ['src/services/cloudSync.ts'],
    },
    {
      title: 'Restore',
      narration: 'Listeners pull remote changes back into SQLite on other devices.',
      nodes: ['firestore', 'sqlite', 'repos', 'reminders'],
      edges: [
        { from: 'firestore', to: 'sqlite', kind: 'dashed' },
        { from: 'repos', to: 'reminders', kind: 'solid' },
      ],
      path: ['firestore', 'sqlite', 'reminders'],
      sources: ['src/services/cloudSync.ts', 'src/services/deviceReminders.ts'],
    },
  ],
  sources: [
    'src/features/account/CloudAccountProvider.tsx',
    'src/services/cloudSync.ts',
    'src/services/firebase.ts',
  ],
};
