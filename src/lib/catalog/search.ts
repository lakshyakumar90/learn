/**
 * Client-side fuzzy search over catalog items. Fuse.js is lazy-loaded
 * (dynamic import) so only the browser pages pay for it.
 * Weighted: title > tags > keywords > summary > category names.
 */
import type { CatalogItem } from './types';

export interface SearchableItem extends CatalogItem {
  categoryNames: string;
}

export function toSearchable(items: CatalogItem[], nameOfCategory: (id: string) => string): SearchableItem[] {
  return items.map((item) => ({
    ...item,
    categoryNames: item.categories.map(nameOfCategory).join(' '),
  }));
}

type FuseInstance = {
  search: (query: string) => Array<{ item: SearchableItem }>;
};

type FuseConstructor = new (
  items: SearchableItem[],
  options: Record<string, unknown>,
) => FuseInstance;

let fuseCtorPromise: Promise<FuseConstructor> | null = null;

function loadFuseCtor(): Promise<FuseConstructor> {
  if (!fuseCtorPromise) {
    fuseCtorPromise = import('fuse.js').then(
      ({ default: Fuse }) => Fuse as unknown as FuseConstructor,
    );
  }
  return fuseCtorPromise;
}

/**
 * Ranked item ids for a query (best match first). Returns null when the
 * query is blank (no search). The index is built per call — the catalog
 * is small — while the Fuse module itself loads only once.
 */
export async function searchCatalog(
  items: SearchableItem[],
  query: string,
): Promise<string[] | null> {
  const q = query.trim();
  if (!q) return null;
  const Fuse = await loadFuseCtor();
  const fuse = new Fuse(items, {
    keys: [
      { name: 'title', weight: 3 },
      { name: 'tags', weight: 2 },
      { name: 'keywords', weight: 1.5 },
      { name: 'summary', weight: 1 },
      { name: 'categoryNames', weight: 1 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    includeMatches: true,
  });
  return fuse.search(q).map((r) => r.item.id);
}

/** Synchronous token fallback used by tests and Ctrl+K (no Fuse load). */
export function tokenSearch(items: SearchableItem[], query: string): CatalogItem[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return items;
  const scored = items.map((item) => {
    const title = item.title.toLowerCase();
    const tags = item.tags.join(' ').toLowerCase();
    const keywords = item.keywords.join(' ').toLowerCase();
    const summary = item.summary.toLowerCase();
    const cats = item.categoryNames.toLowerCase();
    let rank = 0;
    for (const t of tokens) {
      if (title.includes(t)) rank += 5;
      if (tags.includes(t)) rank += 3;
      if (keywords.includes(t)) rank += 2;
      if (summary.includes(t)) rank += 1;
      if (cats.includes(t)) rank += 1;
    }
    return { item, rank };
  });
  return scored
    .filter((s) => s.rank > 0)
    .sort((a, b) => b.rank - a.rank)
    .map((s) => s.item);
}
