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
import { load as loadYaml } from 'js-yaml';
import { PROJECTS } from '../src/projects.config';

declare const require: (id: string) => unknown;

const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content');

export interface SearchEntry {
  url: string;
  collection: string;
  /** Owning project id for project pages (shown as a badge), else null. */
  project: string | null;
  title: string;
  description: string;
  headings: string[];
  text: string;
}

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    if (name === 'CREDITS.md') continue;
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

function projectOf(collection: string, rel: string): string | null {
  if (collection !== 'projects') return null;
  const id = rel.split(sep)[0] ?? '';
  return PROJECTS.some((p) => p.id === id) ? id : null;
}

function workspaceUrl(projectId: string, path: string): string | null {
  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) return null;
  if (path === '.') return `/projects/${projectId}/${project.rootPage ?? 'index'}`;
  const alias = project.aliases?.[path];
  if (alias) return `/projects/${projectId}/${path}`;
  if (project.workspaces.includes(path)) return `/projects/${projectId}/${path}`;
  if (project.workspaces.some((w) => w.startsWith(`${path}/`))) return `/projects/${projectId}/${path}`;
  return null;
}

/**
 * Index library names so Ctrl+K finds them: every library on each
 * project's Tech stack page, and each workspace's declared libraries on
 * its folder page.
 */
function indexLibraries(entries: SearchEntry[]): void {
  const byUrl = new Map(entries.map((e) => [e.url, e]));
  const libsData = require('../generated/libraries.json') as {
    projects?: Record<string, { libraries?: Array<{ id: string; displayName?: string }> }>;
  };
  const depsData = require('../generated/deps.json') as {
    projects?: Record<string, { workspaces?: Array<{ path: string; deps?: Array<{ name: string; internal: boolean }> }> }>;
  };
  for (const project of PROJECTS) {
    const libs = libsData.projects?.[project.id]?.libraries ?? [];
    const tech = byUrl.get(`/projects/${project.id}/tech-stack`);
    if (tech) {
      const names = libs.flatMap((l) => [l.id, l.displayName ?? '']).filter(Boolean);
      tech.text += ` Libraries: ${[...new Set(names)].join(', ')}.`;
    }
    const displayById = new Map(libs.map((l) => [l.id, l.displayName ?? l.id]));
    const workspaces = depsData.projects?.[project.id]?.workspaces ?? [];
    for (const ws of workspaces) {
      const url = workspaceUrl(project.id, ws.path);
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
}

/**
 * Index interview question text on the bank page so Ctrl+K finds
 * questions by wording, answer and tags — not just page prose.
 */
function indexInterviewQuestions(entries: SearchEntry[]): void {
  for (const [url, dir] of [
    ['/topics/javascript/question-bank', 'javascript'],
    ['/topics/typescript/question-bank', 'typescript'],
  ] as Array<[string, string]>) {
    const bank = entries.find((e) => e.url === url);
    if (!bank) continue;
    const file = join(CONTENT, 'topics', dir, 'interview', 'questions.yaml');
    if (!existsSync(file)) continue;
    try {
      const questions = loadYaml(readFileSync(file, 'utf8')) as Array<{
        question?: string;
        answer?: string;
        tags?: string[];
      }>;
      const text = questions
        .map((q) =>
          [q.question ?? '', q.answer ?? '', (q.tags ?? []).join(' ')].join(' '),
        )
        .join(' ');
      bank.text += ` Interview questions: ${text}`.slice(0, 20000);
    } catch (e) {
      console.warn(`search index: questions skipped (${(e as Error).message})`);
    }
  }
}

function main(): void {
  const entries: SearchEntry[] = [];
  for (const collection of ['projects', 'topics', 'books']) {
    const dir = join(CONTENT, collection);
    const files: string[] = [];
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
        project: projectOf(collection, rel),
        title: String(data.title ?? rel),
        description: String(data.description ?? ''),
        headings,
        text: stripMarkdown(content).slice(0, 2000),
      });
    }
  }
  mkdirSync(join(ROOT, 'public'), { recursive: true });
  indexInterviewQuestions(entries);
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
