/**
 * Build a static search index for the Ctrl+K dialog.
 * Reads every MDX file under content/, extracts front matter
 * (title, description) plus headings and plain text, and writes
 * public/search-index.json. Runs in `prebuild` so static export
 * needs no search API route.
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import matter from 'gray-matter';

declare const require: (id: string) => unknown;

const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content');

export interface SearchEntry {
  url: string;
  collection: string;
  title: string;
  description: string;
  headings: string[];
  text: string;
}

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    if (name === 'diagrams' || name === 'flows') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith('.mdx') || name.endsWith('.md')) out.push(full);
  }
}

function stripMarkdown(src: string): string {
  return src
    .replace(/^import .*$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[>\-*+]\s+/gm, '')
    .replace(/[{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function urlFor(collection: string, rel: string): string {
  // content/projects/excalidraw/apps/web.mdx -> /projects/excalidraw/apps/web
  // content/projects/excalidraw/index.mdx    -> /projects/excalidraw
  const noExt = rel.replace(/\.(md|mdx)$/, '');
  const parts = noExt.split(sep);
  if (parts[parts.length - 1] === 'index') parts.pop();
  return `/${collection}/${parts.join('/')}`;
}

function workspaceUrl(path: string): string | null {
  if (path === '.') return '/projects/excalidraw/monorepo';
  if (path === 'apps') return '/projects/excalidraw/apps';
  if (path === 'packages') return '/projects/excalidraw/packages';
  if (path.startsWith('apps/')) return `/projects/excalidraw/${path}`;
  if (path === 'packages/eslint-config' || path === 'packages/typescript-config') {
    return '/projects/excalidraw/packages/tooling';
  }
  if (path.startsWith('packages/')) return `/projects/excalidraw/${path}`;
  return null;
}

/**
 * Index library names so Ctrl+K finds them: every library on the Tech
 * stack page, and each workspace's declared libraries on its folder page
 * (and the monorepo page for root tooling).
 */
function indexLibraries(entries: SearchEntry[]): void {
  const byUrl = new Map(entries.map((e) => [e.url, e]));
  const libsData = require('../generated/libraries.json') as {
    libraries?: Array<{ id: string; displayName?: string }>;
  };
  const depsData = require('../generated/deps.json') as {
    workspaces?: Array<{ path: string; deps?: Array<{ name: string; internal: boolean }> }>;
  };
  const libs = libsData.libraries ?? [];
  const tech = byUrl.get('/projects/excalidraw/tech-stack');
  if (tech) {
    const names = libs.flatMap((l) => [l.id, l.displayName ?? '']).filter(Boolean);
    tech.text += ` Libraries: ${[...new Set(names)].join(', ')}.`;
  }
  const displayById = new Map(libs.map((l) => [l.id, l.displayName ?? l.id]));
  const workspaces = depsData.workspaces ?? [];
  for (const ws of workspaces) {
    const url = workspaceUrl(ws.path);
    const entry = url ? byUrl.get(url) : undefined;
    if (!entry) continue;
    const names = (ws.deps ?? [])
      .filter((d) => !d.internal)
      .flatMap((d) => [d.name, displayById.get(d.name) ?? ''])
      .filter(Boolean);
    if (names.length > 0) {
      entry.text += ` Libraries used here: ${[...new Set(names)].join(', ')}.`;
    }
  }
}

function main(): void {
  const entries: SearchEntry[] = [];
  for (const collection of ['projects', 'topics', 'books']) {
    const dir = join(CONTENT, collection);
    let files: string[] = [];
    try {
      walk(dir, files);
    } catch {
      continue;
    }
    for (const file of files) {
      const raw = readFileSync(file, 'utf8');
      const { data, content } = matter(raw);
      const rel = relative(dir, file);
      const headings = [...content.matchAll(/^#{2,4}\s+(.+)$/gm)].map((m) => m[1].trim());
      entries.push({
        url: urlFor(collection, rel),
        collection,
        title: String(data.title ?? rel),
        description: String(data.description ?? ''),
        headings,
        text: stripMarkdown(content).slice(0, 2000),
      });
    }
  }
  mkdirSync(join(ROOT, 'public'), { recursive: true });
  if (existsSync(join(ROOT, 'generated', 'deps.json'))) {
    try {
      indexLibraries(entries);
    } catch (e) {
      console.warn(`search index: library terms skipped (${(e as Error).message})`);
    }
  }
  writeFileSync(join(ROOT, 'public', 'search-index.json'), JSON.stringify(entries));
  console.log(`search index: ${entries.length} pages`);
}

main();
