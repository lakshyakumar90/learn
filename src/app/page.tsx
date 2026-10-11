import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { DocsNavbar } from '@/components/DocsNavbar';
import { LandingHero } from '@/components/LandingHero';
import { Footer } from '@/components/Footer';
import {
  bookCards,
  howCards,
  projectCards,
  topicCards,
} from '../../content/collections';

function SectionHead({ eyebrow, title, line }: { eyebrow: string; title: string; line: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider opacity-50">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 max-w-xl opacity-70">{line}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DocsNavbar />

      <main className="flex flex-1 flex-col">
        <LandingHero />

        <section id="projects" aria-label="Projects" className="scroll-mt-20 border-t">
          <div className="mx-auto w-full max-w-6xl px-6 py-12">
            <SectionHead
              eyebrow="Projects"
              title="Real codebases, documented end to end"
              line="Two live projects today; more systems joining the shelf."
            />
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {projectCards.map((p) =>
                p.status === 'live' ? (
                  <Link
                    key={p.slug}
                    href={p.href}
                    className="group rounded-xl border p-6 transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
                  >
                    <p className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                      Live
                    </p>
                    <p className="mt-3 text-xl font-semibold">{p.name}</p>
                    <p className="mt-1 text-sm opacity-70">{p.line}</p>
                    {p.tags.length > 0 ? (
                      <ul aria-label="Technologies" className="mt-3 flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <li
                            key={t}
                            className="rounded-md border px-2 py-0.5 text-xs opacity-70"
                          >
                            {t}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                      {p.cta}
                      <ArrowRight
                        size={14}
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </p>
                  </Link>
                ) : (
                  <div
                    key={p.slug}
                    className="rounded-xl border border-dashed p-6 opacity-70"
                  >
                    <p className="inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium opacity-70">
                      Coming soon
                    </p>
                    <p className="mt-3 text-xl font-semibold">{p.name}</p>
                    <p className="mt-1 text-sm opacity-70">{p.line}</p>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        <section id="topics" aria-label="Topics" className="scroll-mt-20 border-t">
          <div className="mx-auto w-full max-w-6xl px-6 py-12">
            <SectionHead
              eyebrow="Topics"
              title="The ideas around the code"
              line="Cross-cutting notes, explained once and linked everywhere."
            />
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topicCards.map((t) => (
                <div key={t.name} className="rounded-xl border border-dashed p-5 opacity-70">
                  <p className="inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium opacity-70">
                    Coming soon
                  </p>
                  <p className="mt-3 font-semibold">{t.name}</p>
                  <p className="mt-1 text-sm opacity-70">{t.line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="books" aria-label="Books" className="scroll-mt-20 border-t">
          <div className="mx-auto w-full max-w-6xl px-6 py-12">
            <SectionHead
              eyebrow="Books"
              title="Long-form notes"
              line="Slow reading for ideas that deserve more than a page."
            />
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {bookCards.map((b) => (
                <div key={b.name} className="rounded-xl border border-dashed p-6 opacity-70">
                  <p className="inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium opacity-70">
                    Coming soon
                  </p>
                  <p className="mt-3 text-xl font-semibold">{b.name}</p>
                  <p className="mt-1 text-sm opacity-70">{b.line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-to" aria-label="How to use this site" className="scroll-mt-20 border-t">
          <div className="mx-auto w-full max-w-6xl px-6 py-12">
            <SectionHead
              eyebrow="How to use this site"
              title="Three ways in"
              line="Every project is documented the same way: read, see, watch."
            />
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {howCards.map((h, i) => (
                <Link
                  key={h.name}
                  href={h.href}
                  className="group rounded-xl border p-6 transition-colors hover:bg-stone-100 dark:hover:bg-stone-900"
                >
                  <p className="text-xs font-medium uppercase tracking-wider opacity-50">
                    0{i + 1}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xl font-semibold">
                    {h.name}
                    <ArrowRight
                      size={16}
                      aria-hidden
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </p>
                  <p className="mt-1 text-sm opacity-70">{h.line}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
