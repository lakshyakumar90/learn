import { notFound } from 'next/navigation';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { projectsSource } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import { projectSubtree } from '@/lib/project-tree';
import { DocsNavbar } from '@/components/DocsNavbar';
import { siteConfig } from '@/site.config';

export function generateStaticParams(): Array<{ project: string }> {
  const seen = new Set<string>();
  for (const page of projectsSource.getPages()) {
    seen.add(page.slugs[0]);
  }
  return [...seen].map((project) => ({ project }));
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ project: string }>;
}) {
  const { project } = await params;
  const tree = projectSubtree(projectsSource.getPageTree(), '/projects', project);
  if (!tree) notFound();
  const entry = siteConfig.projects.find((p) => p.slug === project);
  const repo = entry && 'repo' in entry && entry.repo ? entry.repo : undefined;
  return (
    <>
      <DocsNavbar className="hidden md:block" />
      <DocsLayout tree={tree} containerProps={{ className: 'docs-with-navbar' }} {...baseOptions(repo)}>
        {children}
      </DocsLayout>
    </>
  );
}
