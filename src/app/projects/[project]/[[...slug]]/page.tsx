import { notFound } from 'next/navigation';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { projectsSource } from '@/lib/source';
import { getMDXComponents } from '@/mdx-components';
import { PageSections, sectionTocEntries } from '@/components/FolderSections';
import { getProject } from '@/projects.config';
import { resolveWorkspaces } from '@/lib/deps-data';
import type { DocFrontmatter } from '@/lib/doc-schema';

/**
 * Map docs slugs to dependency workspace keys. Folder pages whose slug
 * resolves to configured workspaces (exact, alias, or group prefix) get
 * a Dependencies section.
 */
function workspaceKeyFor(project: string, slug: string[]): string | undefined {
  if (!getProject(project)) return undefined;
  if (slug.length === 0) return undefined;
  const key = slug.join('/');
  return resolveWorkspaces(project, key).length > 0 ? key : undefined;
}

export function generateStaticParams(): Array<{ project: string; slug?: string[] }> {
  return projectsSource.generateParams().map((p) => ({
    project: p.slug[0],
    slug: p.slug.slice(1),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ project: string; slug?: string[] }>;
}) {
  const { project, slug } = await params;
  const page = projectsSource.getPage([project, ...(slug ?? [])]);
  if (!page) return {};
  return { title: page.data.title, description: page.data.description };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ project: string; slug?: string[] }>;
}) {
  const { project, slug } = await params;
  const page = projectsSource.getPage([project, ...(slug ?? [])]);
  if (!page) notFound();
  const MDX = page.data.body;
  const data = page.data as unknown as DocFrontmatter;
  const workspaceKey =
    typeof data.workspace === 'string' && data.workspace.length > 0
      ? data.workspace
      : workspaceKeyFor(project, slug ?? []);
  return (
    <DocsPage toc={[...page.data.toc, ...sectionTocEntries(data, workspaceKey, project)]} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description ? (
        <DocsDescription>{page.data.description}</DocsDescription>
      ) : null}
      <DocsBody>
        <MDX components={getMDXComponents()} />
        <PageSections data={data} workspaceKey={workspaceKey} project={project} />
      </DocsBody>
    </DocsPage>
  );
}
