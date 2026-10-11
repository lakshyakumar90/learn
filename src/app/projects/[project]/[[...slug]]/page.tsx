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
import type { DocFrontmatter } from '@/lib/doc-schema';

/**
 * Map docs slugs to dependency workspace keys. Only folder pages
 * (apps/*, packages/*) get a Dependencies section.
 */
function workspaceKeyFor(project: string, slug: string[]): string | undefined {
  // Dependency data only exists for the Excalidraw project.
  if (project !== 'excalidraw') return undefined;
  if (slug.length === 1 && (slug[0] === 'apps' || slug[0] === 'packages')) return slug[0];
  if (slug.length === 2 && (slug[0] === 'apps' || slug[0] === 'packages')) {
    return `${slug[0]}/${slug[1]}`;
  }
  return undefined;
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
  const workspaceKey = workspaceKeyFor(project, slug ?? []);
  return (
    <DocsPage toc={[...page.data.toc, ...sectionTocEntries(data, workspaceKey)]} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description ? (
        <DocsDescription>{page.data.description}</DocsDescription>
      ) : null}
      <DocsBody>
        <MDX components={getMDXComponents()} />
        <PageSections data={data} workspaceKey={workspaceKey} />
      </DocsBody>
    </DocsPage>
  );
}
