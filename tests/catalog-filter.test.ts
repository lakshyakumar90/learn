/**
 * Filter logic: AND across facets, OR within one facet; level 'all'
 * spans every level; soon sorts after live.
 */
import { describe, expect, it } from 'vitest';
import {
  applyFilters,
  EMPTY_FILTERS,
  facetCounts,
  type ActiveFilters,
} from '../src/lib/catalog/filter';
import type { CatalogItem } from '../src/lib/catalog/types';
import { sortItems } from '../src/lib/catalog/filter';

function item(over: Partial<CatalogItem> & { id: string }): CatalogItem {
  return {
    collection: 'topics',
    title: over.id,
    summary: 'summary',
    categories: [],
    primaryCategory: null,
    tags: [],
    status: 'live',
    href: `/topics/${over.id}`,
    keywords: [],
    order: 999,
    ...over,
  } as CatalogItem;
}

const ITEMS: CatalogItem[] = [
  item({ id: 'js', categories: ['languages'], primaryCategory: 'languages', tags: ['Language', 'Async'], level: 'all', order: 1 }),
  item({ id: 'prisma', categories: ['orms'], primaryCategory: 'orms', tags: ['ORM', 'SQL'], level: 'beginner', status: 'soon', order: 2 }),
  item({ id: 'drizzle', categories: ['orms'], primaryCategory: 'orms', tags: ['ORM', 'SQL'], level: 'beginner', status: 'soon', order: 3 }),
  item({ id: 'web-proj', collection: 'projects', categories: [], primaryCategory: null, tags: ['Next.js'], platform: 'web', order: 0 }),
  item({ id: 'mob-proj', collection: 'projects', categories: [], primaryCategory: null, tags: ['Expo'], platform: 'mobile', order: 1 }),
];

const filters = (over: Partial<ActiveFilters>): ActiveFilters => ({ ...EMPTY_FILTERS, ...over });

describe('applyFilters', () => {
  it('returns everything with no filters', () => {
    expect(applyFilters(ITEMS, EMPTY_FILTERS, () => 0)).toHaveLength(5);
  });

  it('ORs within one facet', () => {
    const out = applyFilters(ITEMS, filters({ categories: ['languages', 'orms'] }), () => 0);
    expect(out.map((i) => i.id).sort()).toEqual(['drizzle', 'js', 'prisma']);
  });

  it('ANDs across facets', () => {
    const out = applyFilters(
      ITEMS,
      filters({ categories: ['orms'], tags: ['SQL'], statuses: ['soon'] }),
      () => 0,
    );
    expect(out.map((i) => i.id).sort()).toEqual(['drizzle', 'prisma']);
  });

  it('a level-all topic matches any level filter', () => {
    const out = applyFilters(ITEMS, filters({ levels: ['advanced'] }), () => 0);
    expect(out.map((i) => i.id)).toEqual(['js']);
  });

  it('narrows platforms independently of topic facets', () => {
    const out = applyFilters(ITEMS, filters({ platforms: ['mobile'] }), () => 0);
    expect(out.map((i) => i.id)).toEqual(['mob-proj']);
  });
});

describe('facetCounts', () => {
  it('counts from the OTHER active filters, not its own facet', () => {
    const counts = facetCounts(
      ITEMS,
      filters({ categories: ['orms'] }),
      {
        categories: ['languages', 'orms'],
        levels: [],
        tags: ['ORM', 'SQL', 'Language'],
        platforms: [],
        statuses: [],
      },
    );
    // Category counts ignore the category filter: both visible.
    expect(counts.categories).toEqual([
      { value: 'languages', count: 1 },
      { value: 'orms', count: 2 },
    ]);
    // Tag counts respect it: only orms items counted.
    expect(counts.tags).toEqual([
      { value: 'ORM', count: 2 },
      { value: 'SQL', count: 2 },
      { value: 'Language', count: 0 },
    ]);
  });
});

describe('sortItems', () => {
  it('sorts soon after live regardless of sort key', () => {
    const out = sortItems(ITEMS, 'az', () => 0);
    expect(out[out.length - 1].status).toBe('soon');
    expect(out[out.length - 2].status).toBe('soon');
    expect(out.map((i) => i.id)).toEqual(['js', 'mob-proj', 'web-proj', 'drizzle', 'prisma']);
  });
});
