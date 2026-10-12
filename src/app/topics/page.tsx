import { Suspense } from 'react';
import { DocsNavbar } from '@/components/DocsNavbar';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';

export const metadata = {
  title: 'Topics',
  description: 'Browse every topic by category, level, and tag — or search them.',
};

export default function TopicsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DocsNavbar />
      {/* max-w-7xl matches the navbar inner width, so the filter
          sidebar sits flush with the navbar content. No bottom padding:
          the sidebar runs to the screen end and the results column pads
          itself. No footer: the browser is a tool page. */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 pt-12">
        <p className="text-xs font-medium uppercase tracking-wider opacity-50">Topics</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Browse topics</h1>
        <p className="mt-1 max-w-2xl opacity-70">
          Every learning path in one place. Filter by category, level, or tag — or just search.
        </p>
        <div className="mt-6">
          <Suspense>
            <CatalogBrowser
              collection="topics"
              searchPlaceholder="Search topics, e.g. “event loop”…"
              badgeBase="/topics?"
              emptyTitle="No topics match"
              emptyLine="Try a different search, or clear the filters to see everything again."
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
