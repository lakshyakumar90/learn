/**
 * Verify every source path cited anywhere in the site.
 *
 * Fails the build (exit 1) when:
 * - a `sources` entry in any page front matter does not exist under
 *   the documented repo (siteConfig.excalidrawDir),
 * - a `sources` entry in any diagram or flow spec does not exist there,
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
import { siteConfig } from '../src/site.config';
import { diagramSpecs } from '../content/diagrams';

const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content');
const TARGET = resolve(ROOT, siteConfig.excalidrawDir as string);

const errors: string[] = [];
const fail = (message: string) => errors.push(message);

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

function checkSourceExists(path: string, citedIn: string): void {
  const full = resolve(TARGET, path);
  if (!existsSync(full)) {
    fail(`${citedIn}: source does not exist in ${siteConfig.excalidrawDir}: ${path}`);
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
  for (const s of asStringArray(data.sources)) checkSourceExists(s, rel);
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
  if (spec.id !== id) fail(`diagrams/${id}: spec.id "${spec.id}" does not match registry key`);
  for (const s of spec.sources) checkSourceExists(s, `diagram ${id}`);
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
    flowSpecs?: Record<string, { id?: string; steps?: Array<{ sources?: unknown }>; sources?: unknown }>;
  };
  const flowSpecs = flows.flowSpecs ?? {};
  for (const [id, flow] of Object.entries(flowSpecs)) {
    if (flow.id !== id) fail(`flows/${id}: flow.id does not match registry key`);
    for (const s of asStringArray(flow.sources)) checkSourceExists(s, `flow ${id}`);
    for (const step of flow.steps ?? []) {
      for (const s of asStringArray(step.sources)) checkSourceExists(s, `flow ${id} step`);
    }
  }
} catch {
  // No flows yet — step 6 adds them.
}

if (!existsSync(TARGET)) {
  fail(`documented repo not found at ${TARGET} (siteConfig.excalidrawDir)`);
}

if (errors.length > 0) {
  console.error(`check-sources: ${errors.length} problem(s)\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(
  `check-sources: OK (${Object.keys(diagramSpecs).length} diagrams against ${siteConfig.excalidrawDir} @ ${siteConfig.excalidrawCommit})`,
);
