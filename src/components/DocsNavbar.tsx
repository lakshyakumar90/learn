'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { FullSearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { siteConfig } from '@/site.config';

const TABS = [
  { text: 'Projects', url: '/projects' },
  { text: 'Topics', url: '/topics' },
  { text: 'Books', url: '/books' },
];

/**
 * Top navbar: site name, collection tabs, search, theme toggle, GitHub.
 * On docs pages pass className="hidden md:block" (mobile uses the
 * framework subnav); everywhere else it renders responsively.
 */
export function DocsNavbar({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  return (
    <header
      className={`sticky top-0 z-40 border-b bg-[var(--background)]/90 backdrop-blur ${className}`}
    >
      <nav
        aria-label="Site"
        className="mx-auto flex h-14 w-full max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 px-6"
      >
        <Link href="/" className="text-base font-semibold tracking-tight">
          {siteConfig.siteName}
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {TABS.map((t) => {
            const active = pathname === t.url || pathname.startsWith(`${t.url}/`);
            return (
              <Link
                key={t.url}
                href={t.url}
                aria-current={active ? 'page' : undefined}
                className={active ? 'font-medium' : 'opacity-70 hover:opacity-100'}
              >
                {t.text}
              </Link>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <FullSearchTrigger />
          <ThemeSwitch />
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="inline-flex items-center gap-1 rounded-md p-2 text-sm opacity-70 hover:opacity-100"
          >
            GitHub <ArrowUpRight size={14} aria-hidden />
          </a>
        </div>
      </nav>
    </header>
  );
}
