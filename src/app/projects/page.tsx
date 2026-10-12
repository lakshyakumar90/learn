import { Suspense } from 'react';
import { DocsNavbar } from '@/components/DocsNavbar';
import { Footer } from '@/components/Footer';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';

export const metadata = {
  title: 'Projects',
  description: 'Browse every documented codebase by platform, tag, and status — or search them.',
};

export default function ProjectsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DocsNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="text-xs font-medium uppercase tracking-wider opacity-50">Projects</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Browse projects</h1>
        <p className="mt-1 max-w-2xl opacity-70">
          Real codebases, documented end to end. Filter by platform, tag, or status — or just search.
        </p>
        <div className="mt-6">
          <Suspense>
            <CatalogBrowser
              collection="projects"
              searchPlaceholder="Search projects, e.g. “websocket”…"
              badgeBase="/projects?"
              emptyTitle="No projects match"
              emptyLine="Try a different search, or clear the filters to see everything again."
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
