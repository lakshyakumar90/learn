/**
 * Guard the dependency docs against drift, for every project.
 *
 * FAILS the build when, for any project:
 * - an external dependency in any workspace has no entry in
 *   content/projects/<id>/libraries.yaml (names the dependency),
 * - a registry entry matches no dependency in any workspace (stale entry).
 *
 * WARNS (prints, does not fail) for external dependencies that are
 * declared but never imported in the scanned sources. Runtime ones get
 * a "Declared but not used in source" badge in the docs.
 *
 * Usage: pnpm check-deps (runs in `prebuild` after extract-deps).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load as loadYaml } from 'js-yaml';
import { CATEGORY_ORDER, PROJECTS } from '../src/projects.config';

const ROOT = join(__dirname, '..');

interface DepEntry {
  name: string;
  versionRange: string;
  kind: string;
  internal: boolean;
  used: boolean;
}

interface WorkspaceDeps {
  name: string;
  path: string;
  deps: DepEntry[];
}

interface RegistryEntry {
  id: string;
  category?: string;
  uses?: Record<string, string>;
  featured?: string[];
  [key: string]: unknown;
}

function main(): void {
  const depsPath = join(ROOT, 'generated', 'deps.json');
  if (!existsSync(depsPath)) {
    console.error('check-deps: generated/deps.json missing — run pnpm extract-deps first.');
    process.exit(1);
  }
  const all = (JSON.parse(readFileSync(depsPath, 'utf8')).projects ?? {}) as Record<
    string,
    { workspaces?: WorkspaceDeps[] }
  >;

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const project of PROJECTS) {
    const yamlPath = join(ROOT, 'content', 'projects', project.id, 'libraries.yaml');
    if (!existsSync(yamlPath)) {
      console.error(`check-deps: content/projects/${project.id}/libraries.yaml missing.`);
      process.exit(1);
    }
    const workspaces = all[project.id]?.workspaces ?? [];
    const registry = (loadYaml(readFileSync(yamlPath, 'utf8')) as { libraries?: RegistryEntry[] }).libraries ?? [];
    const ids = new Set(registry.map((e) => e.id));
    const seen = new Set<string>();

    for (const ws of workspaces) {
      for (const dep of ws.deps) {
        if (dep.internal) continue;
        seen.add(dep.name);
        if (!ids.has(dep.name)) {
          errors.push(`[${project.id}] no registry entry for external dependency "${dep.name}" (declared in ${ws.path})`);
        } else if (!dep.used) {
          warnings.push(`[${project.id}] "${dep.name}" in ${ws.path} is declared but never imported in source`);
        }
      }
    }
    for (const entry of registry) {
      if (!seen.has(entry.id)) {
        errors.push(`[${project.id}] stale registry entry "${entry.id}" matches no dependency in any workspace`);
      }
      if (entry.category && !CATEGORY_ORDER.includes(entry.category)) {
        errors.push(`[${project.id}] registry entry "${entry.id}" has unknown category "${entry.category}"`);
      }
      const knownPaths = new Set(workspaces.map((w) => w.path));
      for (const ref of [...Object.keys(entry.uses ?? {}), ...(entry.featured ?? [])]) {
        if (!knownPaths.has(ref)) {
          errors.push(`[${project.id}] registry entry "${entry.id}" references unknown workspace "${ref}"`);
        }
      }
    }
    console.log(`check-deps: ${project.id} OK (${registry.length} registry entries)`);
  }

  for (const w of warnings) console.warn(`check-deps warning: ${w}`);
  if (errors.length > 0) {
    console.error(`check-deps: ${errors.length} problem(s)\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }
  console.log(
    `check-deps: OK (every external dependency covered${warnings.length ? `, ${warnings.length} unused-in-source warning(s)` : ''})`,
  );
}

main();
