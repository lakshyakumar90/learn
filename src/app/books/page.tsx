import { Suspense } from 'react';
import { DocsNavbar } from '@/components/DocsNavbar';
import { Footer } from '@/components/Footer';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';

export const metadata = {
  title: 'Books',
  description: 'Long-form book notes. Coming soon.',
};

export default function BooksPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DocsNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <p className="text-xs font-medium uppercase tracking-wider opacity-50">Books</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Browse books</h1>
        <p className="mt-1 max-w-2xl opacity-70">
          Long-form notes for ideas that deserve more than a page.
        </p>
        <div className="mt-6">
          <Suspense>
            <CatalogBrowser
              collection="books"
              searchPlaceholder="Search books…"
              badgeBase="/books?"
              emptyTitle="No books yet"
              emptyLine="Book notes are on the way. Titles will be announced here first."
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
