import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DocsNavbar } from '@/components/DocsNavbar';
import { Footer } from '@/components/Footer';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { CategoryIcon } from '@/components/catalog/category-icons';
import { TAXONOMY } from '../../../../../content/taxonomy';

export function generateStaticParams(): Array<{ id: string }> {
  return TAXONOMY.topics.categories.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = TAXONOMY.topics.categories.find((c) => c.id === id);
  if (!category) return {};
  return { title: `${category.title} topics`, description: category.description };
}

export default async function TopicCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = TAXONOMY.topics.categories.find((c) => c.id === id);
  if (!category) notFound();
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DocsNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <nav aria-label="Breadcrumb" className="text-sm opacity-70">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/topics" className="hover:underline">
                Topics
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page">{category.title}</li>
          </ol>
        </nav>
        <div className="mt-2 flex items-center gap-2">
          <CategoryIcon icon={category.icon} size={24} />
          <h1 className="text-3xl font-semibold tracking-tight">{category.title}</h1>
        </div>
        <p className="mt-1 max-w-2xl opacity-70">{category.description}</p>
        <div className="mt-6">
          <Suspense>
            <CatalogBrowser
              collection="topics"
              initial={{ categories: [category.id], grouped: false }}
              searchPlaceholder={`Search ${category.title.toLowerCase()}…`}
              badgeBase="/topics?"
              emptyTitle="No topics match"
              emptyLine="Try a different search, or clear the filters to see everything again."
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
