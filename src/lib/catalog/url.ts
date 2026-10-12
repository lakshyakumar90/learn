/**
 * URL state for the catalog browser: ?q=&category=a,b&level=&tag=
 * &platform=&status=&sort=&view=. Pure parse/serialize, Vitest-covered.
 * The browser reads this on mount and writes with replaceState, so the
 * back button works and filtered views are shareable on static export.
 */
import type { SortKey } from './types';
import { SORTS } from './types';

export interface CatalogUrlState {
  q: string;
  categories: string[];
  levels: string[];
  tags: string[];
  platforms: string[];
  statuses: string[];
  sort: SortKey;
  grouped: boolean;
}

export const DEFAULT_URL_STATE: CatalogUrlState = {
  q: '',
  categories: [],
  levels: [],
  tags: [],
  platforms: [],
  statuses: [],
  sort: 'recommended',
  grouped: true,
};

function csv(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export function parseCatalogParams(search: string): CatalogUrlState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const sort = params.get('sort');
  const view = params.get('view');
  return {
    q: params.get('q') ?? '',
    categories: csv(params.get('category')),
    levels: csv(params.get('level')),
    tags: csv(params.get('tag')),
    platforms: csv(params.get('platform')),
    statuses: csv(params.get('status')),
    sort: sort && (SORTS as readonly string[]).includes(sort) ? (sort as SortKey) : 'recommended',
    grouped: view ? view !== 'flat' : true,
  };
}

export function serializeCatalogParams(state: CatalogUrlState): string {
  const params = new URLSearchParams();
  if (state.q.trim()) params.set('q', state.q.trim());
  if (state.categories.length > 0) params.set('category', state.categories.join(','));
  if (state.levels.length > 0) params.set('level', state.levels.join(','));
  if (state.tags.length > 0) params.set('tag', state.tags.join(','));
  if (state.platforms.length > 0) params.set('platform', state.platforms.join(','));
  if (state.statuses.length > 0) params.set('status', state.statuses.join(','));
  if (state.sort !== 'recommended') params.set('sort', state.sort);
  if (!state.grouped) params.set('view', 'flat');
  const out = params.toString();
  return out ? `?${out}` : '';
}
