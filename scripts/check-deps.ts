/**
 * Guard the dependency docs against drift.
 *
 * FAILS the build when:
 * - an external dependency in any workspace has no entry in
 *   content/projects/excalidraw/libraries.yaml (names the dependency),
 * - a registry entry matches no dependency in any workspace (stale entry).
 *
 * WARNS (prints, does not fail) for external dependencies that are
 * declared but never imported in src/ (build tooling and @types live
 * here by nature; runtime ones get a badge in the docs).
 *
 * Usage: pnpm check-deps (runs in `prebuild` after extract-deps).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load as loadYaml } from 'js-yaml';

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

const CATEGORIES = [
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

function main(): void {
  const depsPath = join(ROOT, 'generated', 'deps.json');
  const yamlPath = join(ROOT, 'content', 'projects', 'excalidraw', 'libraries.yaml');
  if (!existsSync(depsPath)) {
    console.error('check-deps: generated/deps.json missing — run pnpm extract-deps first.');
    process.exit(1);
  }
  if (!existsSync(yamlPath)) {
    console.error('check-deps: content/projects/excalidraw/libraries.yaml missing.');
    process.exit(1);
  }
  const workspaces = (JSON.parse(readFileSync(depsPath, 'utf8')).workspaces ?? []) as WorkspaceDeps[];
  const registry = (loadYaml(readFileSync(yamlPath, 'utf8')) as { libraries?: RegistryEntry[] }).libraries ?? [];
  const ids = new Set(registry.map((e) => e.id));

  const errors: string[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();

  for (const ws of workspaces) {
    for (const dep of ws.deps) {
      if (dep.internal) continue;
      seen.add(dep.name);
      if (!ids.has(dep.name)) {
        errors.push(`no registry entry for external dependency "${dep.name}" (declared in ${ws.path})`);
      } else if (!dep.used) {
        warnings.push(`"${dep.name}" in ${ws.path} is declared but never imported in src/`);
      }
    }
  }
  for (const entry of registry) {
    if (!seen.has(entry.id)) {
      errors.push(`stale registry entry "${entry.id}" matches no dependency in any workspace`);
    }
    if (entry.category && !CATEGORIES.includes(entry.category)) {
      errors.push(`registry entry "${entry.id}" has unknown category "${entry.category}"`);
    }
    const knownPaths = new Set(workspaces.map((w) => w.path));
    for (const ref of [...Object.keys(entry.uses ?? {}), ...(entry.featured ?? [])]) {
      if (!knownPaths.has(ref)) {
        errors.push(`registry entry "${entry.id}" references unknown workspace "${ref}"`);
      }
    }
  }

  for (const w of warnings) console.warn(`check-deps warning: ${w}`);
  if (errors.length > 0) {
    console.error(`check-deps: ${errors.length} problem(s)\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }
  console.log(
    `check-deps: OK (${registry.length} registry entries cover every external dependency${warnings.length ? `, ${warnings.length} unused-in-src warning(s)` : ''})`,
  );
}

main();
