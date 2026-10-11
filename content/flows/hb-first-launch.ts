import type { FlowSpec } from './types';

export const hbFirstLaunchFlow: FlowSpec = {
  id: 'hb-first-launch',
  project: 'habitly',
  title: 'First launch',
  diagram: 'habitly-system',
  steps: [
    {
      title: 'Welcome',
      narration: 'A fresh install opens the welcome art before any data exists.',
      nodes: ['welcome'],
      edges: [],
      path: ['welcome'],
      sources: ['src/app/index.tsx', 'src/app/welcome.tsx'],
    },
    {
      title: 'Onboarding',
      narration: 'Five personalization steps collect the profile and save each answer locally.',
      nodes: ['welcome', 'feature-ui'],
      edges: [{ from: 'welcome', to: 'feature-ui', kind: 'solid' }],
      path: ['welcome', 'feature-ui'],
      sources: ['src/features/onboarding/OnboardingFlow.tsx', 'src/features/onboarding/types.ts'],
    },
    {
      title: 'Guest profile',
      narration: 'Finishing as a guest completes onboarding and opens the main app.',
      nodes: ['feature-ui', 'app-state'],
      edges: [{ from: 'feature-ui', to: 'app-state', kind: 'solid' }],
      path: ['feature-ui', 'app-state'],
      sources: ['src/features/onboarding/OnboardingFlow.tsx', 'src/features/app/AppProvider.tsx'],
    },
    {
      title: 'Sample data',
      narration: 'The first database open seeds sample habits and tasks for preview.',
      nodes: ['app-state', 'repos', 'sqlite'],
      edges: [
        { from: 'app-state', to: 'repos', kind: 'solid' },
        { from: 'repos', to: 'sqlite', kind: 'solid' },
      ],
      path: ['app-state', 'repos', 'sqlite'],
      sources: ['src/database/client.ts'],
    },
  ],
  sources: [
    'src/app/index.tsx',
    'src/features/onboarding/OnboardingFlow.tsx',
    'src/database/client.ts',
  ],
};
