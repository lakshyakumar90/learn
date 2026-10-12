/**
 * URL parsing/serialization round-trips; search ranking weights title
 * above tags above keywords above summary.
 */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_URL_STATE,
  parseCatalogParams,
  serializeCatalogParams,
} from '../src/lib/catalog/url';
import { searchCatalog, tokenSearch, toSearchable } from '../src/lib/catalog/search';
import type { CatalogItem } from '../src/lib/catalog/types';

describe('catalog URL state', () => {
  it('round-trips a full filter set', () => {
    const state = {
      ...DEFAULT_URL_STATE,
      q: 'event loop',
      categories: ['languages', 'orms'],
      levels: ['beginner'],
      tags: ['Async'],
      platforms: ['web'],
      statuses: ['live'],
      sort: 'az' as const,
      grouped: false,
    };
    const qs = serializeCatalogParams(state);
    expect(qs).toContain('q=event+loop');
    expect(qs).toContain('category=languages%2Corms');
    expect(qs).toContain('view=flat');
    expect(parseCatalogParams(qs)).toEqual(state);
  });

  it('an empty state serializes to nothing and parses back to defaults', () => {
    expect(serializeCatalogParams(DEFAULT_URL_STATE)).toBe('');
    expect(parseCatalogParams('')).toEqual(DEFAULT_URL_STATE);
  });

  it('ignores an unknown sort key', () => {
    expect(parseCatalogParams('?sort=bogus').sort).toBe('recommended');
  });
});

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

const nameOf = (id: string): string =>
  ({ languages: 'Languages', orms: 'ORMs & Database Tools' })[id] ?? id;

describe('catalog search', () => {
  const docs = toSearchable(
    [
      item({ id: 'js', title: 'JavaScript', summary: 'a language for the web', tags: ['Language'], keywords: ['event loop', 'closure', 'promise'] }),
      item({ id: 'prisma', title: 'Prisma', summary: 'javascript orm for databases', tags: ['ORM'], keywords: ['schema'] }),
      item({ id: 'misc', title: 'Misc', summary: 'mentions javascript once', tags: [], keywords: [] }),
    ],
    nameOf,
  );

  it('ranks a title hit above a summary-only hit (token fallback)', () => {
    const out = tokenSearch(docs, 'javascript');
    expect(out.map((i) => i.id)).toEqual(['js', 'prisma', 'misc']);
  });

  it('finds keyword hits like "event loop"', () => {
    expect(tokenSearch(docs, 'event loop').map((i) => i.id)).toEqual(['js']);
  });

  it('Fuse ranks the same way: title > keyword > summary', async () => {
    const ranked = await searchCatalog(docs, 'javascript');
    expect(ranked?.[0]).toBe('js');
    expect(ranked).toContain('prisma');
    const events = await searchCatalog(docs, 'event loop');
    expect(events?.[0]).toBe('js');
  });

  it('blank queries return null (no search)', async () => {
    expect(await searchCatalog(docs, '   ')).toBeNull();
  });
});
