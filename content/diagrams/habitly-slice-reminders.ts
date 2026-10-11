import type { DiagramSpec } from './types';

export const habitlySliceRemindersSpec: DiagramSpec = {
  id: 'habitly-slice-reminders',
  project: 'habitly',
  title: 'Reminders slice',
  nodes: [
    { id: 'form', label: 'Reminder form', layer: 'screens' },
    { id: 'repos', label: 'Repositories', layer: 'localdata' },
    { id: 'sqlite', label: 'SQLite', layer: 'localdata' },
    { id: 'device', label: 'Device reconcile', layer: 'device' },
    { id: 'os', label: 'OS alarm', layer: 'device' },
  ],
  edges: [
    { from: 'form', to: 'repos', kind: 'solid', label: 'saves time' },
    { from: 'repos', to: 'sqlite', kind: 'solid', label: 'writes' },
    { from: 'sqlite', to: 'device', kind: 'solid', label: 'reconciles' },
    { from: 'device', to: 'os', kind: 'solid', label: 'schedules' },
  ],
  sources: [
    'src/features/habits/HabitForm.tsx',
    'src/database/repositories.ts',
    'src/services/deviceReminders.ts',
    'src/services/notifications.ts',
  ],
};
