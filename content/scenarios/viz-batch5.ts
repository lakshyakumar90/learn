/**
 * Batch 5 visualizer: debounce timeline (custom steps).
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

const DEBOUNCE_CODE = [
  'onType("r");    // t = 0ms',
  'onType("re");   // t = 200ms',
  'onType("red");  // t = 400ms',
  '// quiet for 300ms…',
  'fetch("red");   // ONE request',
];

registerScenario({
  id: 'debounce-timeline',
  title: 'Debounce waits for quiet',
  description: 'Three keystrokes, one timer survivor, one request.',
  env: 'browser',
  code: DEBOUNCE_CODE,
  program: [{ op: 'log', text: 'typing starts (play the steps)', line: 1 }],
  panelLabels: ['Keystrokes', 'Timer', 'Fetches', 'Console'],
  customSteps: [
    step('Type "r" at 0ms', 'The handler records the query and starts a 300 ms timer. If nothing else happens, this timer fires the fetch.', {
      stack: ['r'], tasks: ['fetch("r") in 300ms'], codeLine: 1,
    }),
    step('Type "re" at 200ms', 'A new keystroke cancels the pending timer and starts a fresh one. The "r" fetch dies unborn.', {
      stack: ['r', 're'], tasks: ['fetch("re") in 300ms'], codeLine: 2,
      note: 'clearTimeout(timer) before every setTimeout — the two lines that define debounce.',
    }),
    step('Type "red" at 400ms', 'Same again: cancel, restart. Only the latest query ever has a live timer.', {
      stack: ['r', 're', 'red'], tasks: ['fetch("red") in 300ms'], codeLine: 3,
    }),
    step('Quiet for 300ms', 'No keystroke arrives. The surviving timer fires — exactly one request, for the final query.', {
      stack: ['r', 're', 'red'], tasks: [], micros: ['fetch("red")'], output: ['GET /suggest?q=red'], codeLine: 5,
    }),
    step('Reply renders', 'Suggestions for "red" arrive. Stale prefixes never flew, so nothing can arrive out of order.', {
      stack: [], tasks: [], micros: [], output: ['GET /suggest?q=red', '3 suggestions for "red"'], codeLine: 5,
      note: '3 keystrokes, 1 request, 0 races. Pair with AbortController (fetch page) when requests overlap anyway.',
    }),
  ],
});
