import type { DiagramSpec } from './types';

export const habitlyServicesSpec: DiagramSpec = {
  id: 'habitly-services',
  project: 'habitly',
  title: 'Services',
  nodes: [
    { id: 'firebase', label: 'Firebase setup', layer: 'cloud' },
    { id: 'sync', label: 'Cloud sync', layer: 'cloud' },
    { id: 'bootstrap', label: 'Guest import', layer: 'cloud' },
    { id: 'deletion', label: 'Deletion call', layer: 'cloud' },
    { id: 'reminders', label: 'Device reminders', layer: 'device' },
    { id: 'notify', label: 'Notifications', layer: 'device' },
    { id: 'sqlite', label: 'SQLite', layer: 'localdata', external: true },
    { id: 'firestore', label: 'Firestore', layer: 'cloud', external: true },
  ],
  edges: [
    { from: 'firebase', to: 'sync', kind: 'dashed', label: 'connects' },
    { from: 'sync', to: 'sqlite', kind: 'solid', label: 'applies' },
    { from: 'sync', to: 'firestore', kind: 'dashed', label: 'pushes' },
    { from: 'bootstrap', to: 'sqlite', kind: 'solid', label: 'copies' },
    { from: 'deletion', to: 'firestore', kind: 'dashed', label: 'requests' },
    { from: 'reminders', to: 'notify', kind: 'solid', label: 'schedules' },
    { from: 'reminders', to: 'sqlite', kind: 'solid', label: 'reads' },
  ],
  sources: [
    'src/services/firebase.ts',
    'src/services/cloudSync.ts',
    'src/services/accountBootstrap.ts',
    'src/services/accountDeletion.ts',
    'src/services/deviceReminders.ts',
    'src/services/notifications.ts',
  ],
};
