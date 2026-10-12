/**
 * Batch 4 visualizers: Node loop phases (simulated + Node-verified),
 * event propagation (custom steps).
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

const NODE_CODE = [
  'console.log("Start");',
  'setTimeout(() => {',
  '  console.log("T");',
  '  process.nextTick(() => console.log("N"));',
  '  Promise.resolve().then(() => console.log("P"));',
  '  setImmediate(() => console.log("I"));',
  '}, 0);',
  'process.nextTick(() => console.log("M"));',
  'Promise.resolve().then(() => console.log("Q"));',
  'console.log("End");',
];

registerScenario({
  id: 'node-phases',
  title: 'Node phases in order',
  description: 'nextTick, then promises, then timers, then check.',
  env: 'node',
  code: NODE_CODE,
  program: [
    { op: 'log', text: 'Start', line: 1 },
    {
      op: 'timeout', delay: 0, label: 'T', line: 2,
      body: [
        { op: 'log', text: 'T', line: 3 },
        { op: 'nextTick', label: 'N', body: [{ op: 'log', text: 'N', line: 4 }], line: 4 },
        { op: 'promise', label: 'P', body: [{ op: 'log', text: 'P', line: 5 }], line: 5 },
        { op: 'immediate', label: 'I', body: [{ op: 'log', text: 'I', line: 6 }], line: 6 },
      ],
    },
    { op: 'nextTick', label: 'M', body: [{ op: 'log', text: 'M', line: 8 }], line: 8 },
    { op: 'promise', label: 'Q', body: [{ op: 'log', text: 'Q', line: 9 }], line: 9 },
    { op: 'log', text: 'End', line: 10 },
  ],
  node: NODE_CODE.join('\n'),
});

const PROP_CODE = [
  '<main id="page">',
  '  <section id="card">',
  '    <button id="buy">Buy</button>',
  '  </section>',
  '</main>',
];

registerScenario({
  id: 'event-propagation',
  title: 'Capture down, bubble up',
  description: 'One click travels the whole tree twice (plus the target).',
  env: 'browser',
  code: PROP_CODE,
  program: [{ op: 'log', text: 'buy clicked (play the steps)', line: 3 }],
  panelLabels: ['Capture path', 'Target', 'Bubble path', 'Console'],
  customSteps: [
    step('Click on Buy', 'The click is born at the button — but listeners on ancestors get their turn too, in two passes.', {
      stack: ['window', 'document', 'page', 'card'], tasks: ['buy (target)'], codeLine: 3,
    }),
    step('Capture: window to card', 'Capture listeners fire top-down: window, document, page, card. Rarely used — except for intercepting (closing menus, global shortcuts).', {
      stack: ['window ✓', 'document ✓', 'page ✓', 'card ✓'], tasks: ['buy (target)'], codeLine: 1,
      note: 'Capture listeners opt in with { capture: true }.',
    }),
    step('Target: buy itself', 'Listeners on the button fire in registration order — capture and bubble listeners alike.', {
      stack: [], tasks: [], micros: ['buy handlers'], output: ['buy: handler 1', 'buy: handler 2'], codeLine: 3,
    }),
    step('Bubble: card to window', 'Bubble listeners fire bottom-up: card, page, document, window. This is the everyday phase — delegation listens here.', {
      stack: [], tasks: [], micros: ['card ✓', 'page ✓', 'document', 'window'], output: ['buy: handler 1', 'buy: handler 2', 'card: delegated'], codeLine: 2,
      note: 'stopPropagation() ends the trip early; almost every app-level listener is a bubble listener.',
    }),
  ],
});
