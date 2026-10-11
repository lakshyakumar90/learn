import depsJson from '../../generated/deps.json';
import libsJson from '../../generated/libraries.json';

export interface DepEntry {
  name: string;
  versionRange: string;
  kind: 'dependency' | 'devDependency' | 'peerDependency';
  internal: boolean;
  used: boolean;
}

export interface WorkspaceDeps {
  name: string;
  path: string;
  role: string;
  runtime: string;
  fileCounts: Record<string, number>;
  deps: DepEntry[];
}

export interface RegistryEntry {
  id: string;
  displayName: string;
  category: string;
  why: string;
  homepage: string;
  uses?: Record<string, string>;
  featured?: string[];
}

export const CATEGORY_ORDER = [
  'Language and build',
  'Frontend framework',
  'UI and styling',
  'State',
  'Rendering and canvas',
  'Realtime and queues',
  'Backend framework',
  'Database and ORM',
  'Auth and email',
  'Validation',
  'Testing',
  'Linting and formatting',
  'Monorepo tooling',
  'Other',
];

const data = depsJson as { commit: string; workspaces: WorkspaceDeps[] };
const registry = (libsJson as { libraries: RegistryEntry[] }).libraries ?? [];

export const depsCommit = data.commit;
export const workspaces: WorkspaceDeps[] = data.workspaces;

const byPath = new Map(workspaces.map((w) => [w.path, w]));
const libById = new Map(registry.map((l) => [l.id, l]));

export function getWorkspace(path: string): WorkspaceDeps | undefined {
  return byPath.get(path);
}

export function getLibrary(id: string): RegistryEntry | undefined {
  return libById.get(id);
}

export function allLibraries(): RegistryEntry[] {
  return registry;
}

/** Fixed workspace orders for deterministic rendering. */
const APPS_ORDER = ['apps/web', 'apps/http-server', 'apps/ws-server', 'apps/flush-worker'];

function packagePaths(): string[] {
  return workspaces
    .map((w) => w.path)
    .filter((p) => p.startsWith('packages/'))
    .sort();
}

/**
 * Resolve a DependencyTable workspace key to workspace paths.
 * 'apps' and 'packages' aggregate their children; 'packages/tooling'
 * covers the two config packages; '.'/'root' is the repo root.
 */
export function resolveWorkspaces(key: string): string[] {
  if (key === 'apps') return APPS_ORDER.filter((p) => byPath.has(p));
  if (key === 'packages') return packagePaths();
  if (key === 'packages/tooling') return ['packages/eslint-config', 'packages/typescript-config'];
  if (key === 'root' || key === '.') return ['.'];
  return byPath.has(key) ? [key] : [];
}

export function isAggregateKey(key: string): boolean {
  return key === 'apps' || key === 'packages';
}

/** Folder-page titles for workspace links (site structure, not data). */
const WORKSPACE_TITLES: Record<string, string> = {
  '.': 'Monorepo',
  apps: 'apps/',
  'apps/web': 'Web',
  'apps/http-server': 'HTTP server',
  'apps/ws-server': 'WebSocket server',
  'apps/flush-worker': 'Flush worker',
  packages: 'packages/',
  'packages/common': 'Common',
  'packages/engine': 'Engine',
  'packages/backend-common': 'Backend common',
  'packages/db': 'Database',
  'packages/auth': 'Auth',
  'packages/redis': 'Redis',
  'packages/validations': 'Validations',
  'packages/ui': 'UI',
  'packages/tooling': 'Tooling configs',
  'packages/eslint-config': 'Tooling configs',
  'packages/typescript-config': 'Tooling configs',
};

export function workspaceTitle(path: string): string {
  if (WORKSPACE_TITLES[path]) return WORKSPACE_TITLES[path];
  const base = path.split('/').pop() ?? path;
  return base || path;
}

/** Docs URL for a workspace (config packages share the tooling page). */
export function workspaceHref(path: string): string {
  if (path === '.') return '/projects/excalidraw/monorepo';
  if (path === 'apps') return '/projects/excalidraw/apps';
  if (path === 'packages') return '/projects/excalidraw/packages';
  if (path === 'packages/eslint-config' || path === 'packages/typescript-config') {
    return '/projects/excalidraw/packages/tooling';
  }
  return `/projects/excalidraw/${path}`;
}

/** "TypeScript, CSS" / "TypeScript, Prisma schema, SQL" style line. */
export function languageLine(counts: Record<string, number>): string {
  const parts: string[] = [];
  if (counts.ts || counts.tsx) parts.push('TypeScript');
  if (counts.css) parts.push('CSS');
  if (counts.prisma) parts.push('Prisma schema');
  if (counts.sql) parts.push('SQL');
  return parts.join(', ');
}

/** Registry entries grouped by category, in category order. */
export function librariesByCategory(): Array<{ category: string; libs: RegistryEntry[] }> {
  const groups = new Map<string, RegistryEntry[]>();
  for (const lib of registry) {
    if (!groups.has(lib.category)) groups.set(lib.category, []);
    groups.get(lib.category)!.push(lib);
  }
  return CATEGORY_ORDER.filter((c) => groups.has(c)).map((c) => ({
    category: c,
    libs: groups.get(c)!,
  }));
}
/** Anchor id for a library on the Tech stack page. */
export function libraryAnchor(id: string): string {
  return `lib-${id.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`;
}

/**
 * Workspaces that use a library (imported in src). Falls back to
 * declaring workspaces when nothing imports it (build tooling).
 */
export function libraryWorkspaces(id: string): string[] {
  const used: string[] = [];
  const declared: string[] = [];
  for (const w of workspaces) {
    const dep = w.deps.find((d) => d.name === id && !d.internal);
    if (!dep) continue;
    if (dep.used) used.push(w.path);
    else declared.push(w.path);
  }
  return used.length > 0 ? used : declared;
}

/** Featured library ids for a workspace, with an honest fallback. */
export function keyLibraries(path: string): string[] {
  const featured = registry.filter((l) => l.featured?.includes(path)).map((l) => l.id);
  if (featured.length > 0) return featured.slice(0, 5);
  const ws = byPath.get(path);
  if (!ws) return [];
  return ws.deps
    .filter((d) => !d.internal && d.used)
    .map((d) => d.name)
    .slice(0, 5);
}
