import depsJson from '../../generated/deps.json';
import libsJson from '../../generated/libraries.json';
import { CATEGORY_ORDER as ORDER, PROJECTS, getProject } from '@/projects.config';

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

export const CATEGORY_ORDER = ORDER;

interface ProjectData {
  commit: string;
  workspaces: WorkspaceDeps[];
}

const DEFAULT_PROJECT = 'excalidraw';

const data = (depsJson as { projects: Record<string, ProjectData> }).projects ?? {};
const registries = (libsJson as { projects: Record<string, { libraries: RegistryEntry[] }> }).projects ?? {};

export function depsCommit(project: string = DEFAULT_PROJECT): string {
  return data[project]?.commit ?? '';
}

export function workspacesOf(project: string = DEFAULT_PROJECT): WorkspaceDeps[] {
  return data[project]?.workspaces ?? [];
}

function registryOf(project: string): RegistryEntry[] {
  return registries[project]?.libraries ?? [];
}

function byPath(project: string): Map<string, WorkspaceDeps> {
  return new Map(workspacesOf(project).map((w) => [w.path, w]));
}

export function getWorkspace(project: string, path: string): WorkspaceDeps | undefined;
export function getWorkspace(path: string): WorkspaceDeps | undefined;
export function getWorkspace(projectOrPath: string, path?: string): WorkspaceDeps | undefined {
  const project = path === undefined ? DEFAULT_PROJECT : projectOrPath;
  const key = path === undefined ? projectOrPath : path;
  return byPath(project).get(key);
}

export function getLibrary(project: string, id: string): RegistryEntry | undefined;
export function getLibrary(id: string): RegistryEntry | undefined;
export function getLibrary(projectOrId: string, id?: string): RegistryEntry | undefined {
  const project = id === undefined ? DEFAULT_PROJECT : projectOrId;
  const key = id === undefined ? projectOrId : id;
  return registryOf(project).find((l) => l.id === key);
}

export function allLibraries(project: string = DEFAULT_PROJECT): RegistryEntry[] {
  return registryOf(project);
}

/**
 * Resolve a DependencyTable workspace key to workspace paths.
 * An exact workspace path resolves to itself; a configured alias to its
 * targets; a group prefix (apps, packages, backend, frontend) aggregates
 * its children; '.'/'root' is the repo root workspace when present.
 */
export function resolveWorkspaces(project: string, key: string): string[];
export function resolveWorkspaces(key: string): string[];
export function resolveWorkspaces(projectOrKey: string, key?: string): string[] {
  const project = key === undefined ? DEFAULT_PROJECT : projectOrKey;
  const k = key === undefined ? projectOrKey : key;
  const config = getProject(project);
  if (!config) return [];
  if (config.workspaces.includes(k)) return [k];
  const alias = config.aliases?.[k];
  if (alias) return alias.filter((p) => config.workspaces.includes(p));
  if (k === 'root' || k === '.') return config.workspaces.includes('.') ? ['.'] : [];
  const children = config.workspaces.filter((w) => w.startsWith(`${k}/`));
  if (children.length > 0) return children;
  return [];
}

function isAggregate(project: string, key: string): boolean {
  return resolveWorkspaces(project, key).length > 1;
}

export function isAggregateKey(project: string, key: string): boolean;
export function isAggregateKey(key: string): boolean;
export function isAggregateKey(projectOrKey: string, key?: string): boolean {
  const project = key === undefined ? DEFAULT_PROJECT : projectOrKey;
  const k = key === undefined ? projectOrKey : key;
  return isAggregate(project, k);
}

/** Folder-page titles: per-project overrides, else folder name in Title Case. */
export function workspaceTitle(path: string, project: string = DEFAULT_PROJECT): string {
  const override = getProject(project)?.titles?.[path];
  if (override) return override;
  const base = path.split('/').pop() ?? path;
  return base
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** Docs URL for a workspace path or group key. */
export function workspaceHref(project: string, path: string): string;
export function workspaceHref(path: string): string;
export function workspaceHref(projectOrPath: string, path?: string): string {
  const project = path === undefined ? DEFAULT_PROJECT : projectOrPath;
  const key = path === undefined ? projectOrPath : path;
  if (key === '.') return `/projects/${project}/${getProject(project)?.rootPage ?? 'index'}`;
  return `/projects/${project}/${key}`;
}

/** "TypeScript, CSS" / "JavaScript and JSX" style line from file counts. */
export function languageLine(counts: Record<string, number>): string {
  const parts: string[] = [];
  if (counts.ts || counts.tsx) parts.push('TypeScript');
  else if (counts.js && counts.jsx) parts.push('JavaScript and JSX');
  else if (counts.js) parts.push('JavaScript');
  else if (counts.jsx) parts.push('JSX');
  if (counts.css) parts.push('CSS');
  if (counts.prisma) parts.push('Prisma schema');
  if (counts.sql) parts.push('SQL');
  return parts.join(', ');
}

/** Registry entries grouped by category, in category order. */
export function librariesByCategory(
  project: string = DEFAULT_PROJECT,
): Array<{ category: string; libs: RegistryEntry[] }> {
  const groups = new Map<string, RegistryEntry[]>();
  for (const lib of registryOf(project)) {
    if (!groups.has(lib.category)) groups.set(lib.category, []);
    groups.get(lib.category)!.push(lib);
  }
  return ORDER.filter((c) => groups.has(c)).map((c) => ({
    category: c,
    libs: groups.get(c)!,
  }));
}

/** Anchor id for a library on the Tech stack page. */
export function libraryAnchor(id: string): string {
  return `lib-${id.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`;
}

/**
 * Workspaces that use a library (imported in scanned sources). Falls back
 * to declaring workspaces when nothing imports it (build tooling).
 */
export function libraryWorkspaces(project: string, id: string): string[];
export function libraryWorkspaces(id: string): string[];
export function libraryWorkspaces(projectOrId: string, id?: string): string[] {
  const project = id === undefined ? DEFAULT_PROJECT : projectOrId;
  const key = id === undefined ? projectOrId : id;
  const used: string[] = [];
  const declared: string[] = [];
  for (const w of workspacesOf(project)) {
    const dep = w.deps.find((d) => d.name === key && !d.internal);
    if (!dep) continue;
    if (dep.used) used.push(w.path);
    else declared.push(w.path);
  }
  return used.length > 0 ? used : declared;
}

/** True when a library is declared but never imported in scanned sources. */
export function libraryUnused(project: string, id: string): boolean {
  const importing = workspacesOf(project).some((w) =>
    w.deps.some((d) => d.name === id && !d.internal && d.used),
  );
  const declared = workspacesOf(project).some((w) =>
    w.deps.some((d) => d.name === id && !d.internal),
  );
  return declared && !importing;
}

/** Featured library ids for a workspace, with an honest fallback. */
export function keyLibraries(project: string, path: string): string[];
export function keyLibraries(path: string): string[];
export function keyLibraries(projectOrPath: string, path?: string): string[] {
  const project = path === undefined ? DEFAULT_PROJECT : projectOrPath;
  const key = path === undefined ? projectOrPath : path;
  const featured = registryOf(project)
    .filter((l) => l.featured?.includes(key))
    .map((l) => l.id);
  if (featured.length > 0) return featured.slice(0, 5);
  const ws = byPath(project).get(key);
  if (!ws) return [];
  return ws.deps
    .filter((d) => !d.internal && d.used)
    .map((d) => d.name)
    .slice(0, 5);
}

export function projectIds(): string[] {
  return PROJECTS.map((p) => p.id);
}
