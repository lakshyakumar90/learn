/**
 * Verify every source path cited anywhere in the site.
 *
 * Fails the build (exit 1) when:
 * - a `sources` entry in any page front matter does not exist under that
 *   page's project source root (src/projects.config.ts),
 * - a `sources` entry in any diagram or flow spec does not exist under
 *   that spec's project root (`project`, defaulting to excalidraw),
 * - a `<Diagram id>` / `diagram:` / `diagrams:` reference has no spec,
 * - a diagram breaks the visual rules (max 12 nodes, 1-3 word labels,
 *   edges pointing at unknown nodes),
 * - an internal talksTo link points at a page that does not exist.
 *
 * Usage: pnpm check-sources (also runs in `prebuild`).
 */
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import matter from 'gray-matter';
import { PROJECTS, getProject } from '../src/projects.config';
import { sourceRoot } from './project-sources';
import { diagramSpecs } from '../content/diagrams';

const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content');

const ROOTS = new Map(PROJECTS.map((p) => [p.id, sourceRoot(p)]));

const errors: string[] = [];
const fail = (message: string) => errors.push(message);

// Deploy environments (e.g. Vercel) clone only this repo. When a project
// source is absent, cited-path existence checks for that project are
// skipped with a warning; every structural check below still runs.
const MISSING = new Set<string>();
for (const p of PROJECTS) {
  if (!existsSync(ROOTS.get(p.id)!)) {
    MISSING.add(p.id);
    console.warn(
      `check-sources: source for ${p.id} absent — skipping its cited-path existence checks (verified where the source exists)`,
    );
  }
}

function walk(dir: string, ext: string[], out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === 'node_modules') continue;
      walk(full, ext, out);
    } else if (ext.some((e) => name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

function checkSourceExists(projectId: string, path: string, citedIn: string): void {
  if (MISSING.has(projectId)) return;
  const full = resolve(ROOTS.get(projectId)!, path);
  if (!existsSync(full)) {
    const project = getProject(projectId);
    const where =
      project?.source.type === 'local' ? (project.source.path as string) : `.cache/sources/${projectId}`;
    fail(`${citedIn}: source does not exist in ${where}: ${path}`);
  }
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : [];
}

function internalPageExists(href: string): boolean {
  const clean = href.split('#')[0];
  const match = clean.match(/^\/(projects|topics|books)(\/.*)?$/);
  if (!match) return true; // external or unknown scheme: not our business
  const parts = (match[2] ?? '/').replace(/^\//, '').split('/').filter(Boolean);
  const base = join(CONTENT, match[1], ...parts);
  return existsSync(`${base}.mdx`) || existsSync(`${base}.md`) || existsSync(join(base, 'index.mdx'));
}

// 1. Page front matter: sources, diagram refs, talksTo links.
for (const file of walk(CONTENT, ['.mdx', '.md'])) {
  if (file.includes(`${sep}diagrams${sep}`) || file.includes(`${sep}flows${sep}`)) continue;
  const rel = file.replace(`${CONTENT}${sep}`, '');
  const segments = rel.split(sep);
  const pageProject = segments[0] === 'projects' && segments.length > 1 ? segments[1] : null;
  let data: Record<string, unknown> = {};
  let body = '';
  try {
    const parsed = matter(readFileSync(file, 'utf8'));
    data = (parsed.data ?? {}) as Record<string, unknown>;
    body = parsed.content;
  } catch (e) {
    fail(`${rel}: cannot parse front matter (${(e as Error).message})`);
    continue;
  }
  if (pageProject && getProject(pageProject)) {
    for (const s of asStringArray(data.sources)) checkSourceExists(pageProject, s, rel);
  } else {
    for (const s of asStringArray(data.sources)) {
      fail(`${rel}: sources entry "${s}" is not under a known project folder`);
    }
  }
  const diagramIds = [
    ...(typeof data.diagram === 'string' ? [data.diagram] : []),
    ...asStringArray(data.diagrams),
    ...[...body.matchAll(/<Diagram\s+id="([^"]+)"\s*\/>/g)].map((m) => m[1]),
  ];
  for (const id of diagramIds) {
    if (!diagramSpecs[id]) fail(`${rel}: unknown diagram id "${id}"`);
  }
  const talksTo = Array.isArray(data.talksTo) ? data.talksTo : [];
  for (const t of talksTo) {
    const href =
      typeof t === 'object' && t !== null
        ? (t as Record<string, unknown>).href
        : undefined;
    if (typeof href === 'string' && href.startsWith('/') && !internalPageExists(href)) {
      fail(`${rel}: talksTo link has no page: ${href}`);
    }
  }
}

// 2. Diagram specs: sources + visual rules.
for (const [id, spec] of Object.entries(diagramSpecs)) {
  const specProject = (spec as { project?: string }).project ?? 'excalidraw';
  if (spec.id !== id) fail(`diagrams/${id}: spec.id "${spec.id}" does not match registry key`);
  if (!getProject(specProject)) fail(`diagrams/${id}: unknown project "${specProject}"`);
  else for (const s of spec.sources) checkSourceExists(specProject, s, `diagram ${id}`);
  if (spec.nodes.length > 12) fail(`diagram ${id}: ${spec.nodes.length} nodes (max 12)`);
  const nodeIds = new Set(spec.nodes.map((n) => n.id));
  for (const n of spec.nodes) {
    const words = n.label.trim().split(/\s+/).length;
    if (words < 1 || words > 3) fail(`diagram ${id}: label "${n.label}" must be 1-3 words`);
  }
  for (const e of spec.edges) {
    if (!nodeIds.has(e.from)) fail(`diagram ${id}: edge from unknown node "${e.from}"`);
    if (!nodeIds.has(e.to)) fail(`diagram ${id}: edge to unknown node "${e.to}"`);
    if (e.kind !== 'solid' && e.kind !== 'dashed')
      fail(`diagram ${id}: edge ${e.from}>${e.to} has bad kind "${e.kind}"`);
  }
}

// 3. Flow specs (content/flows/*.ts), when present.
declare const require: (id: string) => Record<string, unknown>;
try {
  const flows = require('../content/flows') as {
    flowSpecs?: Record<string, { id?: string; project?: string; steps?: Array<{ sources?: unknown }>; sources?: unknown }>;
  };
  const flowSpecs = flows.flowSpecs ?? {};
  for (const [id, flow] of Object.entries(flowSpecs)) {
    const flowProject = flow.project ?? 'excalidraw';
    if (flow.id !== id) fail(`flows/${id}: flow.id does not match registry key`);
    if (!getProject(flowProject)) fail(`flows/${id}: unknown project "${flowProject}"`);
    else {
      for (const s of asStringArray(flow.sources)) checkSourceExists(flowProject, s, `flow ${id}`);
      for (const step of flow.steps ?? []) {
        for (const s of asStringArray(step.sources)) checkSourceExists(flowProject, s, `flow ${id} step`);
      }
    }
  }
} catch {
  // No flows yet — step 6 adds them.
}

if (errors.length > 0) {
  console.error(`check-sources: ${errors.length} problem(s)\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `check-sources: OK (${Object.keys(diagramSpecs).length} diagrams across ${PROJECTS.map((p) => p.id).join(', ')})`,
);
