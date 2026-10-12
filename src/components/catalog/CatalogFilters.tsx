'use client';

/**
 * One filter panel for any collection. Facet groups come from the
 * collection's taxonomy + live counts — no per-collection markup.
 */
import { useId } from 'react';
import type { ActiveFilters, FacetCounts } from '@/lib/catalog/filter';
import type { Collection } from '@/lib/catalog/types';

export interface FacetGroup {
  key: keyof ActiveFilters;
  legend: string;
  options: Array<{ value: string; label: string; count: number }>;
}

export function buildFacetGroups(
  collection: Collection,
  facets: {
    categories: Array<{ value: string; label: string }>;
    levels: Array<{ value: string; label: string }>;
    tags: Array<{ value: string; label: string }>;
    platforms: Array<{ value: string; label: string }>;
    statuses: Array<{ value: string; label: string }>;
  },
  counts: FacetCounts,
): FacetGroup[] {
  const pick = (
    key: keyof ActiveFilters,
    defs: Array<{ value: string; label: string }>,
  ): FacetGroup => ({
    key,
    legend: { categories: 'Category', levels: 'Level', tags: 'Tags', platforms: 'Platform', statuses: 'Status' }[key],
    options: defs.map((d) => ({
      ...d,
      count: counts[key].find((c) => c.value === d.value)?.count ?? 0,
    })),
  });
  if (collection === 'projects') {
    return [pick('platforms', facets.platforms), pick('tags', facets.tags), pick('statuses', facets.statuses)];
  }
  return [
    ...(facets.categories.length > 0 ? [pick('categories', facets.categories)] : []),
    ...(facets.levels.length > 0 ? [pick('levels', facets.levels)] : []),
    ...(facets.tags.length > 0 ? [pick('tags', facets.tags)] : []),
  ];
}

export function FilterPanel({
  groups,
  filters,
  onToggle,
}: {
  groups: FacetGroup[];
  filters: ActiveFilters;
  onToggle: (facet: keyof ActiveFilters, value: string) => void;
}) {
  const uid = useId();
  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <fieldset key={group.key}>
          <legend className="text-xs font-semibold uppercase tracking-wider opacity-60">
            {group.legend}
          </legend>
          <ul className="mt-2 flex flex-col gap-1">
            {group.options.map((opt) => {
              const id = `${uid}-${group.key}-${opt.value}`;
              const checked = filters[group.key].includes(opt.value);
              return (
                <li key={opt.value}>
                  <label
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-900"
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(group.key, opt.value)}
                      className="h-4 w-4 shrink-0 accent-emerald-700"
                    />
                    <span className="flex-1">{opt.label}</span>
                    <span aria-label={`${opt.count} items`} className="text-xs tabular-nums opacity-50">
                      {opt.count}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
    </div>
  );
}
