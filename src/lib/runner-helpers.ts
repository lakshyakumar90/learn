/**
 * Shared code-runner helpers for the Topics section.
 *
 * This module is deliberately self-contained (no imports, no DOM, no
 * Node APIs) so the EXACT same functions run in three places:
 * - the browser Web Worker (shipped via `fn.toString()`),
 * - the browser DOM iframe (same trick),
 * - the Node build check (imported directly).
 *
 * Determinism rules (relied on by scripts/check-js-examples.ts):
 * - `sleep(ms)` waits with setTimeout.
 * - `fakeFetch` never touches the network. Latency is simulated with
 *   `sleep`, so output ORDER is deterministic; only wall-clock time
 *   varies. Tests must assert order/content, never durations.
 * - The `flaky` endpoint fails its first two calls in each fresh run
 *   (worker / page load / check process) and succeeds after that, so
 *   retry examples behave the same everywhere.
 */

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface FakeResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export interface FakeFetchOptions {
  method?: string;
  /** Force a failure regardless of endpoint (to demo catch blocks). */
  fail?: boolean;
  /** Override the simulated latency. Defaults per endpoint below. */
  latencyMs?: number;
  /**
   * Minimal AbortSignal shape (avoids DOM lib coupling). When aborted
   * before the latency elapses, the request rejects with an abort
   * error — the same contract in workers, iframes, and Node.
   */
  signal?: { aborted: boolean; addEventListener: (type: string, fn: () => void, opts?: boolean | { once?: boolean }) => void; removeEventListener?: (type: string, fn: () => void) => void };
}

const USERS = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav@example.com' },
  { id: 2, name: 'Meera Iyer', email: 'meera@example.com' },
  { id: 3, name: 'Kabir Anand', email: 'kabir@example.com' },
];

const POSTS = [
  { id: 101, userId: 1, title: 'My first week with closures' },
  { id: 102, userId: 1, title: 'Why my timer fired late' },
  { id: 103, userId: 2, title: 'A cart that remembers' },
];

const WEATHER = {
  city: 'Bengaluru',
  tempC: 27,
  condition: 'Light rain',
};

let flakyCalls = 0;

function makeResponse(data: unknown, status = 200): FakeResponse {
  const body = JSON.stringify(data);
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(JSON.parse(body) as unknown),
    text: () => Promise.resolve(body),
  };
}

function makeError(message: string, status = 500): FakeResponse {
  return {
    ok: false,
    status,
    json: () => Promise.reject(new Error(message)),
    text: () => Promise.resolve(message),
  };
}

/**
 * Deterministic fake of fetch() for runnable examples. Supports:
 * - "https://api.example.com/users" and ".../users/<id>"
 * - "https://api.example.com/posts" (optional "?userId=<id>")
 * - "https://api.example.com/weather?city=<name>"
 * - "https://api.example.com/flaky" (fails the first two calls
 *   per fresh run, then returns { ok: true })
 */
export async function fakeFetch(url: string, opts: FakeFetchOptions = {}): Promise<FakeResponse> {
  const latency = opts.latencyMs ?? 120;
  const signal = opts.signal;
  if (signal) {
    if (signal.aborted) throw Object.assign(new Error('fakeFetch: aborted'), { name: 'AbortError' });
    await new Promise<void>((resolve, reject) => {
      const finish = () => { signal.removeEventListener?.('abort', abort); resolve(); };
      const timer = setTimeout(finish, latency);
      function abort() {
        clearTimeout(timer);
        signal?.removeEventListener?.('abort', abort);
        reject(Object.assign(new Error('fakeFetch: aborted'), { name: 'AbortError' }));
      }
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) abort();
    });
  } else {
    await sleep(latency);
  }
  if (opts.fail) throw new Error(`fakeFetch: forced failure for ${url}`);

  let path = url.startsWith('/') ? `https://api.example.com${url}` : url;
  let query = '';
  const qIndex = path.indexOf('?');
  if (qIndex >= 0) {
    query = path.slice(qIndex + 1);
    path = path.slice(0, qIndex);
  }
  const clean = path.replace(/\/+$/, '');
  if (clean === 'https://api.example.com/missing') return makeError('Not found', 404);

  if (clean === 'https://api.example.com/flaky') {
    flakyCalls += 1;
    if (flakyCalls <= 2) throw new Error('fakeFetch: flaky endpoint failed (attempt ' + flakyCalls + ')');
    return makeResponse({ ok: true, attempt: flakyCalls });
  }
  if (clean === 'https://api.example.com/users') {
    return makeResponse(USERS);
  }
  const userMatch = clean.match(/^https:\/\/api\.example\.com\/users\/(\d+)$/);
  if (userMatch) {
    const user = USERS.find((u) => u.id === Number(userMatch[1]));
    return user ? makeResponse(user) : makeError('User not found', 404);
  }
  if (clean === 'https://api.example.com/posts') {
    const params = new URLSearchParams(query);
    const userId = params.get('userId');
    return makeResponse(userId ? POSTS.filter((p) => p.userId === Number(userId)) : POSTS);
  }
  if (clean === 'https://api.example.com/weather') {
    const params = new URLSearchParams(query);
    const city = params.get('city');
    return makeResponse(city && city !== WEATHER.city ? { ...WEATHER, city } : WEATHER);
  }
  throw new Error(`fakeFetch: unknown endpoint ${url}`);
}

/** Reset helper state (used by the Node check between snippets). */
export function resetHelpers(): void {
  flakyCalls = 0;
}
