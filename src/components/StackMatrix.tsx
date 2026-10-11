'use client';

import Link from 'next/link';
import {
  getLibrary,
  keyLibraries,
  languageLine,
  libraryAnchor,
  workspaceHref,
  workspaceTitle,
  workspaces,
} from '@/lib/deps-data';

const MATRIX_ORDER = [
  'apps/web',
  'apps/http-server',
  'apps/ws-server',
  'apps/flush-worker',
  'packages/common',
  'packages/engine',
  'packages/backend-common',
  'packages/db',
  'packages/auth',
  'packages/redis',
  'packages/validations',
  'packages/ui',
  'packages/eslint-config',
  'packages/typescript-config',
];

function orderedWorkspaces() {
  const byPath = new Map(workspaces.map((w) => [w.path, w]));
  return MATRIX_ORDER.filter((p) => byPath.has(p)).map((p) => byPath.get(p)!);
}

function Chips({ path }: { path: string }) {
  const keys = keyLibraries(path);
  if (keys.length === 0) return <span className="opacity-50">—</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {keys.map((id) => (
        <Link
          key={id}
          href={`/projects/excalidraw/tech-stack#${libraryAnchor(id)}`}
          className="rounded-md border px-2 py-0.5 text-xs transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
        >
          {getLibrary(id)?.displayName ?? id}
        </Link>
      ))}
    </span>
  );
}

/**
 * One row per workspace: workspace, role, language/runtime, key libraries.
 * Table on desktop, stacked cards on mobile.
 */
export function StackMatrix() {
  const rows = orderedWorkspaces();
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table>
          <thead>
            <tr>
              <th>Workspace</th>
              <th>Role</th>
              <th>Language and runtime</th>
              <th>Key libraries</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.path}>
                <td>
                  <Link href={workspaceHref(w.path)}>{workspaceTitle(w.path)}</Link>
                </td>
                <td>{w.role}</td>
                <td>
                  {languageLine(w.fileCounts)}
                  {w.runtime ? <span className="opacity-60"> · {w.runtime}</span> : null}
                </td>
                <td>
                  <Chips path={w.path} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((w) => (
          <article key={w.path} className="rounded-xl border p-4">
            <Link href={workspaceHref(w.path)} className="font-semibold">
              {workspaceTitle(w.path)}
            </Link>
            <p className="mt-1 text-sm opacity-70">{w.role}</p>
            <p className="mt-2 text-xs opacity-60">
              {languageLine(w.fileCounts)}
              {w.runtime ? ` · ${w.runtime}` : ''}
            </p>
            <div className="mt-2">
              <Chips path={w.path} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
