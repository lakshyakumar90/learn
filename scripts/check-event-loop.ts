/**
 * Prove the event-loop simulator matches reality, and unit-test it.
 *
 * 1. For every registered scenario with a `node` equivalent: run the
 *    simulator, run the real code in Node with a timeout, and FAIL
 *    when the console output ORDER differs.
 * 2. Unit tests for simulator semantics (timer order, nextTick vs
 *    promise, await single-tick, block advancing the clock, error
 *    cases) plus the worker line-offset and value-serializer checks.
 *
 * Usage: pnpm check-event-loop (runs in `prebuild`).
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getScenario, scenarioIds } from '../content/scenarios';
import { simulateEventLoop } from '../src/lib/event-loop';
import {
  buildWorkerSource,
  formatTable,
  formatValue,
  stackLineToSnippet,
  workerHeaderLineCount,
} from '../src/lib/run-console';

const failures: string[] = [];

function runRealNode(source: string): string[] {
  // CommonJS file (not --input-type=module -e): ESM top-level evaluation
  // runs inside the loader's microtask machinery, which observably lets
  // promise jobs overtake nextTick jobs scheduled from the main module.
  // CJS main-module semantics (nextTick before promises) are the
  // documented, stable reference the simulator models.
  const dir = mkdtempSync(join(tmpdir(), 'check-event-loop-'));
  const file = join(dir, 'scenario.cjs');
  writeFileSync(file, source, 'utf8');
  const out = execFileSync('node', [file], { timeout: 8000, encoding: 'utf8' });
  return out.split('\n').map((l) => l.replace(/\r$/, '')).filter((l, i, a) => !(i === a.length - 1 && l === ''));
}

function check(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ok: ${name}`);
  } catch (e) {
    failures.push(`${name}: ${(e as Error).message}`);
  }
}

function main(): void {
  console.log('check-event-loop: scenario cross-checks (simulator vs real Node)');
  for (const id of scenarioIds()) {
    const { data, output } = getScenario(id);
    if (!data.node) {
      console.log(`  skip (no node equivalent): ${id}`);
      continue;
    }
    try {
      const real = runRealNode(data.node);
      try {
        assert.deepEqual(output, real);
        console.log(`  ok: ${id} (${output.length} line(s))`);
      } catch {
        failures.push(
          `${id}: simulator output differs from Node.\n    sim:  ${JSON.stringify(output)}\n    node: ${JSON.stringify(real)}`,
        );
      }
    } catch (e) {
      failures.push(`${id}: could not run node equivalent: ${(e as Error).message}`);
    }
  }

  console.log('check-event-loop: simulator unit tests');
  check('timers fire by delay, ties by insertion order', () => {
    const { output } = simulateEventLoop(
      [
        { op: 'timeout', delay: 20, label: 'slow', body: [{ op: 'log', text: 'slow' }] },
        { op: 'timeout', delay: 5, label: 'fast', body: [{ op: 'log', text: 'fast' }] },
        { op: 'timeout', delay: 5, label: 'fast2', body: [{ op: 'log', text: 'fast2' }] },
      ],
      'browser',
    );
    assert.deepEqual(output, ['fast', 'fast2', 'slow']);
  });

  check('nextTick runs before promises in Node, and only in Node', () => {
    const { output } = simulateEventLoop(
      [
        { op: 'promise', label: 'p', body: [{ op: 'log', text: 'promise' }] },
        { op: 'nextTick', label: 'n', body: [{ op: 'log', text: 'nextTick' }] },
      ],
      'node',
    );
    assert.deepEqual(output, ['nextTick', 'promise']);
    assert.throws(() => simulateEventLoop([{ op: 'nextTick', label: 'n', body: [] }], 'browser'), /only exists in Node/);
    assert.throws(() => simulateEventLoop([{ op: 'immediate', label: 'i', body: [] }], 'browser'), /only exists in Node/);
  });

  check('await continuations take a single microtask tick', () => {
    const { output } = simulateEventLoop(
      [
        { op: 'promise', label: 'p', body: [{ op: 'log', text: 'promise' }] },
        { op: 'await', label: 'w' },
        { op: 'log', text: 'after-await' },
      ],
      'browser',
    );
    assert.deepEqual(output, ['promise', 'after-await']);
  });

  check('immediate scheduled from a timer runs before the next timer', () => {
    const { output } = simulateEventLoop(
      [
        {
          op: 'timeout', delay: 0, label: 'a',
          body: [
            { op: 'log', text: 'A' },
            { op: 'immediate', label: 'i', body: [{ op: 'log', text: 'I' }] },
            { op: 'timeout', delay: 0, label: 'b', body: [{ op: 'log', text: 'B' }] },
          ],
        },
      ],
      'node',
    );
    assert.deepEqual(output, ['A', 'I', 'B']);
  });

  check('a blocking task delays already-due timers', () => {
    const { output, steps } = simulateEventLoop(
      [
        { op: 'timeout', delay: 0, label: 't', body: [{ op: 'log', text: 'timer' }] },
        { op: 'block', ms: 100, label: 'work' },
        { op: 'log', text: 'after' },
      ],
      'browser',
    );
    assert.deepEqual(output, ['after', 'timer']);
    assert.ok(steps.some((s) => s.marker), 'expected a marker step for the block');
  });

  check('worker error lines map back onto snippet lines', () => {
    const { source, userStartLine } = buildWorkerSource('line one\nthrow new Error("x")');
    const lines = source.split('\n');
    assert.equal(lines[userStartLine - 1], 'line one');
    assert.equal(userStartLine, workerHeaderLineCount() + 1);
    assert.equal(stackLineToSnippet('Error: x\n    at <anonymous>:11:7', 10), 2);
  });

  check('value serializer covers objects, Maps, Sets, errors, circular refs', () => {
    const circular: Record<string, unknown> = { a: 1 };
    circular.self = circular;
    assert.equal(formatValue(undefined), 'undefined');
    assert.equal(formatValue(BigInt(10)), '10n');
    assert.equal(formatValue(Symbol('s')), 'Symbol(s)');
    assert.equal(formatValue(new Map([['k', 1]])), 'Map(1) { k => 1 }');
    assert.equal(formatValue(new Set([1, 2])), 'Set(2) { 1, 2 }');
    assert.equal(formatValue(new TypeError('bad')), 'TypeError: bad');
    assert.ok(formatValue(circular).includes('Circular'));
    assert.ok(formatTable([{ a: 1, b: 2 }]).includes('(index)'));
  });

  if (failures.length > 0) {
    for (const f of failures) console.error(`\nFAIL ${f}`);
    console.error(`\ncheck-event-loop: ${failures.length} failure(s).`);
    process.exit(1);
  }
  console.log('check-event-loop: OK.');
}

main();
