import type { FlowSpec } from './types';

export const hbRemindersFlow: FlowSpec = {
  id: 'hb-reminders',
  project: 'habitly',
  title: 'Reminders',
  diagram: 'habitly-system',
  steps: [
    {
      title: 'Pick a time',
      narration: 'The habit form stores a reminder time alongside the schedule.',
      nodes: ['tabs', 'feature-ui', 'app-state', 'repos', 'sqlite'],
      edges: [
        { from: 'tabs', to: 'feature-ui', kind: 'solid' },
        { from: 'feature-ui', to: 'app-state', kind: 'solid' },
        { from: 'app-state', to: 'repos', kind: 'solid' },
        { from: 'repos', to: 'sqlite', kind: 'solid' },
      ],
      path: ['tabs', 'feature-ui', 'app-state', 'repos', 'sqlite'],
      sources: ['src/features/habits/HabitForm.tsx', 'src/database/repositories.ts'],
    },
    {
      title: 'Reconcile',
      narration: 'The device layer compares stored times with scheduled OS alarms.',
      nodes: ['repos', 'sqlite', 'reminders'],
      edges: [
        { from: 'repos', to: 'sqlite', kind: 'solid' },
        { from: 'repos', to: 'reminders', kind: 'solid' },
      ],
      path: ['repos', 'sqlite', 'reminders'],
      sources: ['src/services/deviceReminders.ts'],
    },
    {
      title: 'Notify',
      narration: 'Missing alarms are scheduled through the OS notification channel.',
      nodes: ['reminders'],
      edges: [],
      path: ['reminders'],
      sources: ['src/services/notifications.ts'],
    },
  ],
  sources: [
    'src/services/deviceReminders.ts',
    'src/services/notifications.ts',
    'src/database/repositories.ts',
  ],
};
