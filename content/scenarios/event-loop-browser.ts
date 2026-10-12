/**
 * Browser event-loop teaching scenarios. Every program has a `node`
 * equivalent: scripts/check-event-loop.ts runs both and fails the
 * build when the console order differs.
 */
import { registerScenario } from './types';

registerScenario({
  id: 'event-loop-sync-vs-timeout',
  title: 'Sync code vs setTimeout',
  description: 'A timer with 0 ms still waits for all synchronous code.',
  env: 'browser',
  code: [
    'console.log("Serve the customer in front of you");',
    'setTimeout(() => {',
    '  console.log("Call back the customer who left a number");',
    '}, 0);',
    'console.log("Serve the next customer");',
  ],
  program: [
    { op: 'log', text: 'Serve the customer in front of you', line: 1 },
    { op: 'timeout', delay: 0, label: 'callback', body: [{ op: 'log', text: 'Call back the customer who left a number', line: 3 }], line: 2 },
    { op: 'log', text: 'Serve the next customer', line: 5 },
  ],
  node: [
    'console.log("Serve the customer in front of you");',
    'setTimeout(() => {',
    '  console.log("Call back the customer who left a number");',
    '}, 0);',
    'console.log("Serve the next customer");',
  ].join('\n'),
});

registerScenario({
  id: 'event-loop-micro-vs-macro',
  title: 'Microtask vs macrotask',
  description: 'Promises jump ahead of every timer, no matter the delay.',
  env: 'browser',
  code: [
    'console.log("Take the order");',
    'setTimeout(() => console.log("Start the oven timer"), 0);',
    'Promise.resolve().then(() => console.log("Confirm the order on screen"));',
    'console.log("Hand over the receipt");',
  ],
  program: [
    { op: 'log', text: 'Take the order', line: 1 },
    { op: 'timeout', delay: 0, label: 'oven timer', body: [{ op: 'log', text: 'Start the oven timer', line: 2 }], line: 2 },
    { op: 'promise', label: 'confirm', body: [{ op: 'log', text: 'Confirm the order on screen', line: 3 }], line: 3 },
    { op: 'log', text: 'Hand over the receipt', line: 4 },
  ],
  node: [
    'console.log("Take the order");',
    'setTimeout(() => console.log("Start the oven timer"), 0);',
    'Promise.resolve().then(() => console.log("Confirm the order on screen"));',
    'console.log("Hand over the receipt");',
  ].join('\n'),
});

registerScenario({
  id: 'event-loop-async-await',
  title: 'async/await ordering',
  description: 'await pauses one function; everything else keeps moving.',
  env: 'browser',
  code: [
    'async function getWeather() {',
    '  const data = await Promise.resolve({ condition: "Light rain" });',
    '  console.log("Show the weather: Light rain");',
    '}',
    'console.log("Render the page shell");',
    'getWeather();',
    'console.log("Keep the page interactive");',
  ],
  program: [
    { op: 'log', text: 'Render the page shell', line: 5 },
    {
      op: 'invoke', fn: 'getWeather', line: 6,
      body: [
        { op: 'await', label: 'weather data', line: 2 },
        { op: 'log', text: 'Show the weather: Light rain', line: 3 },
      ],
    },
    { op: 'log', text: 'Keep the page interactive', line: 7 },
  ],
  node: [
    'async function getWeather() {',
    '  const data = await Promise.resolve({ condition: "Light rain" });',
    '  console.log("Show the weather: Light rain");',
    '}',
    'console.log("Render the page shell");',
    'getWeather();',
    'console.log("Keep the page interactive");',
  ].join('\n'),
});

registerScenario({
  id: 'event-loop-promise-chain',
  title: 'Promise chains run in order',
  description: 'Each .then waits for the previous link, like checkout steps.',
  env: 'browser',
  code: [
    'Promise.resolve()',
    '  .then(() => console.log("Validate the cart"))',
    '  .then(() => console.log("Charge the card"))',
    '  .then(() => console.log("Send the receipt"));',
    'console.log("Show a spinner");',
  ],
  program: [
    {
      op: 'promise', label: 'validate', line: 2,
      body: [
        { op: 'log', text: 'Validate the cart', line: 2 },
        {
          op: 'promise', label: 'charge', line: 3,
          body: [
            { op: 'log', text: 'Charge the card', line: 3 },
            {
              op: 'promise', label: 'receipt', line: 4,
              body: [{ op: 'log', text: 'Send the receipt', line: 4 }],
            },
          ],
        },
      ],
    },
    { op: 'log', text: 'Show a spinner', line: 5 },
  ],
  node: [
    'Promise.resolve()',
    '  .then(() => console.log("Validate the cart"))',
    '  .then(() => console.log("Charge the card"))',
    '  .then(() => console.log("Send the receipt"));',
    'console.log("Show a spinner");',
  ].join('\n'),
});

registerScenario({
  id: 'event-loop-long-task',
  title: 'A long task blocks everything',
  description: 'Synchronous work holds the thread: timers and paint wait.',
  env: 'browser',
  code: [
    'console.log("Button clicked");',
    '// filtering 10,000 photos takes about 3 seconds',
    'setTimeout(() => console.log("Update the progress bar"), 0);',
    'console.log("This line still waits for the filter");',
  ],
  program: [
    { op: 'log', text: 'Button clicked', line: 1 },
    { op: 'block', ms: 3000, label: 'filter 10,000 photos', line: 2 },
    { op: 'timeout', delay: 0, label: 'progress update', body: [{ op: 'log', text: 'Update the progress bar', line: 3 }], line: 3 },
    { op: 'log', text: 'This line still waits for the filter', line: 4 },
  ],
  // Busy-wait keeps the check fast; only the ORDER is compared.
  node: [
    'console.log("Button clicked");',
    'const end = Date.now() + 30;',
    'while (Date.now() < end) {}',
    'setTimeout(() => console.log("Update the progress bar"), 0);',
    'console.log("This line still waits for the filter");',
  ].join('\n'),
});
