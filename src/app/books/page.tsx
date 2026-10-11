import { DocsNavbar } from '@/components/DocsNavbar';

export default function BooksPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DocsNavbar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Books</h1>
        <p className="text-lg opacity-70">Coming soon.</p>
      </main>
    </div>
  );
}
