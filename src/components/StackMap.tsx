'use client';

import Link from 'next/link';
import { useState } from 'react';
import { X } from 'lucide-react';
import {
  librariesByCategory,
  libraryAnchor,
  libraryWorkspaces,
  workspaceHref,
  workspaceTitle,
} from '@/lib/deps-data';

const ROWS: Array<{ title: string; categories: string[]; color: string }> = [
  {
    title: 'Language and tooling',
    categories: ['Language and build', 'Monorepo tooling'],
    color: 'var(--dg-shared)',
  },
  {
    title: 'Frontend',
    categories: ['Frontend framework', 'UI and styling', 'State', 'Rendering and canvas'],
    color: 'var(--dg-browser)',
  },
  {
    title: 'Realtime and backend',
    categories: ['Realtime and queues', 'Realtime', 'Backend framework', 'Auth and email'],
    color: 'var(--dg-realtime)',
  },
  {
    title: 'Data',
    categories: ['Database and ORM', 'Database and ODM'],
    color: 'var(--dg-database)',
  },
  {
    title: 'External services',
    categories: ['File storage', 'Email'],
    color: 'var(--dg-api)',
  },
  {
    title: 'Quality',
    categories: ['Validation', 'Testing', 'Linting and formatting'],
    color: 'var(--dg-api)',
  },
];

/**
 * Compact layered map of the stack for the Introduction. Chips reuse the
 * site's color-by-layer variables; selecting one opens a detail card with
 * its reason, the folders using it, and a link to the Tech stack page.
 */
export function StackMap({ project = 'excalidraw' }: { project?: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const groups = librariesByCategory(project);

  const selectedLib = selected
    ? groups.flatMap((g) => g.libs).find((l) => l.id === selected)
    : undefined;
  const users = selected ? libraryWorkspaces(project, selected) : [];

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === 'Escape') setSelected(null);
      }}
    >
      <div className="flex flex-col gap-2">
        {ROWS.map((row) => {
          const libs = groups
            .filter((g) => row.categories.includes(g.category))
            .flatMap((g) => g.libs);
          if (libs.length === 0) return null;
          return (
            <div key={row.title} className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
              <p className="w-40 shrink-0 pt-1 text-xs font-medium uppercase tracking-wider opacity-60">
                {row.title}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {libs.map((lib) => (
                  <button
                    key={lib.id}
                    type="button"
                    onClick={() => setSelected((s) => (s === lib.id ? null : lib.id))}
                    aria-expanded={selected === lib.id}
                    aria-label={`${lib.displayName}: ${lib.why}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors hover:bg-stone-100 dark:hover:bg-stone-900 ${
                      selected === lib.id ? 'border-current font-semibold' : ''
                    }`}
                  >
                    <span
                      aria-hidden
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: row.color }}
                    />
                    {lib.displayName}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedLib ? (
        <div className="mt-4 rounded-xl border p-4" role="region" aria-label={`${selectedLib.displayName} details`}>
          <div className="flex items-start gap-2">
            <p className="font-semibold">{selectedLib.displayName}</p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close details"
              className="ml-auto inline-flex min-h-8 min-w-8 items-center justify-center rounded-md border"
            >
              <X size={14} aria-hidden />
            </button>
          </div>
          <p className="mt-1 text-sm opacity-80">{selectedLib.why}</p>
          {users.length > 0 ? (
            <p className="mt-2 text-sm">
              <span className="opacity-60">Used in: </span>
              {users.map((p, i) => (
                <span key={p}>
                  <Link href={workspaceHref(project, p)} className="underline">
                    {workspaceTitle(p, project)}
                  </Link>
                  {i < users.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          ) : null}
          <p className="mt-2 text-sm">
            <Link
              href={`/projects/${project}/tech-stack#${libraryAnchor(selectedLib.id)}`}
              className="underline"
            >
              Tech stack page
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
