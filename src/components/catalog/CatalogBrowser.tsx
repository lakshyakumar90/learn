'use client';

/**
 * Shared browser for every collection: search on top, sort menu, left
 * filter panel (bottom sheet on mobile), card grid. Facets come from
 * content/taxonomy.ts — adding a category or tag needs no edit here.
 *
 * URL state (?q=&category=&level=&tag=&platform=&status=&sort=&view=)
 * is read on mount and written with replaceState, so filtered views
 * are shareable and the back button works on static export.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, Search, SlidersHorizontal, X } from 'lucide-react';
import rawCatalog from '../../../generated/catalog.json';
import {
  ITEM_STATUS,
  PLATFORMS,
  TAXONOMY,
  TOPIC_LEVELS,
  type Category,
} from '../../../content/taxonomy';
import {
  applyFilters,
  facetCounts,
  isFiltering,
  sortItems,
  type ActiveFilters,
} from '@/lib/catalog/filter';
import { searchCatalog, toSearchable } from '@/lib/catalog/search';
import {
  DEFAULT_URL_STATE,
  parseCatalogParams,
  serializeCatalogParams,
  type CatalogUrlState,
} from '@/lib/catalog/url';
import { validateCatalog, type CatalogItem, type Collection } from '@/lib/catalog/types';
import { CatalogCard } from './CatalogCard';
import { buildFacetGroups, FilterPanel } from './CatalogFilters';
import { CategoryIcon } from './category-icons';

const ALL_ITEMS = validateCatalog(rawCatalog);

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  all: 'All levels',
};
const PLATFORM_LABEL: Record<string, string> = { web: 'Web', mobile: 'Mobile' };
const STATUS_LABEL: Record<string, string> = { live: 'Live', soon: 'Coming soon' };

/** Initial state: page defaults, then the shared URL (client only). */
function readInitialState(initial?: Partial<CatalogUrlState>): CatalogUrlState {
  const base = { ...DEFAULT_URL_STATE, ...initial };
  if (typeof window === 'undefined') return base;
  return mergeState(base, parseCatalogParams(window.location.search));
}
/** URL overrides the page's initial state only where it says something. */
function mergeState(initial: CatalogUrlState, fromUrl: CatalogUrlState): CatalogUrlState {
  const pick = <T,>(initialV: T[], urlV: T[]): T[] => (urlV.length > 0 ? urlV : initialV);
  return {
    q: fromUrl.q || initial.q,
    categories: pick(initial.categories, fromUrl.categories),
    levels: pick(initial.levels, fromUrl.levels),
    tags: pick(initial.tags, fromUrl.tags),
    platforms: pick(initial.platforms, fromUrl.platforms),
    statuses: pick(initial.statuses, fromUrl.statuses),
    sort: fromUrl.sort !== 'recommended' ? fromUrl.sort : initial.sort,
    grouped: fromUrl.grouped && initial.grouped,
  };
}

function labelFor(collection: Collection, facet: keyof ActiveFilters, value: string): string {
  if (facet === 'categories') {
    return TAXONOMY[collection].categories.find((c) => c.id === value)?.title ?? value;
  }
  if (facet === 'levels') return LEVEL_LABEL[value] ?? value;
  if (facet === 'platforms') return PLATFORM_LABEL[value] ?? value;
  if (facet === 'statuses') return STATUS_LABEL[value] ?? value;
  return value;
}

export function CatalogBrowser({
  collection,
  initial,
  searchPlaceholder,
  badgeBase,
  emptyTitle,
  emptyLine,
}: {
  collection: Collection;
  initial?: Partial<CatalogUrlState>;
  searchPlaceholder: string;
  badgeBase: string;
  emptyTitle: string;
  emptyLine: string;
}) {
  const items = useMemo(() => ALL_ITEMS.filter((i) => i.collection === collection), [collection]);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const taxonomy = TAXONOMY[collection];
  const catRank = useMemo(() => {
    const order = [...taxonomy.categories].sort((a, b) => a.order - b.order);
    return new Map(order.map((c, i) => [c.id, i]));
  }, [taxonomy]);
  const orderOf = useCallback(
    (item: CatalogItem): number =>
      (item.primaryCategory ? (catRank.get(item.primaryCategory) ?? 999) : 0) * 10000 + item.order,
    [catRank],
  );
  const nameOfCategory = useCallback(
    (id: string): string => taxonomy.categories.find((c) => c.id === id)?.title ?? id,
    [taxonomy],
  );
  const searchable = useMemo(() => toSearchable(items, nameOfCategory), [items, nameOfCategory]);

  const [state, setState] = useState<CatalogUrlState>(() => readInitialState(initial));
  const [input, setInput] = useState<string>(() => readInitialState(initial).q);
  /** Last completed search; `q` tells whether it is stale. */
  const [found, setFound] = useState<{ q: string; ids: string[] | null } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const querySeq = useRef(0);

  // Write the URL (debounced so typing stays smooth).
  useEffect(() => {
    const t = window.setTimeout(() => {
      const qs = serializeCatalogParams(state);
      window.history.replaceState(null, '', window.location.pathname + qs);
    }, 300);
    return () => window.clearTimeout(t);
  }, [state]);

  // Debounced query -> state.q.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setState((prev) => (prev.q === input ? prev : { ...prev, q: input }));
    }, 250);
    return () => window.clearTimeout(t);
  }, [input]);

  // Query -> ranked ids via lazy Fuse. The single setState site is the
  // async callback, so clearing the query mid-flight cannot leave a
  // stale "searching" flag behind.
  useEffect(() => {
    const seq = (querySeq.current += 1);
    const q = state.q.trim();
    searchCatalog(searchable, q).then((ids) => {
      if (querySeq.current !== seq) return;
      setFound({ q, ids });
    });
  }, [state.q, searchable]);

  const query = state.q.trim();
  const searching = query !== '' && (!found || found.q !== query);
  /** Stale results stay visible while the next search resolves. */
  const ranked = query === '' ? null : (found && found.q === query ? found.ids : (found?.ids ?? null));

  // "/" focuses search when not typing somewhere already.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key !== '/') return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Escape closes the mobile sheet.
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  const filters: ActiveFilters = useMemo(
    () => ({
      categories: state.categories,
      levels: state.levels,
      tags: state.tags,
      platforms: state.platforms,
      statuses: state.statuses,
    }),
    [state.categories, state.levels, state.tags, state.platforms, state.statuses],
  );
  const filtering = isFiltering(filters, state.q);

  // Facet definitions: only values used by >= 1 item (empty categories
  // stay hidden from the filters; the landing page shows them instead).
  const facetDefs = useMemo(() => {
    const used = (get: (i: CatalogItem) => string[]): Set<string> => {
      const s = new Set<string>();
      for (const i of items) for (const v of get(i)) s.add(v);
      return s;
    };
    const usedCats = used((i) => i.categories);
    const usedTags = used((i) => i.tags);
    const usedPlatforms = used((i) => (i.platform ? [i.platform] : []));
    const usedStatuses = used((i) => [i.status]);
    return {
      categories: taxonomy.categories
        .filter((c) => usedCats.has(c.id))
        .sort((a, b) => a.order - b.order)
        .map((c) => ({ value: c.id, label: c.title })),
      levels:
        collection === 'topics'
          ? TOPIC_LEVELS.filter((l) => l === 'all' || items.some((i) => i.level === l || i.level === 'all')).map(
              (l) => ({ value: l, label: LEVEL_LABEL[l] ?? l }),
            )
          : [],
      tags: taxonomy.tags
        .filter((t) => usedTags.has(t))
        .map((t) => ({ value: t, label: t })),
      platforms: PLATFORMS.filter((p) => usedPlatforms.has(p)).map((p) => ({
        value: p,
        label: PLATFORM_LABEL[p] ?? p,
      })),
      statuses: ITEM_STATUS.filter((s) => usedStatuses.has(s)).map((s) => ({
        value: s,
        label: STATUS_LABEL[s] ?? s,
      })),
    };
  }, [items, taxonomy, collection]);

  const counts = useMemo(
    () =>
      facetCounts(items, filters, {
        categories: facetDefs.categories.map((d) => d.value),
        levels: facetDefs.levels.map((d) => d.value),
        tags: facetDefs.tags.map((d) => d.value),
        platforms: facetDefs.platforms.map((d) => d.value),
        statuses: facetDefs.statuses.map((d) => d.value),
      }),
    [items, filters, facetDefs],
  );

  const groups = useMemo(
    () => buildFacetGroups(collection, facetDefs, counts),
    [collection, facetDefs, counts],
  );

  const toggle = (facet: keyof ActiveFilters, value: string): void => {
    setState((prev) => {
      const key = { categories: 'categories', levels: 'levels', tags: 'tags', platforms: 'platforms', statuses: 'statuses' }[facet] as keyof CatalogUrlState;
      const current = prev[key] as string[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const clearAll = (): void => {
    setInput('');
    setState((prev) => ({ ...DEFAULT_URL_STATE, grouped: prev.grouped }));
  };

  const activeChips = useMemo(() => {
    const out: Array<{ facet: keyof ActiveFilters; value: string; label: string }> = [];
    (Object.keys(filters) as Array<keyof ActiveFilters>).forEach((facet) => {
      for (const value of filters[facet]) {
        out.push({ facet, value, label: labelFor(collection, facet, value) });
      }
    });
    return out;
  }, [filters, collection]);

  // Base list: Fuse rank order when searching, curated otherwise — then
  // facet-filtered (order-preserving), then sorted (live first always).
  const visible = useMemo(() => {
    const base: CatalogItem[] =
      ranked !== null
        ? ranked.map((id) => byId.get(id)).filter((i): i is CatalogItem => Boolean(i))
        : [...items];
    const allowed = new Set(applyFilters(items, filters, () => 0).map((i) => i.id));
    const list = base.filter((i) => allowed.has(i.id));
    if (ranked !== null && state.sort === 'recommended') {
      const lives = list.filter((i) => i.status === 'live');
      const soons = list.filter((i) => i.status !== 'live');
      return [...lives, ...soons];
    }
    return sortItems(list, state.sort, orderOf);
  }, [items, ranked, filters, state.sort, byId, orderOf]);

  const showGrouped = state.grouped && !filtering && taxonomy.categories.length > 0;
  const groupedSections = useMemo(() => {
    if (!showGrouped) return [];
    const order = [...taxonomy.categories].sort((a, b) => a.order - b.order);
    const sections: Array<{ category: Category | null; items: CatalogItem[] }> = [];
    for (const cat of order) {
      const inCat = visible.filter((i) => i.primaryCategory === cat.id);
      if (inCat.length > 0) sections.push({ category: cat, items: inCat });
    }
    const others = visible.filter((i) => !i.primaryCategory);
    if (others.length > 0) sections.push({ category: null, items: others });
    return sections;
  }, [showGrouped, taxonomy, visible]);

  const activeFilterCount = activeChips.length + (state.q.trim() ? 1 : 0);

  return (
    <div>
      {/* Search + sort row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border px-3">
          <Search size={16} className="shrink-0 opacity-50" aria-hidden />
          <label htmlFor={`${collection}-search`} className="sr-only">
            Search {collection}
          </label>
          <input
            ref={searchRef}
            id={`${collection}-search`}
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:opacity-50"
          />
          <kbd
            aria-hidden
            className="hidden shrink-0 rounded border px-1.5 py-0.5 text-[11px] opacity-60 sm:block"
          >
            /
          </kbd>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-medium lg:hidden"
            aria-haspopup="dialog"
          >
            <SlidersHorizontal size={15} aria-hidden />
            Filters
            {activeFilterCount > 0 ? (
              <span
                aria-label={`${activeFilterCount} active filters`}
                className="rounded-full bg-emerald-700 px-2 py-0.5 text-[11px] font-semibold text-white"
              >
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <ArrowUpDown size={15} aria-hidden className="opacity-50" />
          <label htmlFor={`${collection}-sort`} className="sr-only">
            Sort {collection}
          </label>
          <select
            id={`${collection}-sort`}
            value={state.sort}
            onChange={(e) =>
              setState((prev) => ({ ...prev, sort: e.target.value as CatalogUrlState['sort'] }))
            }
            className="h-11 rounded-xl border bg-transparent px-2 text-sm font-medium"
          >
            <option value="recommended">Recommended</option>
            <option value="az">A to Z</option>
            <option value="updated">Recently updated</option>
          </select>
        </div>
      </div>

      {/* Count + chips + view toggle */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p role="status" aria-live="polite" className="text-sm opacity-70">
          {searching
            ? 'Searching…'
            : `${visible.length} result${visible.length === 1 ? '' : 's'}`}
        </p>
        {taxonomy.categories.length > 0 && (
          <div className="ml-auto flex overflow-hidden rounded-lg border text-sm" role="group" aria-label="View">
            <button
              type="button"
              aria-pressed={showGrouped}
              onClick={() => setState((prev) => ({ ...prev, grouped: true }))}
              className={`px-3 py-1.5 font-medium ${showGrouped ? 'bg-stone-200 dark:bg-stone-800' : 'opacity-60 hover:opacity-100'}`}
            >
              Grouped
            </button>
            <button
              type="button"
              aria-pressed={!showGrouped}
              onClick={() => setState((prev) => ({ ...prev, grouped: false }))}
              className={`px-3 py-1.5 font-medium ${!showGrouped ? 'bg-stone-200 dark:bg-stone-800' : 'opacity-60 hover:opacity-100'}`}
            >
              Grid
            </button>
          </div>
        )}
      </div>
      {activeChips.length > 0 || state.q.trim() ? (
        <ul aria-label="Active filters" className="mt-2 flex flex-wrap gap-1.5">
          {state.q.trim() ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  setInput('');
                  setState((prev) => ({ ...prev, q: '' }));
                }}
                aria-label={`Remove search "${state.q.trim()}"`}
                className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-1 text-xs font-medium dark:bg-stone-800"
              >
                “{state.q.trim()}” <X size={12} aria-hidden />
              </button>
            </li>
          ) : null}
          {activeChips.map((chip) => (
            <li key={`${chip.facet}-${chip.value}`}>
              <button
                type="button"
                onClick={() => toggle(chip.facet, chip.value)}
                aria-label={`Remove ${chip.label} filter`}
                className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-1 text-xs font-medium dark:bg-stone-800"
              >
                {chip.label} <X size={12} aria-hidden />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full px-2.5 py-1 text-xs font-medium text-emerald-800 underline dark:text-emerald-200"
            >
              Clear all
            </button>
          </li>
        </ul>
      ) : null}

      <div className="mt-6 flex items-start gap-8">
        {/* Desktop filter panel. `sticky` lives on the aside itself (the
            flex item), so once it reaches the navbar it pins to the screen
            while the results column scrolls normally. The max-h is exact:
            the row now runs to the page bottom (main has no bottom
            padding; the results column carries its own), so the panel may
            be as tall as the viewport minus the top offset — its bottom
            lands flush with the screen end and it can never be pushed up. */}
        {groups.length > 0 ? (
          <aside
            aria-label={`${collection} filters`}
            className="catalog-filters-scroll sticky top-14 hidden max-h-[calc(100dvh-3.5rem)] w-60 shrink-0 self-start overflow-y-auto px-1 pb-8 pt-1 [scrollbar-gutter:stable] lg:block"
          >
            <FilterPanel groups={groups} filters={filters} onToggle={toggle} />
          </aside>
        ) : null}

        {/* Results carry their own bottom padding (the page shell has
            none), so cards never touch the screen end. */}
        <div className="min-w-0 flex-1 pb-12">
          {items.length === 0 || visible.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <Search size={28} aria-hidden className="mx-auto opacity-40" />
              <p className="mt-3 text-lg font-semibold">{emptyTitle}</p>
              <p className="mx-auto mt-1 max-w-sm text-sm opacity-70">{emptyLine}</p>
              {filtering ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : showGrouped ? (
            <div className="flex flex-col gap-10">
              {groupedSections.map(({ category, items: groupItems }) => (
                <section key={category?.id ?? 'other'} aria-labelledby={`group-${category?.id ?? 'other'}`}>
                  <div className="flex items-center gap-2">
                    {category ? <CategoryIcon icon={category.icon} size={18} /> : null}
                    <h2 id={`group-${category?.id ?? 'other'}`} className="text-xl font-semibold tracking-tight">
                      {category ? category.title : 'More'}
                    </h2>
                  </div>
                  {category?.description ? (
                    <p className="mt-1 max-w-2xl text-sm opacity-70">{category.description}</p>
                  ) : null}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {groupItems.map((item) => (
                      <CatalogCard key={item.id} item={item} query={state.q} badgeBase={badgeBase} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((item) => (
                <CatalogCard key={item.id} item={item} query={state.q} badgeBase={badgeBase} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      {sheetOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 cursor-default bg-black/40"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t bg-white p-5 dark:bg-stone-950">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close filters"
                className="ml-auto rounded-lg border p-2"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
            <div className="mt-4">
              <FilterPanel groups={groups} filters={filters} onToggle={toggle} />
            </div>
            <div className="sticky bottom-0 mt-5 flex gap-2 bg-white py-2 dark:bg-stone-950">
              <button
                type="button"
                onClick={clearAll}
                className="h-11 flex-1 rounded-xl border text-sm font-medium"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="h-11 flex-1 rounded-xl bg-emerald-700 text-sm font-medium text-white"
              >
                Apply{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
