import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { topicsSource } from '@/lib/source';
import { getMDXComponents } from '@/mdx-components';
import rawCatalog from '../../../../../generated/catalog.json';
import { TAXONOMY } from '../../../../../content/taxonomy';
import { validateCatalog } from '@/lib/catalog/types';

const CATALOG = validateCatalog(rawCatalog);

export function generateStaticParams(): Array<{ slug: string[] }> {
  return topicsSource.generateParams().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = topicsSource.getPage(slug ?? []);
  if (!page) return {};
  return { title: page.data.title, description: page.data.description };
}

/** Breadcrumb: Topics > <Primary category> > <Topic>. */
function TopicBreadcrumb({ topicId, topicTitle }: { topicId: string; topicTitle: string }) {
  const item = CATALOG.find((i) => i.collection === 'topics' && i.id === topicId);
  const primary = item?.primaryCategory
    ? TAXONOMY.topics.categories.find((c) => c.id === item.primaryCategory)
    : undefined;
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm opacity-70">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/topics" className="hover:underline">
            Topics
          </Link>
        </li>
        {primary ? (
          <>
            <li aria-hidden>/</li>
            <li>
              <Link href={`/topics/category/${primary.id}`} className="hover:underline">
                {primary.title}
              </Link>
            </li>
          </>
        ) : null}
        <li aria-hidden>/</li>
        <li aria-current="page" className="opacity-100">
          {topicTitle}
        </li>
      </ol>
    </nav>
  );
}

/** Category badges near the title, linking to the filtered list. */
function TopicBadges({ topicId }: { topicId: string }) {
  const item = CATALOG.find((i) => i.collection === 'topics' && i.id === topicId);
  if (!item || item.categories.length === 0) return null;
  return (
    <ul aria-label="Categories" className="mt-3 flex flex-wrap gap-1.5">
      {item.categories.map((id) => {
        const cat = TAXONOMY.topics.categories.find((c) => c.id === id);
        return (
          <li key={id}>
            <Link
              href={`/topics?category=${encodeURIComponent(id)}`}
              className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium hover:underline dark:bg-stone-900"
            >
              {cat?.title ?? id}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = topicsSource.getPage(slug ?? []);
  if (!page) notFound();
  const MDX = page.data.body;
  const topicId = (slug ?? [])[0];
  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      {topicId ? <TopicBreadcrumb topicId={topicId} topicTitle={page.data.title} /> : null}
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description ? <DocsDescription>{page.data.description}</DocsDescription> : null}
      {topicId ? <TopicBadges topicId={topicId} /> : null}
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}
