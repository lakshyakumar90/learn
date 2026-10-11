import type { DiagramSpec } from './types';

export const habitlyFeaturesOnboardingSpec: DiagramSpec = {
  id: 'habitly-features-onboarding',
  project: 'habitly',
  title: 'Onboarding feature',
  nodes: [
    { id: 'welcome', label: 'Welcome art', layer: 'features' },
    { id: 'flow', label: 'Flow steps', layer: 'features' },
    { id: 'chrome', label: 'Step chrome', layer: 'features' },
    { id: 'theme', label: 'Step theme', layer: 'features' },
    { id: 'types', label: 'Answer types', layer: 'features' },
    { id: 'prefs', label: 'Preferences', layer: 'localdata', external: true },
  ],
  edges: [
    { from: 'flow', to: 'welcome', kind: 'solid', label: 'starts' },
    { from: 'flow', to: 'chrome', kind: 'solid', label: 'frames' },
    { from: 'flow', to: 'theme', kind: 'solid', label: 'styles' },
    { from: 'flow', to: 'types', kind: 'solid', label: 'collects' },
    { from: 'flow', to: 'prefs', kind: 'solid', label: 'saves' },
  ],
  sources: [
    'src/features/onboarding/WelcomeScreen.tsx',
    'src/features/onboarding/OnboardingFlow.tsx',
    'src/features/onboarding/OnboardingChrome.tsx',
    'src/features/onboarding/theme.ts',
    'src/features/onboarding/types.ts',
  ],
};
