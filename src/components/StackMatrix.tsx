'use client';

import Link from 'next/link';
import {
  getLibrary,
  keyLibraries,
  languageLine,
  libraryAnchor,
  workspaceHref,
  workspaceTitle,
  workspacesOf,
} from '@/lib/deps-data';
import { getProject as getProjectConfig } from '@/projects.config';

function orderedWorkspaces(project: string) {
  const order = getProjectConfig(project)?.workspaces ?? [];
  const byPath = new Map(workspacesOf(project).map((w) => [w.path, w]));
  return order.filter((p) => byPath.has(p)).map((p) => byPath.get(p)!);
}

function Chips({ path, project }: { path: string; project: string }) {
  const keys = keyLibraries(project, path);
  if (keys.length === 0) return <span className="opacity-50">—</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {keys.map((id) => (
        <Link
          key={id}
          href={`/projects/${project}/tech-stack#${libraryAnchor(id)}`}
          className="rounded-md border px-2 py-0.5 text-xs transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
        >
          {getLibrary(project, id)?.displayName ?? id}
        </Link>
      ))}
    </span>
  );
}

/**
 * One row per workspace: workspace, role, language/runtime, key libraries.
 * Table on desktop, stacked cards on mobile.
 */
export function StackMatrix({ project = 'excalidraw' }: { project?: string }) {
  const rows = orderedWorkspaces(project);
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
                  <Link href={workspaceHref(project, w.path)}>{workspaceTitle(w.path, project)}</Link>
                </td>
                <td>{w.role}</td>
                <td>
                  {languageLine(w.fileCounts)}
                  {w.runtime ? <span className="opacity-60"> · {w.runtime}</span> : null}
                </td>
                <td>
                  <Chips path={w.path} project={project} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((w) => (
          <article key={w.path} className="rounded-xl border p-4">
            <Link href={workspaceHref(project, w.path)} className="font-semibold">
              {workspaceTitle(w.path, project)}
            </Link>
            <p className="mt-1 text-sm opacity-70">{w.role}</p>
            <p className="mt-2 text-xs opacity-60">
              {languageLine(w.fileCounts)}
              {w.runtime ? ` · ${w.runtime}` : ''}
            </p>
            <div className="mt-2">
              <Chips path={w.path} project={project} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
