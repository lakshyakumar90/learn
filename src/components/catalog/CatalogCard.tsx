'use client';

/**
 * One catalog card for any collection. Live items link to their docs;
 * soon items are plain blocks with aria-disabled and sort last.
 */
import Link from 'next/link';
import type { CatalogItem } from '@/lib/catalog/types';
import { TAXONOMY } from '../../../content/taxonomy';
import { CategoryIcon, gradientFor } from './category-icons';
import { Highlight } from './highlight';

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  all: 'All levels',
};

const PLATFORM_LABEL: Record<string, string> = { web: 'Web', mobile: 'Mobile' };

function categoryTitle(collection: CatalogItem['collection'], id: string): string {
  return TAXONOMY[collection].categories.find((c) => c.id === id)?.title ?? id;
}

export function CatalogCard({
  item,
  query,
  badgeBase,
}: {
  item: CatalogItem;
  query: string;
  /** Base URL badge links point at (/topics?category= or /projects?tag= …). */
  badgeBase: string;
}) {
  const live = item.status === 'live';
  const primaryIcon =
    TAXONOMY[item.collection].categories.find((c) => c.id === item.primaryCategory)?.icon ?? 'book';

  const cover = item.cover ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.cover}
      alt={`${item.title} cover`}
      loading="lazy"
      decoding="async"
      className="aspect-[16/9] w-full rounded-lg border object-cover"
    />
  ) : (
    <span
      aria-hidden
      style={{ background: gradientFor(item.primaryCategory ?? item.id) }}
      className="flex aspect-[16/9] w-full items-center justify-center rounded-lg text-white"
    >
      <CategoryIcon icon={primaryIcon} size={36} />
    </span>
  );

  const title = live ? (
    <Link href={item.href} className="font-semibold hover:underline">
      <Highlight text={item.title} query={query} />
    </Link>
  ) : (
    <span className="font-semibold">
      <Highlight text={item.title} query={query} />
    </span>
  );

  return (
    <article
      aria-disabled={live ? undefined : 'true'}
      aria-label={`${item.title}${live ? '' : ' (coming soon)'}`}
      className={`flex flex-col rounded-xl border p-4 ${live ? '' : 'border-dashed opacity-80'}`}
    >
      {cover}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {live ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
            Live
          </span>
        ) : (
          <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium opacity-70">
            Coming soon
          </span>
        )}
        {item.level ? (
          <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium opacity-70">
            {LEVEL_LABEL[item.level] ?? item.level}
          </span>
        ) : null}
        {item.platform ? (
          <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium opacity-70">
            {PLATFORM_LABEL[item.platform] ?? item.platform}
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 text-lg leading-snug">{title}</h3>
      <p className="mt-1 line-clamp-2 min-h-10 text-sm opacity-70">
        <Highlight text={item.summary} query={query} />
      </p>
      {(item.categories.length > 0 || item.tags.length > 0) && (
        <ul aria-label="Classifications" className="mt-2 flex flex-wrap gap-1.5">
          {item.categories.map((c) => (
            <li key={`c-${c}`}>
              <Link
                href={`${badgeBase}category=${encodeURIComponent(c)}`}
                className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium hover:underline dark:bg-stone-900"
              >
                {categoryTitle(item.collection, c)}
              </Link>
            </li>
          ))}
          {item.tags.slice(0, 3).map((t) => (
            <li
              key={`t-${t}`}
              className="rounded-md border px-2 py-0.5 text-xs opacity-70"
            >
              <Highlight text={t} query={query} />
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
