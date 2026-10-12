/**
 * Deterministic event-loop simulator for teaching scenarios.
 *
 * `simulateEventLoop(program, env)` runs a program and returns the
 * console output order plus ScenarioPlayer steps. Every scenario with
 * a `node` equivalent is executed in real Node by
 * scripts/check-event-loop.ts and the output orders must match, or the
 * build fails — so model bugs surface immediately.
 */
import type { Env, ProgOp, ScenarioStep, Simulation, TraceKind } from './types';

interface Job {
  label: string;
  body: ProgOp[];
  codeLine?: number;
  /** True for continuations created by `await` (resume the async frame). */
  cont?: boolean;
}

interface Timer extends Job {
  due: number;
  seq: number;
}

export function simulateEventLoop(program: ProgOp[], env: Env): Simulation {
  const output: string[] = [];
  const steps: ScenarioStep[] = [];
  let now = 0;
  let seq = 0;
  const timers: Timer[] = [];
  const micros: Job[] = [];
  const nextTicks: Job[] = [];
  const immediates: Job[] = [];

  function emit(
    kind: TraceKind,
    label: string,
    stack: string[],
    opts: { codeLine?: number; note?: string } = {},
  ): void {
    steps.push({
      title: titleFor(kind, label),
      narration: narrationFor(kind, label, opts),
      why: whyFor(kind),
      stack: [...stack],
      tasks: [
        ...timers.map((t) => `${t.label} (${t.due}ms)`),
        ...immediates.map((j) => `${j.label} (check)`),
      ],
      micros: [
        ...nextTicks.map((j) => `${j.label} (nextTick)`),
        ...micros.map((j) => j.label),
      ],
      output: [...output],
      ...(opts.codeLine !== undefined ? { codeLine: opts.codeLine } : {}),
      ...(opts.note !== undefined ? { note: opts.note } : {}),
      marker: kind === 'render' || kind === 'block-note' || kind === 'phase',
    });
  }

  function whyFor(kind: TraceKind): string {
    const reasons: Record<TraceKind, string> = {
      call: 'Calling the function creates a frame for its parameters and local work.',
      return: 'Completed work releases this stack frame so its caller can continue.',
      log: 'The current operation executes synchronously and appends this value.',
      'schedule-timer': 'The host tracks the delay while the current task continues.',
      'schedule-micro': 'The reaction must wait until the current JavaScript stack finishes.',
      'schedule-nexttick': 'This Node teaching trace drains nextTick at callback boundaries before promise reactions.',
      'schedule-immediate': 'Node schedules this callback for its check phase.',
      'run-timer': 'The timer is eligible and the stack is free in this simulated turn.',
      'run-immediate': 'The simulated loop has reached the check phase.',
      'run-micro': 'Microtasks are processed at the checkpoint before a later timer task.',
      'run-nexttick': 'The Node callback boundary gives its nextTick queue priority in this trace.',
      'await-suspend': 'The continuation waits on promise completion rather than blocking this stack.',
      'await-resume': 'Promise completion makes this continuation eligible at the microtask checkpoint.',
      render: 'This is an opportunity to render, not a guarantee that pixels are painted.',
      'block-note': 'A running synchronous task cannot be interrupted by another callback on this thread.',
      phase: 'The model has completed the preceding queue and advances its phase.',
    };
    return reasons[kind];
  }

  function titleFor(kind: TraceKind, label: string): string {
    switch (kind) {
      case 'call': return `Call ${label}`;
      case 'return': return `${label} returns`;
      case 'log': return `Print "${label}"`;
      case 'schedule-timer': return `Timer set: ${label}`;
      case 'schedule-micro': return `Promise queued: ${label}`;
      case 'schedule-nexttick': return `nextTick queued: ${label}`;
      case 'schedule-immediate': return `Immediate set: ${label}`;
      case 'run-timer': return `Timer fires: ${label}`;
      case 'run-immediate': return `Immediate runs: ${label}`;
      case 'run-micro': return `Microtask runs: ${label}`;
      case 'run-nexttick': return `nextTick runs: ${label}`;
      case 'await-suspend': return `Pause at await${label ? ` (${label})` : ''}`;
      case 'await-resume': return `Resume after await${label ? ` (${label})` : ''}`;
      case 'render': return 'Render opportunity';
      case 'block-note': return `Long task: ${label}`;
      case 'phase': return `Node phase: ${label}`;
    }
  }

  function narrationFor(kind: TraceKind, label: string, opts: { note?: string }): string {
    switch (kind) {
      case 'call': return `${label} is called — a new frame goes on top of the call stack.`;
      case 'return': return `${label} finishes — its frame pops off the stack.`;
      case 'log': return `console.log prints "${label}".`;
      case 'schedule-timer': return `setTimeout hands "${label}" to the timer system and keeps running — it never blocks.`;
      case 'schedule-micro': return `"${label}" waits in the microtask queue, until the current stack finishes.`;
      case 'schedule-nexttick': return `"${label}" waits in the nextTick queue — this trace drains them before promise reactions at callback boundaries.`;
      case 'schedule-immediate': return `"${label}" waits for Node's check phase, when the check phase is reached.`;
      case 'run-timer': return `"${label}" is due — it becomes a task and runs to completion.`;
      case 'run-immediate': return `The check phase runs "${label}".`;
      case 'run-micro': return `The stack is empty, so the microtask "${label}" runs before the next timer.`;
      case 'run-nexttick': return `The stack is empty, so nextTick "${label}" runs first.`;
      case 'await-suspend': return 'await pauses this function — the stack unwinds and the rest waits as one microtask.';
      case 'await-resume': return 'The awaited value is ready — the function resumes where it paused.';
      case 'render': return 'The stack and microtasks are empty, so the browser may paint before the next task.';
      case 'block-note': return `This synchronous work takes ${opts.note ?? 'a while'} — no timer, promise, or paint can run until it returns.`;
      case 'phase': return `Node enters the ${label} phase.`;
    }
  }

  /** Run an op list with `stack` as the current frames. Stops at `await`. */
  function runList(list: ProgOp[], stack: string[]): void {
    for (let i = 0; i < list.length; i++) {
      const op = list[i];
      switch (op.op) {
        case 'log':
          output.push(op.text);
          emit('log', op.text, stack, { codeLine: op.line });
          break;
        case 'invoke': {
          const next = [...stack, op.fn];
          emit('call', op.fn, next, { codeLine: op.line });
          runList(op.body, next);
          emit('return', op.fn, stack, { codeLine: op.line });
          break;
        }
        case 'await': {
          emit('await-suspend', op.label ?? '', stack, { codeLine: op.line });
          micros.push({ label: op.label ?? 'continuation', body: list.slice(i + 1), codeLine: op.line, cont: true });
          return;
        }
        case 'timeout': {
          const due = now + op.delay;
          timers.push({ label: op.label, body: op.body, codeLine: op.line, due, seq: seq++ });
          emit('schedule-timer', `${op.label} (${op.delay}ms)`, stack, { codeLine: op.line });
          break;
        }
        case 'promise':
          micros.push({ label: op.label, body: op.body, codeLine: op.line });
          emit('schedule-micro', op.label, stack, { codeLine: op.line });
          break;
        case 'nextTick':
          if (env !== 'node') throw new Error('process.nextTick only exists in Node scenarios');
          nextTicks.push({ label: op.label, body: op.body, codeLine: op.line });
          emit('schedule-nexttick', op.label, stack, { codeLine: op.line });
          break;
        case 'immediate':
          if (env !== 'node') throw new Error('setImmediate only exists in Node scenarios');
          immediates.push({ label: op.label, body: op.body, codeLine: op.line });
          emit('schedule-immediate', op.label, stack, { codeLine: op.line });
          break;
        case 'block':
          emit('block-note', op.label, stack, { codeLine: op.line, note: `${op.ms} ms` });
          now += op.ms;
          break;
      }
    }
  }

  function runJobMicro(job: Job): void {
    if (job.cont) {
      const stack = [`async: ${job.label}`];
      emit('await-resume', job.label, stack, { codeLine: job.codeLine });
      runList(job.body, stack);
      return;
    }
    const stack = [`then: ${job.label}`];
    emit('run-micro', job.label, stack, { codeLine: job.codeLine });
    runList(job.body, stack);
  }

  function drainMicro(): void {
    if (env === 'node') {
      // After every callback, Node drains nextTick fully, then promises.
      while (nextTicks.length > 0 || micros.length > 0) {
        while (nextTicks.length > 0) {
          const job = nextTicks.shift()!;
          const stack = [`nextTick: ${job.label}`];
          emit('run-nexttick', job.label, stack, { codeLine: job.codeLine });
          runList(job.body, stack);
        }
        if (micros.length > 0) runJobMicro(micros.shift()!);
      }
      return;
    }
    while (micros.length > 0) runJobMicro(micros.shift()!);
  }

  // --- main script --------------------------------------------------
  runList(program, ['script']);

  // --- loop ----------------------------------------------------------
  if (env === 'browser') {
    drainMicro();
    while (timers.length > 0) {
      emit('render', '', [], {});
      timers.sort((a, b) => a.due - b.due || a.seq - b.seq);
      const timer = timers.shift()!;
      now = Math.max(now, timer.due);
      const stack = [`timer: ${timer.label}`];
      emit('run-timer', timer.label, stack, { codeLine: timer.codeLine });
      runList(timer.body, stack);
      drainMicro();
    }
    return { output, steps };
  }

  // Node: timers phase, then check phase, repeat (poll/idle omitted —
  // the taught cases behave identically; pages say so).
  while (timers.length > 0 || immediates.length > 0 || micros.length > 0 || nextTicks.length > 0) {
    drainMicro();
    if (timers.length > 0) {
      emit('phase', 'timers', [], {});
      timers.sort((a, b) => a.due - b.due || a.seq - b.seq);
      now = Math.max(now, timers[0].due);
      const due = timers.filter((t) => t.due <= now);
      for (const t of due) timers.splice(timers.indexOf(t), 1);
      for (const timer of due) {
        const stack = [`timer: ${timer.label}`];
        emit('run-timer', timer.label, stack, { codeLine: timer.codeLine });
        runList(timer.body, stack);
        drainMicro();
      }
    }
    if (immediates.length > 0) {
      emit('phase', 'check', [], {});
      for (const job of immediates.splice(0)) {
        const stack = [`immediate: ${job.label}`];
        emit('run-immediate', job.label, stack, { codeLine: job.codeLine });
        runList(job.body, stack);
        drainMicro();
      }
    }
    if (timers.length === 0 && immediates.length === 0) drainMicro();
  }
  return { output, steps };
}
