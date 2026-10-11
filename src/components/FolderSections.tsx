import Link from 'next/link';
import { Diagram } from './Diagram';
import { DependencyTable } from './DependencyTable';
import { siteConfig } from '@/site.config';
import {
  getWorkspace,
  resolveWorkspaces,
  workspaceHref,
  workspaceTitle,
} from '@/lib/deps-data';
import type { DocFrontmatter } from '@/lib/doc-schema';

function isFileEntry(v: unknown): v is { file: string; purpose: string } {
  if (typeof v !== 'object' || v === null) return false;
  const e = v as Record<string, unknown>;
  return typeof e.file === 'string' && typeof e.purpose === 'string';
}

function isTalkEntry(v: unknown): v is { label: string; href: string } {
  if (typeof v !== 'object' || v === null) return false;
  const e = v as Record<string, unknown>;
  return typeof e.label === 'string' && typeof e.href === 'string';
}

/** Internal @repo/* deps as folder-page links (single source of truth). */
function internalLinks(workspaceKey: string): Array<{ label: string; href: string }> {
  const out: Array<{ label: string; href: string }> = [];
  const seen = new Set<string>();
  const paths =
    workspaceKey === 'packages/tooling'
      ? ['packages/eslint-config', 'packages/typescript-config']
      : resolveWorkspaces(workspaceKey);
  if (workspaceKey === 'apps' || workspaceKey === 'packages') return out;
  for (const path of paths) {
    const ws = getWorkspace(path);
    if (!ws) continue;
    for (const dep of ws.deps) {
      if (!dep.internal || !dep.name.startsWith('@repo/')) continue;
      const target = `packages/${dep.name.slice('@repo/'.length)}`;
      const href = workspaceHref(target);
      if (seen.has(href)) continue;
      seen.add(href);
      out.push({ label: workspaceTitle(target), href });
    }
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Renders the front-matter-driven sections shared by every page:
 * "What it owns", the files table, dependencies (data-driven),
 * at most one diagram, "Talks to" links, and the Source line.
 * Adding a project or topic needs no changes here.
 */
export function PageSections({
  data,
  workspaceKey,
}: {
  data: DocFrontmatter;
  workspaceKey?: string;
}) {
  const owns = Array.isArray(data.owns) ? data.owns.filter((o): o is string => typeof o === 'string') : [];
  const files = Array.isArray(data.files) ? data.files.filter(isFileEntry) : [];
  const manualTalks = Array.isArray(data.talksTo) ? data.talksTo.filter(isTalkEntry) : [];
  const sources = Array.isArray(data.sources)
    ? data.sources.filter((s): s is string => typeof s === 'string')
    : [];

  const internal = workspaceKey ? internalLinks(workspaceKey) : [];
  const talksTo = [...manualTalks];
  for (const auto of internal) {
    if (!talksTo.some((t) => t.href.toLowerCase() === auto.href.toLowerCase())) {
      talksTo.push(auto);
    }
  }
  const showDependencies = Boolean(workspaceKey);

  return (
    <>
      {owns.length > 0 ? (
        <section aria-label="What it owns">
          <h2 id="what-it-owns">What it owns</h2>
          <ul>
            {owns.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {files.length > 0 ? (
        <section aria-label="Files">
          <h2 id="files">Files</h2>
          <p className="text-sm opacity-70">File list and purposes from the folder README.</p>
          <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.file}>
                  <td>
                    <code>{f.file}</code>
                  </td>
                  <td>{f.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>
      ) : null}

      {showDependencies && workspaceKey ? (
        <section aria-label="Dependencies">
          <h2 id="dependencies">Dependencies</h2>
          <DependencyTable workspace={workspaceKey} />
          {internal.length > 0 ? (
            <div className="mt-4">
              <h3 id="internal-packages">Internal packages used</h3>
              <ul>
                {internal.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href}>{t.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {typeof data.diagram === 'string' && data.diagram.length > 0 ? (
        <Diagram id={data.diagram} />
      ) : null}

      {talksTo.length > 0 ? (
        <section aria-label="Talks to">
          <h2 id="talks-to">Talks to</h2>
          <ul>
            {talksTo.map((t) => (
              <li key={t.href}>
                <Link href={t.href}>{t.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sources.length > 0 ? (
        <p className="mt-8 border-t pt-4 text-sm opacity-80">
          <span className="font-medium">Sources: </span>
          {sources.map((s, i) => (
            <span key={s}>
              <code>{s}</code>
              {i < sources.length - 1 ? ', ' : ''}
            </span>
          ))}{' '}
          <span className="opacity-70">(documented at commit {siteConfig.excalidrawCommit})</span>
        </p>
      ) : null}
    </>
  );
}

/** Extra "On this page" entries for the rendered sections. */
export function sectionTocEntries(
  data: DocFrontmatter,
  workspaceKey?: string,
): Array<{ title: string; url: string; depth: number }> {
  const entries: Array<{ title: string; url: string; depth: number }> = [];
  if (typeof data.diagram === 'string' && data.diagram.length > 0) {
    // Diagrams render inside a figure without a heading; no TOC entry.
  }
  if (Array.isArray(data.owns) && data.owns.length > 0)
    entries.push({ title: 'What it owns', url: '#what-it-owns', depth: 2 });
  if (Array.isArray(data.files) && data.files.length > 0)
    entries.push({ title: 'Files', url: '#files', depth: 2 });
  if (workspaceKey) entries.push({ title: 'Dependencies', url: '#dependencies', depth: 2 });
  if (
    Array.isArray(data.talksTo) &&
    (data.talksTo.length > 0 || (workspaceKey && internalLinks(workspaceKey).length > 0))
  )
    entries.push({ title: 'Talks to', url: '#talks-to', depth: 2 });
  return entries;
}
