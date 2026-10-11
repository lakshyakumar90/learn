'use client';

import Link from 'next/link';
import {
  depsCommit,
  librariesByCategory,
  libraryAnchor,
  libraryUnused,
  libraryWorkspaces,
  workspaceHref,
  workspaceTitle,
} from '@/lib/deps-data';

/**
 * The full Tech stack index: every external library grouped by category
 * with its reason and "Used in" folder chips. All data, no hand lists.
 */
export function TechStackIndex({ project = 'excalidraw' }: { project?: string }) {
  const groups = librariesByCategory(project);
  return (
    <div className="flex flex-col gap-8">
      {groups.map(({ category, libs }) => (
        <section key={category} aria-label={category}>
          <h2 id={category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}>{category}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {libs.map((lib) => {
              const users = libraryWorkspaces(project, lib.id);
              return (
                <article
                  key={lib.id}
                  id={libraryAnchor(lib.id)}
                  className="scroll-mt-24 rounded-xl border p-4"
                >
                  <p className="font-semibold">
                    <a href={lib.homepage} target="_blank" rel="noopener noreferrer">
                      {lib.displayName}
                    </a>
                    {libraryUnused(project, lib.id) ? (
                      <span className="ml-2 inline-block rounded-full border px-2 py-0.5 align-middle text-[11px] font-medium opacity-80">
                        Declared but not used in source
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm opacity-80">{lib.why}</p>
                  {users.length > 0 ? (
                    <p className="mt-2 text-xs opacity-70">
                      <span>Used in: </span>
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
                </article>
              );
            })}
          </div>
        </section>
      ))}
      <p className="text-xs opacity-60">Dependencies as of commit {depsCommit(project)}.</p>
    </div>
  );
}
