'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUpRight, Menu, Search, X } from 'lucide-react';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import { FullSearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { siteConfig } from '@/site.config';

const TABS = [
  { text: 'Projects', url: '/projects' },
  { text: 'Topics', url: '/topics' },
  { text: 'Books', url: '/books' },
];

/**
 * Top navbar: site name, collection tabs, search, theme toggle, GitHub.
 * Desktop shows everything inline (unchanged). On small screens the bar
 * stays a single row (logo, search, theme, menu button) and the tabs plus
 * GitHub live in a slide-in sidebar drawer.
 * On docs pages pass className="hidden md:block" (mobile uses the
 * framework subnav); everywhere else it renders responsively.
 */
export function DocsNavbar({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const { setOpenSearch } = useSearchContext();
  const [drawer, setDrawer] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawer]);

  const openDrawer = () => setDrawer(true);
  const closeDrawer = () => {
    setDrawer(false);
    triggerRef.current?.focus();
  };

  // Focus the panel on open; trap Tab inside; Escape closes.
  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDrawer();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const items = [...panelRef.current.querySelectorAll<HTMLElement>('a[href], button')].filter(
      (el) => !el.hasAttribute('disabled'),
    );
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-[var(--background)]/90 backdrop-blur ${className}`}
    >
      <nav
        aria-label="Site"
        className="mx-auto flex min-h-14 w-full max-w-7xl flex-nowrap items-center gap-x-5 px-6 py-2 md:h-14 md:py-0"
      >
        <Link href="/" className="shrink-0 text-base font-semibold tracking-tight">
          {siteConfig.siteName}
        </Link>
        <div className="hidden items-center gap-4 text-sm md:flex">
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
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <FullSearchTrigger className="hidden md:inline-flex" />
          <button
            type="button"
            aria-label="Open search"
            onClick={() => setOpenSearch(true)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border md:hidden"
          >
            <Search size={16} aria-hidden />
          </button>
          <ThemeSwitch />
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="hidden items-center gap-1 rounded-md p-2 text-sm opacity-70 hover:opacity-100 md:inline-flex"
          >
            GitHub <ArrowUpRight size={14} aria-hidden />
          </a>
          <button
            ref={triggerRef}
            type="button"
            aria-label="Open menu"
            aria-expanded={drawer}
            aria-controls="mobile-nav"
            onClick={openDrawer}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border md:hidden"
          >
            <Menu size={18} aria-hidden />
          </button>
        </div>
      </nav>

      {/* Portalled to document.body: inside the blurred sticky header,
          `fixed` would resolve against the header box instead of the viewport. */}
      {drawer && mounted
        ? createPortal(
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                aria-hidden
                className="absolute inset-0 bg-black/60"
                onClick={closeDrawer}
              />
              <div
                ref={panelRef}
                id="mobile-nav"
                role="dialog"
                aria-modal="true"
                aria-label="Site navigation"
                onKeyDown={onPanelKeyDown}
                className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r bg-[var(--background)] p-4"
              >
                <div className="flex items-center">
                  <span className="text-base font-semibold tracking-tight">{siteConfig.siteName}</span>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={closeDrawer}
                    ref={(el) => el?.focus()}
                    className="ml-auto inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border"
                  >
                    <X size={18} aria-hidden />
                  </button>
                </div>
                <nav aria-label="Collections" className="mt-4 flex flex-col">
                  {TABS.map((t) => {
                    const active = pathname === t.url || pathname.startsWith(`${t.url}/`);
                    return (
                      <Link
                        key={t.url}
                        href={t.url}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setDrawer(false)}
                        className={`rounded-lg px-3 py-3 text-base transition-colors hover:bg-stone-100 dark:hover:bg-stone-900 ${
                          active ? 'font-medium' : ''
                        }`}
                      >
                        {t.text}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-auto border-t pt-4">
                  <a
                    href={siteConfig.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub repository"
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-3 text-base opacity-80 hover:opacity-100"
                  >
                    GitHub <ArrowUpRight size={16} aria-hidden />
                  </a>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
