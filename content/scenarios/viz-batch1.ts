/**
 * Hand-built visualizers for Batch 1 (not event-loop simulations):
 * call-stack overflow, hoisting/creation phase, mark-and-sweep.
 */
import { registerScenario } from './types';
import type { ScenarioStep } from '@/lib/event-loop';

function step(
  title: string,
  narration: string,
  parts: Partial<ScenarioStep> & { codeLine?: number },
): ScenarioStep {
  return {
    title,
    narration,
    stack: [],
    tasks: [],
    micros: [],
    output: [],
    ...parts,
  };
}

const LOGIN_CODE = [
  'function sendOtp() {',
  '  return sendOtp(); // oops: calls itself, no exit',
  '}',
  'function login() {',
  '  sendOtp();',
  '}',
  'login();',
];

registerScenario({
  id: 'call-stack-overflow',
  title: 'The call stack overflows',
  description: 'A login retry that calls itself forever runs out of stack.',
  env: 'browser',
  code: LOGIN_CODE,
  program: [{ op: 'log', text: 'login starts (see the player — the real error is below)', line: 7 }],
  panelLabels: ['Call stack', 'Frames used', 'Limit', 'Console'],
  customSteps: [
    step('login() is called', 'The login button calls login(). A frame for login goes on the stack.', { stack: ['login'], tasks: ['1 of ~10,000'], codeLine: 7 }),
    step('login calls sendOtp', 'login calls sendOtp(). A second frame piles on top.', { stack: ['login', 'sendOtp'], tasks: ['2 of ~10,000'], codeLine: 5 }),
    step('sendOtp calls itself', 'Look at line 2: sendOtp calls sendOtp with no exit condition. A third frame piles on.', { stack: ['login', 'sendOtp', 'sendOtp'], tasks: ['3 of ~10,000'], codeLine: 2 }),
    step('...hundreds of frames later', 'Each call waits for the next one to return — but none ever returns. The stack keeps growing.', { stack: ['login', 'sendOtp', '…', 'sendOtp'], tasks: ['~9,998 of ~10,000'], codeLine: 2 }),
    step('Stack overflow', 'The engine gives up: "RangeError: Maximum call stack size exceeded". The fix is an exit condition — retry at most 3 times, then show an error.', {
      stack: [],
      tasks: ['limit hit'],
      micros: ['engine limit (~10k frames, varies)'],
      output: ['RangeError: Maximum call stack size exceeded'],
      codeLine: 2,
      note: 'Every engine caps the stack; the exact number varies. Browsers and Node both throw RangeError.',
    }),
  ],
});

const HOIST_CODE = [
  'console.log("Signed in as", userName); // undefined, not an error',
  'console.log("Total:", total());        // works!',
  'console.log("Plan:", plan);            // ReferenceError',
  '',
  'var userName = "Meera";',
  'function total() { return 2 + 2; }',
  'let plan = "yearly";',
];

registerScenario({
  id: 'hoisting-creation-phase',
  title: 'Hoisting and the creation phase',
  description: 'JavaScript reads declarations before running a single line.',
  env: 'browser',
  code: HOIST_CODE,
  program: [{ op: 'log', text: 'creation phase first (play the steps)', line: 1 }],
  panelLabels: ['Execution context', 'Memory after creation', 'Scope', 'Console'],
  customSteps: [
    step('Before line 1 runs', 'JavaScript scans the whole scope first — this scan is the creation phase. Nothing has executed yet.', { stack: ['global (creation)'], codeLine: 1 }),
    step('Memory is set up', 'var names are set to undefined. Whole function declarations are stored ready to call. let and const are reserved but locked — touching them throws.', {
      stack: ['global (creation)'],
      tasks: ['var userName → undefined', 'function total → ready', 'let plan → locked (TDZ)'],
      micros: ['global scope'],
      codeLine: 1,
    }),
    step('Line 1 prints undefined', 'Execution begins. userName exists in memory (value undefined), so this prints instead of throwing.', {
      stack: ['global (running)'],
      tasks: ['var userName → undefined', 'function total → ready', 'let plan → locked (TDZ)'],
      micros: ['global scope'],
      output: ['Signed in as undefined'],
      codeLine: 1,
    }),
    step('Line 2 works', 'total was stored whole during creation, so calling it before its line is fine.', {
      stack: ['global (running)'],
      tasks: ['var userName → undefined', 'function total → ready', 'let plan → locked (TDZ)'],
      micros: ['global scope'],
      output: ['Signed in as undefined', 'Total: 4'],
      codeLine: 2,
    }),
    step('Line 3 throws', 'plan is reserved but locked in the temporal dead zone until line 7 runs. Reading it throws ReferenceError — the safety net that catches use-before-declare bugs.', {
      stack: [],
      tasks: ['var userName → undefined', 'function total → ready', 'let plan → locked (TDZ)'],
      micros: ['global scope'],
      output: ['Signed in as undefined', 'Total: 4', 'ReferenceError: Cannot access plan before initialization'],
      codeLine: 3,
      note: 'TDZ = temporal dead zone: the lines between the scope start and the let/const declaration.',
    }),
  ],
});

const GC_CODE = [
  'let cart = { items: ["book"] };      // reachable: cart points at it',
  'let oldListener = () => save(cart);  // reachable while subscribed',
  'unsubscribe(oldListener);            // now nothing points at it',
  'cart = null;                         // now nothing points at the cart',
  '// garbage collector runs…',
];

registerScenario({
  id: 'gc-mark-and-sweep',
  title: 'Mark-and-sweep reachability',
  description: 'The collector frees whatever the program can no longer reach.',
  env: 'browser',
  code: GC_CODE,
  program: [{ op: 'log', text: 'collector runs (play the steps)', line: 5 }],
  panelLabels: ['Roots', 'Heap objects', 'Marked (alive)', 'Collected'],
  customSteps: [
    step('Everything is reachable', 'cart points at the cart object; the subscribed listener points at the handler. Roots are variables the program can still touch.', {
      stack: ['cart', 'oldListener'],
      tasks: ['{ items: ["book"] } ← cart', 'handler ← oldListener'],
      codeLine: 2,
    }),
    step('The listener is dropped', 'After unsubscribe, nothing points at the handler anymore — but its memory is still occupied. The collector has not run yet.', {
      stack: ['cart'],
      tasks: ['{ items: ["book"] } ← cart', 'handler ← nobody'],
      codeLine: 3,
      note: 'Unreachable does not mean freed — only the next collection frees it.',
    }),
    step('The cart is dropped', 'cart = null removes the last reference to the cart object too.', {
      stack: [],
      tasks: ['{ items: ["book"] } ← nobody', 'handler ← nobody'],
      codeLine: 4,
    }),
    step('Mark: follow the roots', 'The collector starts from the roots and marks every object it can reach. Neither leftover is reachable, so nothing gets marked.', {
      stack: [],
      tasks: ['{ items: ["book"] } ← nobody', 'handler ← nobody'],
      micros: ['(nothing marked)'],
      codeLine: 5,
    }),
    step('Sweep: free the rest', 'Unmarked memory is reclaimed. A detached DOM node or a forgotten timer would survive this step — that is what a leak looks like.', {
      stack: [],
      tasks: [],
      micros: [],
      output: ['freed: cart object', 'freed: old listener'],
      codeLine: 5,
      note: 'If the listener were still subscribed, it would stay marked — and keep the whole cart alive with it.',
    }),
  ],
});
