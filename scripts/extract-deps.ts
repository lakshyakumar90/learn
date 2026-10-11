/**
 * Extract the dependency + tech-stack data the docs render.
 *
 * Reads ../excalidraw/package.json and every apps/* and packages/*
 * package.json, detects which dependencies are actually imported in each
 * workspace's src, counts source files by extension, and writes:
 *   generated/deps.json      - per-workspace dependency data
 *   generated/libraries.json - the libraries.yaml registry as JSON
 *     (so MDX client components can import it without a YAML loader)
 *
 * Usage: pnpm extract-deps (also runs first in `prebuild`).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { builtinModules } from 'node:module';
import { load as loadYaml } from 'js-yaml';
import { siteConfig } from '../src/site.config';

const ROOT = join(__dirname, '..');
const TARGET = join(ROOT, siteConfig.excalidrawDir as string);
const OUT = join(ROOT, 'generated');

const COUNT_EXTS = ['ts', 'tsx', 'css', 'prisma', 'sql', 'md'];
const SCAN_EXTS = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'css'];
const IGNORE_DIRS = new Set(['node_modules', 'dist', '.next', 'coverage', '.turbo', '.git']);
const BUILTINS = new Set<string>(builtinModules.flatMap((m) => [m, m.replace(/^node:/, '')]));

export type DepKind = 'dependency' | 'devDependency' | 'peerDependency';

export interface DepEntry {
  name: string;
  versionRange: string;
  kind: DepKind;
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

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (IGNORE_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** Map an import specifier to its package name, or null when not a package. */
function packageOf(spec: string): string | null {
  if (!spec) return null;
  if (spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('#')) return null;
  if (BUILTINS.has(spec)) return null;
  if (spec.startsWith('@')) {
    const parts = spec.split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
  }
  return spec.split('/')[0];
}

const IMPORT_RES = [
  /import\s+(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]/g,
  /export\s+[^'"]*?\sfrom\s+['"]([^'"]+)['"]/g,
  /require\(\s*['"]([^'"]+)['"]\s*\)/g,
  /@import\s+['"]([^'"]+)['"]/g,
];

function importedPackages(srcDir: string): Set<string> {
  const found = new Set<string>();
  if (!existsSync(srcDir)) return found;
  for (const file of walk(srcDir)) {
    const ext = file.split('.').pop() ?? '';
    if (!SCAN_EXTS.includes(ext)) continue;
    const text = readFileSync(file, 'utf8');
    for (const re of IMPORT_RES) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const pkg = packageOf(m[1]);
        if (pkg) found.add(pkg);
      }
    }
  }
  return found;
}

/** First prose line of the workspace README (the one-line purpose). */
function readmeRole(dir: string): string {
  const readme = join(dir, 'README.md');
  if (!existsSync(readme)) return '';
  const lines = readFileSync(readme, 'utf8').split('\n');
  let pastTitle = false;
  for (const line of lines) {
    const t = line.trim();
    if (!pastTitle) {
      if (t.startsWith('#')) pastTitle = true;
      continue;
    }
    if (t && !t.startsWith('#') && !t.startsWith('[') && !t.startsWith('<')) return t;
  }
  return '';
}

function main(): void {
  if (!existsSync(TARGET)) {
    // Deploy environments (e.g. Vercel) clone only this repo, so the
    // sibling project is absent. Reuse the committed generated files,
    // which were verified where the sibling exists.
    const depsJson = join(OUT, 'deps.json');
    const libsJson = join(OUT, 'libraries.json');
    if (existsSync(depsJson) && existsSync(libsJson)) {
      console.log('extract-deps: sibling repo absent, reusing committed generated/deps.json');
      return;
    }
    console.error(`extract-deps: documented repo not found at ${TARGET}`);
    process.exit(1);
  }
  const rootPkg = JSON.parse(readFileSync(join(TARGET, 'package.json'), 'utf8'));
  const rootEngines: string = rootPkg.engines?.node ?? '';
  const pkgFiles = [
    join(TARGET, 'package.json'),
    ...readdirSync(join(TARGET, 'apps'))
      .map((d) => join(TARGET, 'apps', d, 'package.json'))
      .filter(existsSync),
    ...readdirSync(join(TARGET, 'packages'))
      .map((d) => join(TARGET, 'packages', d, 'package.json'))
      .filter(existsSync),
  ];

  const workspaces: WorkspaceDeps[] = [];
  for (const pkgFile of pkgFiles) {
    const dir = join(pkgFile, '..');
    const rel = relative(TARGET, dir).replace(/\\/g, '/') || '.';
    const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'));
    const used = importedPackages(join(dir, 'src'));
    const counts: Record<string, number> = {};
    for (const f of walk(dir)) {
      const ext = (f.split('.').pop() ?? '').toLowerCase();
      if (COUNT_EXTS.includes(ext)) counts[ext] = (counts[ext] ?? 0) + 1;
    }
    const deps: DepEntry[] = [];
    for (const kind of ['dependency', 'devDependency', 'peerDependency'] as DepKind[]) {
      const key =
        kind === 'dependency' ? 'dependencies' : kind === 'devDependency' ? 'devDependencies' : 'peerDependencies';
      for (const [name, range] of Object.entries((pkg[key] ?? {}) as Record<string, string>)) {
        const internal = name.startsWith('@repo/') || String(range).startsWith('workspace:');
        deps.push({ name, versionRange: String(range), kind, internal, used: used.has(name) });
      }
    }
    const runtime = pkg.engines?.node ?? rootEngines;
    workspaces.push({
      name: String(pkg.name ?? rel),
      path: rel,
      role: readmeRole(dir),
      runtime: runtime ? `Node ${runtime}` : '',
      fileCounts: counts,
      deps,
    });
  }

  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, 'deps.json'), JSON.stringify({ commit: siteConfig.excalidrawCommit, workspaces }, null, 2) + '\n');

  const yamlPath = join(ROOT, 'content', 'projects', 'excalidraw', 'libraries.yaml');
  if (existsSync(yamlPath)) {
    const registry = loadYaml(readFileSync(yamlPath, 'utf8'));
    writeFileSync(join(OUT, 'libraries.json'), JSON.stringify(registry, null, 2) + '\n');
    console.log(`extract-deps: ${workspaces.length} workspaces -> generated/deps.json + generated/libraries.json`);
  } else {
    writeFileSync(join(OUT, 'libraries.json'), JSON.stringify({ libraries: [] }, null, 2) + '\n');
    console.log(`extract-deps: ${workspaces.length} workspaces -> generated/deps.json (no libraries.yaml yet)`);
  }
}

main();
