/**
 * Batch 3 visualizers: closure scope chain, prototype lookup.
 */
import { registerScenario } from './types';
import type { ScenarioStep } from '@/lib/event-loop';

function step(
  title: string,
  narration: string,
  parts: Partial<ScenarioStep> & { codeLine?: number },
): ScenarioStep {
  return { title, narration, stack: [], tasks: [], micros: [], output: [], ...parts };
}

const CLOSURE_CODE = [
  'function makeCounter() {',
  "  let count = 0;             // lives in the makeCounter environment",
  '  return () => ++count;      // carries that environment along',
  '}',
  'const next = makeCounter();  // count is 0, held by next alone',
  'next(); // 1',
  'next(); // 2',
];

registerScenario({
  id: 'closure-counter',
  title: 'A closure keeps its variables',
  description: 'The returned function carries its birth environment.',
  env: 'browser',
  code: CLOSURE_CODE,
  program: [{ op: 'log', text: 'counter runs (play the steps)', line: 5 }],
  panelLabels: ['Calls', 'Closed-over', 'Global', 'Console'],
  customSteps: [
    step('makeCounter is called', 'Its environment opens with count at 0. The inner arrow function is created right here — inside this environment.', {
      stack: ['makeCounter'], tasks: ['count: 0'], micros: ['makeCounter scope'], codeLine: 1,
    }),
    step('The inner function escapes', 'makeCounter returns and its frame pops — but the arrow keeps a pointer to the birth environment. next now owns the only path to count.', {
      stack: [], tasks: ['count: 0 (held by next)'], micros: ['global: next'], codeLine: 5,
    }),
    step('First call: 1', 'next runs with its carried environment. count was 0, becomes 1. Nothing else in the program can touch count.', {
      stack: ['counter fn'], tasks: ['count: 1'], micros: ['global: next'], output: ['1'], codeLine: 6,
    }),
    step('Second call: 2', 'Same environment, kept alive between calls. That persistence — private state without objects — is the closure.', {
      stack: ['counter fn'], tasks: ['count: 2'], micros: ['global: next'], output: ['1', '2'], codeLine: 7,
      note: 'A second makeCounter() would open a second, independent count. Closures never share.',
    }),
  ],
});

const PROTO_CODE = [
  'const animal = { legs: 4 };',
  'const dog = Object.create(animal);',
  'dog.sound = "woof";',
  'dog.sound;  // own: "woof"',
  'dog.legs;   // inherited: 4',
  'dog.tail;   // nowhere: undefined',
];

registerScenario({
  id: 'prototype-lookup',
  title: 'Prototype lookup walks the chain',
  description: 'Own first, then up the chain, then undefined.',
  env: 'browser',
  code: PROTO_CODE,
  program: [{ op: 'log', text: 'lookup runs (play the steps)', line: 4 }],
  panelLabels: ['Reading', 'Chain searched', 'Result', 'Console'],
  customSteps: [
    step('dog.sound: found at home', 'Own properties win immediately — the chain is never consulted.', {
      stack: ['dog.sound'], tasks: ['dog (own)'], micros: ['"woof"'], output: ['woof'], codeLine: 4,
    }),
    step('dog.legs: one step up', 'dog has no legs, so lookup follows the prototype link to animal — where legs lives.', {
      stack: ['dog.legs'], tasks: ['dog (miss) → animal (hit)'], micros: ['4'], output: ['woof', '4'], codeLine: 5,
    }),
    step('dog.tail: nowhere', 'Neither dog, animal, nor Object.prototype has tail. Lookup ends with undefined — never an error.', {
      stack: ['dog.tail'], tasks: ['dog → animal → Object (miss)'], micros: ['undefined'], output: ['woof', '4', 'undefined'], codeLine: 6,
      note: 'Method calls work the same way: dog.describe() finds the function up-chain, then runs it with dog as this.',
    }),
  ],
});
