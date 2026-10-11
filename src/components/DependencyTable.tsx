'use client';

import Link from 'next/link';
import { siteConfig } from '@/site.config';
import {
  CATEGORY_ORDER,
  getLibrary,
  getWorkspace,
  isAggregateKey,
  resolveWorkspaces,
  workspaceHref,
  workspaceTitle,
  type DepEntry,
} from '@/lib/deps-data';

function isTypesRow(ids: string[]): boolean {
  return ids.length > 0 && ids.every((id) => id.startsWith('@types/'));
}

function WhyCell({ dep, workspacePath }: { dep: DepEntry; workspacePath: string }) {
  const lib = getLibrary(dep.name);
  const note = lib?.uses?.[workspacePath];
  return <>{note ?? lib?.why ?? ''}</>;
}

function LibraryCell({ dep }: { dep: DepEntry }) {
  const lib = getLibrary(dep.name);
  const label = lib?.displayName ?? dep.name;
  if (!lib?.homepage) return <code>{label}</code>;
  return (
    <a href={lib.homepage} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

function UnusedBadge() {
  return (
    <span className="ml-2 inline-block rounded-full border px-2 py-0.5 align-middle text-[11px] font-medium opacity-80">
      Declared but not used in source
    </span>
  );
}

function DepTable({ deps, workspacePath }: { deps: DepEntry[]; workspacePath: string }) {
  const byCategory = new Map<string, DepEntry[]>();
  for (const dep of deps) {
    const cat = getLibrary(dep.name)?.category ?? 'Other';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(dep);
  }
  const ordered = [...byCategory.entries()].sort(
    ([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );

  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Library</th>
            <th>Version range</th>
            <th>Why it is used here</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map(([category, items]) => {
            const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
            if (isTypesRow(sorted.map((d) => d.name))) {
              const ranges = [...new Set(sorted.map((d) => d.versionRange))].join(', ');
              return (
                <tr key={category}>
                  <td>
                    <span className="font-medium">TypeScript type definitions</span>
                    <span className="block text-xs opacity-60">
                      {sorted.map((d) => d.name).join(', ')}
                    </span>
                  </td>
                  <td>
                    <code>{ranges}</code>
                  </td>
                  <td>Type declarations for the packages used here.</td>
                </tr>
              );
            }
            return sorted.map((dep) => (
              <tr key={dep.name}>
                <td>
                  <LibraryCell dep={dep} />
                  {dep.kind === 'dependency' && !dep.used ? <UnusedBadge /> : null}
                </td>
                <td>
                  <code>{dep.versionRange}</code>
                </td>
                <td>
                  <WhyCell dep={dep} workspacePath={workspacePath} />
                </td>
              </tr>
            ));
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Data-driven dependency table. `workspace` is a workspace path
 * (apps/web), 'apps'/'packages' for group summaries, 'packages/tooling'
 * for both config packages, or 'root'/'.' for the repo root.
 */
export function DependencyTable({ workspace }: { workspace: string }) {
  const paths = resolveWorkspaces(workspace);

  if (paths.length === 0) {
    return (
      <p role="note" className="text-sm opacity-70">
        Unknown workspace “{workspace}”.
      </p>
    );
  }

  if (isAggregateKey(workspace)) {
    const counts = new Map<string, Set<string>>();
    for (const path of paths) {
      const ws = getWorkspace(path);
      if (!ws) continue;
      for (const dep of ws.deps) {
        if (dep.internal) continue;
        if (!counts.has(dep.name)) counts.set(dep.name, new Set());
        counts.get(dep.name)!.add(path);
      }
    }
    const top = [...counts.entries()]
      .sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]))
      .slice(0, 8);
    const children = paths.filter((p) => getWorkspace(p));
    return (
      <div>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Library</th>
                <th>Why</th>
                <th>Workspaces</th>
              </tr>
            </thead>
            <tbody>
              {top.map(([name, users]) => {
                const lib = getLibrary(name);
                return (
                  <tr key={name}>
                    <td>
                      <LibraryCell dep={{ name, versionRange: '', kind: 'dependency', internal: false, used: true }} />
                    </td>
                    <td>{lib?.why ?? ''}</td>
                    <td className="tabular-nums">{users.size}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm">
          <span className="font-medium">In this group: </span>
          {children.map((p, i) => (
            <span key={p}>
              <Link href={workspaceHref(p)}>{workspaceTitle(p)}</Link>
              {i < children.length - 1 ? ' · ' : ''}
            </span>
          ))}
        </p>
        <p className="mt-2 text-xs opacity-60">Dependencies as of commit {siteConfig.excalidrawCommit}.</p>
      </div>
    );
  }

  // Single workspace, or the tooling pair (render one table each).
  return (
    <div className="flex flex-col gap-6">
      {paths.map((path) => {
        const ws = getWorkspace(path);
        if (!ws) return null;
        const runtime = ws.deps.filter((d) => !d.internal && d.kind === 'dependency');
        const dev = ws.deps.filter((d) => !d.internal && d.kind !== 'dependency');
        const showTitle = paths.length > 1;
        return (
          <section key={path} aria-label={showTitle ? `Dependencies of ${path}` : undefined}>
            {showTitle ? <h3 className="!mt-0 text-base font-semibold">{workspaceTitle(path)}</h3> : null}
            {runtime.length > 0 ? (
              <DepTable deps={runtime} workspacePath={path} />
            ) : (
              <p className="text-sm opacity-70">No runtime dependencies.</p>
            )}
            {dev.length > 0 ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Development and tooling ({dev.length})
                </summary>
                <div className="mt-2">
                  <DepTable deps={dev} workspacePath={path} />
                </div>
              </details>
            ) : null}
            {runtime.length === 0 && dev.length === 0 ? (
              <p className="text-sm opacity-70">No dependencies.</p>
            ) : null}
          </section>
        );
      })}
      <p className="text-xs opacity-60">Dependencies as of commit {siteConfig.excalidrawCommit}.</p>
    </div>
  );
}
