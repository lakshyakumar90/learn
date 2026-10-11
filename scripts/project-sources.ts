/**
 * Scripts-only path resolution for documented project sources.
 * Local sources resolve to the sibling checkout; git sources resolve to
 * the fetch-source.ts cache. Never imported by client components.
 */
import { join, resolve } from 'node:path';
import type { ProjectConfig } from '../src/projects.config';

export const LEARN_ROOT = join(__dirname, '..');

export function cacheDir(id: string): string {
  return join(LEARN_ROOT, '.cache', 'sources', id);
}

export function sourceRoot(project: ProjectConfig): string {
  return project.source.type === 'local'
    ? resolve(LEARN_ROOT, project.source.path)
    : cacheDir(project.id);
}
