/**
 * Aggregate every collection's item metadata into generated/catalog.json
 * (bundled by the browser pages) and public/catalog.json (fetched by the
 * Ctrl+K dialog). Also regenerates content/topics/meta.json so the docs
 * sidebar groups topic roots by primary category.
 *
 * FAILS the build on: unknown category or tag value, missing/overlong
 * summary, duplicate id, or a "live" item with no pages.
 *
 * Usage: pnpm build-catalog (runs first in `prebuild`).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { load as loadYaml } from 'js-yaml';
import { TAXONOMY, TOPIC_LEVELS, validateTaxonomy } from '../content/taxonomy';
import { PROJECTS } from '../src/projects.config';
import {
  catalogItemSchema,
  topicYamlSchema,
  type CatalogItem,
} from '../src/lib/catalog/types';

const ROOT = join(__dirname, '..');
const TOPICS_DIR = join(ROOT, 'content', 'topics');
const PROJECTS_DIR = join(ROOT, 'content', 'projects');
const BOOKS_DIR = join(ROOT, 'content', 'books');

const errors: string[] = [];
const fail = (message: string): void => {
  errors.push(message);
};

function mdxCount(dir: string): number {
  if (!existsSync(dir)) return 0;
  let count = 0;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) count += mdxCount(full);
    else if (entry.endsWith('.mdx') || entry.endsWith('.md')) count += 1;
  }
  return count;
}

function topicDirs(): string[] {
  if (!existsSync(TOPICS_DIR)) return [];
  return readdirSync(TOPICS_DIR).filter((name) => {
    const full = join(TOPICS_DIR, name);
    return statSync(full).isDirectory() && existsSync(join(full, 'topic.yaml'));
  });
}

interface ParsedTopic {
  slug: string;
  yaml: ReturnType<typeof topicYamlSchema.parse>;
  pageCount: number;
}

function parseTopics(): ParsedTopic[] {
  const out: ParsedTopic[] = [];
  for (const slug of topicDirs()) {
    const file = join(TOPICS_DIR, slug, 'topic.yaml');
    let data: unknown;
    try {
      data = loadYaml(readFileSync(file, 'utf8'));
    } catch (e) {
      fail(`topic ${slug}: topic.yaml does not parse (${(e as Error).message})`);
      continue;
    }
    let yaml;
    try {
      yaml = topicYamlSchema.parse(data);
    } catch (e) {
      fail(`topic ${slug}: invalid topic.yaml (${(e as Error).message})`);
      continue;
    }
    if (yaml.id !== slug) fail(`topic ${slug}: id "${yaml.id}" must match the folder name`);
    const tax = TAXONOMY.topics;
    const knownCategories = new Set(tax.categories.map((c) => c.id));
    if (!knownCategories.has(yaml.category)) {
      fail(`topic ${slug}: unknown category "${yaml.category}" — add it to content/taxonomy.ts`);
    }
    for (const extra of yaml.alsoIn) {
      if (!knownCategories.has(extra)) {
        fail(`topic ${slug}: unknown alsoIn category "${extra}" — add it to content/taxonomy.ts`);
      }
    }
    const knownTags = new Set(tax.tags);
    for (const tag of yaml.tags) {
      if (!knownTags.has(tag)) {
        fail(`topic ${slug}: unknown tag "${tag}" — add it to content/taxonomy.ts`);
      }
    }
    if (!TOPIC_LEVELS.includes(yaml.level)) fail(`topic ${slug}: unknown level "${yaml.level}"`);
    out.push({ slug, yaml, pageCount: mdxCount(join(TOPICS_DIR, slug)) });
  }
  return out;
}

function buildItems(): CatalogItem[] {
  validateTaxonomy();
  const items: CatalogItem[] = [];
  const seen = new Set<string>();
  const claim = (id: string, what: string): boolean => {
    if (seen.has(id)) {
      fail(`duplicate catalog id "${id}" (${what})`);
      return false;
    }
    seen.add(id);
    return true;
  };

  // Topics.
  const topics = parseTopics();
  for (const { slug, yaml, pageCount } of topics) {
    if (!claim(yaml.id, `topic ${slug}`)) continue;
    if (yaml.status === 'live' && pageCount === 0) {
      fail(`topic ${slug} is live but has no pages`);
    }
    if (yaml.cover?.startsWith('/') && !existsSync(join(ROOT, 'public', yaml.cover.slice(1)))) {
      console.warn(`catalog: topic ${slug} cover not found under public/: ${yaml.cover}`);
    }
    items.push(
      catalogItemSchema.parse({
        id: yaml.id,
        collection: 'topics',
        title: yaml.title,
        summary: yaml.summary,
        categories: [yaml.category, ...yaml.alsoIn.filter((c) => c !== yaml.category)],
        primaryCategory: yaml.category,
        tags: yaml.tags,
        level: yaml.level,
        status: yaml.status,
        cover: yaml.cover,
        href: `/topics/${slug}`,
        updated: yaml.updated,
        pageCount,
        keywords: yaml.keywords,
        order: yaml.order,
      }),
    );
  }

  // Projects (registry is the metadata; content dir is the page count).
  const knownProjectTags = new Set(TAXONOMY.projects.tags);
  PROJECTS.forEach((p, index) => {
    if (!claim(p.id, `project ${p.id}`)) return;
    if (!p.summary || p.summary.trim().length === 0) {
      fail(`project ${p.id} is missing summary in src/projects.config.ts`);
      return;
    }
    if (p.summary.length > 160) {
      fail(`project ${p.id} summary is ${p.summary.length} chars (max 160)`);
      return;
    }
    for (const tag of p.tags) {
      if (!knownProjectTags.has(tag)) {
        fail(`project ${p.id}: unknown tag "${tag}" — add it to content/taxonomy.ts`);
      }
    }
    const pages = mdxCount(join(PROJECTS_DIR, p.id));
    if (p.status === 'live' && pages === 0) fail(`project ${p.id} is live but has no pages`);
    items.push(
      catalogItemSchema.parse({
        id: p.id,
        collection: 'projects',
        title: p.title,
        summary: p.summary,
        categories: [],
        primaryCategory: null,
        tags: p.tags,
        platform: p.platform,
        status: p.status,
        cover: p.cover,
        href: `/projects/${p.id}`,
        updated: p.updated,
        pageCount: pages,
        keywords: [],
        order: index,
      }),
    );
  });

  // Books: content/books/<slug>/book.yaml (none yet — the page is an empty state).
  if (existsSync(BOOKS_DIR)) {
    const bookSchema = topicYamlSchema.omit({ category: true, level: true }).extend({
      category: topicYamlSchema.shape.category.optional(),
      genres: topicYamlSchema.shape.alsoIn,
    });
    for (const name of readdirSync(BOOKS_DIR)) {
      const file = join(BOOKS_DIR, name, 'book.yaml');
      if (!existsSync(file)) continue;
      let parsed;
      try {
        parsed = bookSchema.parse(loadYaml(readFileSync(file, 'utf8')));
      } catch (e) {
        fail(`book ${name}: invalid book.yaml (${(e as Error).message})`);
        continue;
      }
      if (!claim(parsed.id, `book ${name}`)) continue;
      const knownGenres = new Set(TAXONOMY.books.categories.map((c) => c.id));
      const genres = [...(parsed.category ? [parsed.category] : []), ...parsed.genres];
      for (const g of genres) {
        if (!knownGenres.has(g)) fail(`book ${name}: unknown genre "${g}" — add it to content/taxonomy.ts`);
      }
      const pages = mdxCount(join(BOOKS_DIR, name));
      if (parsed.status === 'live' && pages === 0) fail(`book ${name} is live but has no pages`);
      items.push(
        catalogItemSchema.parse({
          id: parsed.id,
          collection: 'books',
          title: parsed.title,
          summary: parsed.summary,
          categories: genres,
          primaryCategory: genres[0] ?? null,
          tags: parsed.tags,
          status: parsed.status,
          cover: parsed.cover,
          href: `/books/${name}`,
          updated: parsed.updated,
          pageCount: pages,
          keywords: parsed.keywords,
          order: parsed.order,
        }),
      );
    }
  }

  return items;
}

/** Rewrite the topics sidebar root: separators per taxonomy category. */
function regenTopicsSidebar(topics: ParsedTopic[]): void {
  const live = topics.filter((t) => t.yaml.status === 'live' && t.pageCount > 0);
  const pages: string[] = [];
  for (const cat of [...TAXONOMY.topics.categories].sort((a, b) => a.order - b.order)) {
    const inCat = live
      .filter((t) => t.yaml.category === cat.id)
      .sort((a, b) => a.yaml.order - b.yaml.order);
    if (inCat.length === 0) continue;
    pages.push(`---${cat.title}---`);
    for (const t of inCat) pages.push(t.slug);
  }
  const metaPath = join(TOPICS_DIR, 'meta.json');
  const next = JSON.stringify({ title: 'Topics', pages }, null, 2) + '\n';
  const prev = existsSync(metaPath) ? readFileSync(metaPath, 'utf8') : '';
  if (prev !== next) {
    writeFileSync(metaPath, next);
    console.log(`catalog: rewrote ${relative(ROOT, metaPath)}`);
  }
}

function main(): void {
  const items = buildItems();
  if (errors.length > 0) {
    for (const e of errors) console.error(`\nFAIL ${e}`);
    console.error(`\nbuild-catalog: ${errors.length} failure(s).`);
    process.exit(1);
  }
  const json = JSON.stringify(items, null, 2) + '\n';
  mkdirSync(join(ROOT, 'generated'), { recursive: true });
  writeFileSync(join(ROOT, 'generated', 'catalog.json'), json);
  mkdirSync(join(ROOT, 'public'), { recursive: true });
  writeFileSync(join(ROOT, 'public', 'catalog.json'), json);
  console.log(
    `catalog: ${items.length} item(s) (${items.filter((i) => i.collection === 'topics').length} topics, ${items.filter((i) => i.collection === 'projects').length} projects, ${items.filter((i) => i.collection === 'books').length} books)`,
  );
  regenTopicsSidebar(parseTopics());
  console.log('build-catalog: OK.');
}

main();
