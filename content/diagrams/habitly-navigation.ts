import type { DiagramSpec } from './types';

export const habitlyNavigationSpec: DiagramSpec = {
  id: 'habitly-navigation',
  project: 'habitly',
  title: 'Screens and navigation',
  nodes: [
    { id: 'welcome', label: 'Welcome', layer: 'screens' },
    { id: 'onboarding', label: 'Onboarding', layer: 'screens' },
    { id: 'today', label: 'Today tab', layer: 'screens' },
    { id: 'habits', label: 'Habits tab', layer: 'screens' },
    { id: 'tasks', label: 'Tasks tab', layer: 'screens' },
    { id: 'stats', label: 'Stats tab', layer: 'screens' },
    { id: 'profile', label: 'Profile tab', layer: 'screens' },
    { id: 'habitdetail', label: 'Habit detail', layer: 'screens' },
    { id: 'taskdetail', label: 'Task detail', layer: 'screens' },
    { id: 'statsdetail', label: 'Stats detail', layer: 'screens' },
    { id: 'achieve', label: 'Achievements', layer: 'screens' },
    { id: 'settings', label: 'Settings', layer: 'screens' },
  ],
  edges: [
    { from: 'welcome', to: 'onboarding', kind: 'solid', label: 'starts' },
    { from: 'onboarding', to: 'today', kind: 'solid', label: 'enters' },
    { from: 'today', to: 'habitdetail', kind: 'solid', label: 'opens' },
    { from: 'habits', to: 'habitdetail', kind: 'solid', label: 'opens' },
    { from: 'tasks', to: 'taskdetail', kind: 'solid', label: 'opens' },
    { from: 'stats', to: 'statsdetail', kind: 'solid', label: 'opens' },
    { from: 'stats', to: 'achieve', kind: 'solid', label: 'opens' },
    { from: 'profile', to: 'settings', kind: 'solid', label: 'opens' },
  ],
  sources: [
    'src/app/_layout.tsx',
    'src/app/(tabs)/_layout.tsx',
    'src/app/habit/[id].tsx',
    'src/app/task/[id].tsx',
    'src/app/settings.tsx',
  ],
};
