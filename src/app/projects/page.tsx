import Link from 'next/link';
import { DocsNavbar } from '@/components/DocsNavbar';
import { siteConfig } from '@/site.config';

export default function ProjectsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DocsNavbar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <ul className="flex flex-col gap-4">
          {siteConfig.projects.map((p) => (
            <li key={p.slug} className="rounded-xl border p-5">
              <Link href={`/projects/${p.slug}`} className="text-xl font-medium underline">
                {p.name}
              </Link>
              <p className="mt-1 text-sm opacity-70">{p.description}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
