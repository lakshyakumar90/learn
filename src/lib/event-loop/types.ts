/**
 * Program DSL + trace types for the event-loop simulator.
 *
 * A program is a flat list of ops. `await` suspends the current task:
 * everything after it becomes ONE microtask continuation (modern
 * single-tick behavior for native promises — verified against real
 * Node by scripts/check-event-loop.ts).
 *
 * Teaching-model simplifications (documented on the pages, not hidden):
 * - Browser: task queue holds timers only; a render opportunity is
 *   emitted whenever the stack empties between tasks.
 * - Node: timers + check (setImmediate) phases only; poll / idle /
 *   prepare / close phases are omitted. `process.nextTick` drains
 *   before promises after every callback, like the real loop.
 * - setTimeout(fn, 0) vs setImmediate(fn) from the MAIN module is
 *   nondeterministic in real Node — never encode that race in a
 *   scenario (the simulator picks timers first; label pages say so).
 */

export type Env = 'browser' | 'node';

/** Alias for scenario authors who prefer the longer name. */
export type ProgramOp = ProgOp;

export type ProgOp =
  | { op: 'log'; text: string; line?: number }
  | { op: 'invoke'; fn: string; body: ProgOp[]; line?: number }
  | { op: 'await'; label?: string; line?: number }
  | { op: 'timeout'; delay: number; label: string; body: ProgOp[]; line?: number }
  | { op: 'promise'; label: string; body: ProgOp[]; line?: number }
  | { op: 'nextTick'; label: string; body: ProgOp[]; line?: number }
  | { op: 'immediate'; label: string; body: ProgOp[]; line?: number }
  | { op: 'block'; ms: number; label: string; line?: number };

export type TraceKind =
  | 'call'
  | 'return'
  | 'log'
  | 'schedule-timer'
  | 'schedule-micro'
  | 'schedule-nexttick'
  | 'schedule-immediate'
  | 'run-timer'
  | 'run-immediate'
  | 'run-micro'
  | 'run-nexttick'
  | 'await-suspend'
  | 'await-resume'
  | 'render'
  | 'block-note'
  | 'phase';

export interface TraceEvent {
  kind: TraceKind;
  /** Human label: function name, timer/microtask label, or text. */
  label: string;
  stack: string[];
  /** Pending timer labels (+immediates for Node, marked). */
  tasks: string[];
  /** Pending microtask labels (nextTick entries marked). */
  micros: string[];
  /** Console output so far. */
  output: string[];
  codeLine?: number;
  note?: string;
}

/** One ScenarioPlayer step derived from a trace event. */
export interface ScenarioStep {
  title: string;
  narration: string;
  why?: string;
  stack: string[];
  tasks: string[];
  micros: string[];
  output: string[];
  codeLine?: number;
  note?: string;
  /** True for render/block/phase markers (styled differently). */
  marker?: boolean;
}

export interface Simulation {
  output: string[];
  steps: ScenarioStep[];
}
