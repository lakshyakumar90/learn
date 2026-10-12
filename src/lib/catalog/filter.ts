/**
 * Facet filtering + sorting for the shared catalog browser.
 * Logic: AND across different facets, OR within one facet.
 * Pure functions — covered by Vitest.
 */
import type { CatalogItem, SortKey } from './types';

export interface ActiveFilters {
  categories: string[];
  levels: string[];
  tags: string[];
  platforms: string[];
  statuses: string[];
}

export const EMPTY_FILTERS: ActiveFilters = {
  categories: [],
  levels: [],
  tags: [],
  platforms: [],
  statuses: [],
};

export function isFiltering(f: ActiveFilters, query: string): boolean {
  return (
    query.trim() !== '' ||
    f.categories.length > 0 ||
    f.levels.length > 0 ||
    f.tags.length > 0 ||
    f.platforms.length > 0 ||
    f.statuses.length > 0
  );
}

/**
 * A topic with level 'all' spans every level, so it matches any level
 * filter. Same idea could apply elsewhere later; keep the rule here.
 */
function matchesLevel(item: CatalogItem, levels: string[]): boolean {
  if (levels.length === 0) return true;
  if (!item.level) return false;
  if (item.level === 'all') return true;
  return levels.includes(item.level);
}

/** Facet matching only (no text search). `order` is the curated rank. */
export function applyFilters(
  items: CatalogItem[],
  filters: ActiveFilters,
  orderOf: (item: CatalogItem) => number,
): CatalogItem[] {
  return items.filter((item) => {
    if (
      filters.categories.length > 0 &&
      !item.categories.some((c) => filters.categories.includes(c))
    ) {
      return false;
    }
    if (!matchesLevel(item, filters.levels)) return false;
    if (filters.tags.length > 0 && !item.tags.some((t) => filters.tags.includes(t))) {
      return false;
    }
    if (
      filters.platforms.length > 0 &&
      (!item.platform || !filters.platforms.includes(item.platform))
    ) {
      return false;
    }
    if (filters.statuses.length > 0 && !filters.statuses.includes(item.status)) {
      return false;
    }
    return true;
  }).sort((a, b) => orderOf(a) - orderOf(b));
}

export interface FacetOption {
  value: string;
  /** How many items would match if this option were toggled on,
   * given the OTHER active filters (not this facet's own). */
  count: number;
}

/**
 * Counts for one facet, computed against items already filtered by
 * every OTHER facet. `extract` returns the item's values for this facet
 * (respecting the level-'all' rule via `matches`).
 */
function countsFor(
  items: CatalogItem[],
  filters: ActiveFilters,
  facet: keyof ActiveFilters,
  options: string[],
  matches: (item: CatalogItem, value: string) => boolean,
): FacetOption[] {
  const others: ActiveFilters = { ...filters, [facet]: [] };
  const base = applyFilters(items, others, () => 0);
  return options.map((value) => ({
    value,
    count: base.filter((item) => matches(item, value)).length,
  }));
}

export interface FacetCounts {
  categories: FacetOption[];
  levels: FacetOption[];
  tags: FacetOption[];
  platforms: FacetOption[];
  statuses: FacetOption[];
}

export function facetCounts(
  items: CatalogItem[],
  filters: ActiveFilters,
  facetOptions: Omit<Record<keyof ActiveFilters, string[]>, never>,
): FacetCounts {
  return {
    categories: countsFor(items, filters, 'categories', facetOptions.categories, (item, v) =>
      item.categories.includes(v),
    ),
    levels: countsFor(items, filters, 'levels', facetOptions.levels, (item, v) =>
      item.level === 'all' || item.level === v,
    ),
    tags: countsFor(items, filters, 'tags', facetOptions.tags, (item, v) =>
      item.tags.includes(v),
    ),
    platforms: countsFor(items, filters, 'platforms', facetOptions.platforms, (item, v) =>
      item.platform === v,
    ),
    statuses: countsFor(items, filters, 'statuses', facetOptions.statuses, (item, v) =>
      item.status === v,
    ),
  };
}

/** Soon items always sort after live ones; then the chosen sort. */
export function sortItems(items: CatalogItem[], sort: SortKey, orderOf: (item: CatalogItem) => number): CatalogItem[] {
  const statusRank = (s: string): number => (s === 'live' ? 0 : 1);
  return [...items].sort((a, b) => {
    const byStatus = statusRank(a.status) - statusRank(b.status);
    if (byStatus !== 0) return byStatus;
    if (sort === 'az') return a.title.localeCompare(b.title);
    if (sort === 'updated') return (b.updated ?? '').localeCompare(a.updated ?? '');
    return orderOf(a) - orderOf(b);
  });
}
