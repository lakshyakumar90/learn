'use client';

import dynamic from 'next/dynamic';
import type { CodeRunnerProps } from '@/components/blocks/CodeRunner';
import type { PredictProps } from '@/components/blocks/Predict';
import type { ExerciseProps } from '@/components/blocks/Exercise';

export interface ScenarioPlayerProps {
  scenario: string;
  title?: string;
  codePreview?: string;
}

/**
 * Client-only, heavy tutorial blocks. Split into their own chunks so
 * the editor, worker, and animation code only downloads on pages that
 * render them — never on project docs or other topics.
 */
export const CodeRunner = dynamic(
  () => import('@/components/blocks/CodeRunner').then((m) => m.CodeRunner),
  {},
) as unknown as (props: CodeRunnerProps) => React.JSX.Element;

export const Predict = dynamic(
  () => import('@/components/blocks/Predict').then((m) => m.Predict),
  {},
) as unknown as (props: PredictProps) => React.JSX.Element;

export const Exercise = dynamic(
  () => import('@/components/blocks/Exercise').then((m) => m.Exercise),
  {},
) as unknown as (props: ExerciseProps) => React.JSX.Element;

export const ScenarioPlayer = dynamic(
  () => import('@/components/blocks/ScenarioPlayer').then((m) => m.ScenarioPlayer),
  {},
) as unknown as (props: ScenarioPlayerProps) => React.JSX.Element;

export const LiveDemo = dynamic(() => import('./LiveDemo').then(m => m.LiveDemo)) as (props: { demo: import('@/lib/live-demos').DemoId }) => React.JSX.Element;
