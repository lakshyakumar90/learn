/**
 * Extract the dependency + tech-stack data the docs render, for every
 * project in src/projects.config.ts.
 *
 * For each project it reads the package.json of every configured
 * workspace, detects which dependencies are actually imported in the
 * workspace's scan folder, counts source files by extension, and writes:
 *   generated/deps.json      - { projects: { <id>: { commit, workspaces } } }
 *   generated/libraries.json - { projects: { <id>: { libraries: [...] } } }
 *     (so MDX client components can import it without a YAML loader)
 *
 * Internal means another workspace's package: a workspace:, file: or
 * link: range, or a name matching a sibling workspace package name.
 *
 * Usage: pnpm extract-deps (also runs in `prebuild` after fetch-source).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { builtinModules } from 'node:module';
import { load as loadYaml } from 'js-yaml';
import { PROJECTS, isEnvSecretFile, type ProjectConfig } from '../src/projects.config';
import { LEARN_ROOT as ROOT, sourceRoot } from './project-sources';

const OUT = join(ROOT, 'generated');

const COUNT_EXTS = ['ts', 'tsx', 'js', 'jsx', 'css', 'prisma', 'sql', 'md'];
const SCAN_EXTS = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'css'];
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

function walk(dir: string, ignore: Set<string>, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (ignore.has(name) || isEnvSecretFile(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, ignore, out);
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

function importedPackages(scanDir: string, ignore: Set<string>): Set<string> {
  const found = new Set<string>();
  if (!existsSync(scanDir)) return found;
  for (const file of walk(scanDir, ignore)) {
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

function extractProject(project: ProjectConfig): { commit: string; workspaces: WorkspaceDeps[] } {
  const target = sourceRoot(project);
  const ignore = new Set(project.ignore ?? []);
  const scanSub = project.scanDir ?? 'src';
  const pkgNames = new Map<string, string>();
  for (const ws of project.workspaces) {
    const pkgFile = join(target, ws, 'package.json');
    if (!existsSync(pkgFile)) {
      console.error(`extract-deps: ${project.id} workspace ${ws} has no package.json at ${pkgFile}`);
      process.exit(1);
    }
    const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'));
    if (pkg.name) pkgNames.set(String(pkg.name), ws);
  }
  const rootPkgPath = join(target, 'package.json');
  const rootEngines: string = existsSync(rootPkgPath)
    ? (JSON.parse(readFileSync(rootPkgPath, 'utf8')).engines?.node ?? '')
    : '';

  const workspaces: WorkspaceDeps[] = [];
  for (const ws of project.workspaces) {
    const dir = join(target, ws);
    const rel = relative(target, dir).replace(/\\/g, '/') || '.';
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    const used = importedPackages(join(dir, scanSub), ignore);
    const counts: Record<string, number> = {};
    for (const f of walk(dir, ignore)) {
      const ext = (f.split('.').pop() ?? '').toLowerCase();
      if (COUNT_EXTS.includes(ext)) counts[ext] = (counts[ext] ?? 0) + 1;
    }
    const deps: DepEntry[] = [];
    for (const kind of ['dependency', 'devDependency', 'peerDependency'] as DepKind[]) {
      const key =
        kind === 'dependency' ? 'dependencies' : kind === 'devDependency' ? 'devDependencies' : 'peerDependencies';
      for (const [name, range] of Object.entries((pkg[key] ?? {}) as Record<string, string>)) {
        const rangeStr = String(range);
        const internal =
          rangeStr.startsWith('workspace:') ||
          rangeStr.startsWith('file:') ||
          rangeStr.startsWith('link:') ||
          pkgNames.has(name);
        deps.push({ name, versionRange: rangeStr, kind, internal, used: used.has(name) });
      }
    }
    const engines = pkg.engines?.node ?? rootEngines;
    const runtime = engines
      ? `Node ${engines}`
      : pkg.type === 'commonjs' && (counts.js || counts.jsx)
        ? 'Node CommonJS'
        : '';
    workspaces.push({
      name: String(pkg.name ?? rel),
      path: rel,
      role: readmeRole(dir),
      runtime,
      fileCounts: counts,
      deps,
    });
  }
  return { commit: project.documentedCommit, workspaces };
}

function main(): void {
  const missing = PROJECTS.map((p) => ({ p, root: sourceRoot(p) })).filter(({ root }) => !existsSync(root));
  if (missing.length > 0) {
    // Deploy environments (e.g. Vercel) clone only this repo, so local
    // sources are absent. Reuse the committed generated files, which were
    // verified where the sources exist.
    const depsJson = join(OUT, 'deps.json');
    const libsJson = join(OUT, 'libraries.json');
    if (existsSync(depsJson) && existsSync(libsJson)) {
      console.log(
        `extract-deps: source(s) absent (${missing.map(({ p }) => p.id).join(', ')}), reusing committed generated files`,
      );
      return;
    }
    for (const { p, root } of missing) console.error(`extract-deps: source for ${p.id} not found at ${root}`);
    process.exit(1);
  }

  const projects: Record<string, { commit: string; workspaces: WorkspaceDeps[] }> = {};
  for (const project of PROJECTS) {
    projects[project.id] = extractProject(project);
  }

  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, 'deps.json'), JSON.stringify({ projects }, null, 2) + '\n');

  const libraries: Record<string, unknown> = {};
  for (const project of PROJECTS) {
    const yamlPath = join(ROOT, 'content', 'projects', project.id, 'libraries.yaml');
    if (existsSync(yamlPath)) {
      libraries[project.id] = loadYaml(readFileSync(yamlPath, 'utf8'));
      console.log(`extract-deps: ${project.id} registry from libraries.yaml`);
    } else {
      libraries[project.id] = { libraries: [] };
      console.log(`extract-deps: ${project.id} has no libraries.yaml yet`);
    }
  }
  writeFileSync(join(OUT, 'libraries.json'), JSON.stringify({ projects: libraries }, null, 2) + '\n');
  const total = Object.values(projects).reduce((n, p) => n + p.workspaces.length, 0);
  console.log(`extract-deps: ${total} workspaces across ${PROJECTS.length} projects -> generated/deps.json + generated/libraries.json`);
}

main();
