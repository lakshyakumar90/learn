/**
 * Scenario registry for <ScenarioPlayer>.
 *
 * A scenario is DATA, not a component: a program in the event-loop DSL
 * (or hand-built steps for non-event-loop visualizers), an optional
 * code pane, and the equivalent real JavaScript under `node` so
 * scripts/check-event-loop.ts can prove the simulation matches.
 */
import { simulateEventLoop, type Env, type ProgOp, type ScenarioStep } from '@/lib/event-loop';

export interface ScenarioNote {
  title?: string;
  narration?: string;
  why?: string;
}

export interface ScenarioData {
  id: string;
  title: string;
  description: string;
  env: Env;
  /** Code pane lines (1-based for step codeLine). */
  code?: string[];
  program: ProgOp[];
  /** Equivalent real JS, executed in Node by the build check. */
  node?: string;
  /** Step overrides by step index (validated by the check). */
  notes?: Record<number, ScenarioNote>;
  /**
   * Hand-built steps for visualizers that are not event-loop
   * simulations (stack overflow, hoisting, ...). When present,
   * `program` is still simulated for its output order if `node` set.
   */
  customSteps?: ScenarioStep[];
  /**
   * Override the four panel titles (default: Call stack / Tasks /
   * Microtasks / Console) so non-event-loop visualizers read well.
   */
  panelLabels?: [string, string, string, string];
}

export interface ResolvedScenario {
  data: ScenarioData;
  steps: ScenarioStep[];
  output: string[];
}

const registry = new Map<string, ScenarioData>();

export function registerScenario(data: ScenarioData): void {
  registry.set(data.id, data);
}

export function scenarioIds(): string[] {
  return [...registry.keys()];
}

export function getScenario(id: string): ResolvedScenario {
  const data = registry.get(id);
  if (!data) throw new Error(`Unknown scenario "${id}"`);
  const sim = simulateEventLoop(data.program, data.env);
  const steps = (data.customSteps ?? sim.steps).map((s, i) => ({
    ...s,
    ...(data.notes?.[i]?.title ? { title: data.notes[i].title! } : {}),
    ...(data.notes?.[i]?.narration ? { narration: data.notes[i].narration! } : {}),
    ...(data.notes?.[i]?.why ? { why: data.notes[i].why! } : {}),
  }));
  return { data, steps, output: sim.output };
}
