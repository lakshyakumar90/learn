'use client';

import Link from 'next/link';
import { FileText, Search, CornerDownLeft } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface StaticSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Default links shown when the query is empty (provided by RootProvider). */
  links?: Array<[name: string, href: string]>;
}

interface SearchEntry {
  url: string;
  collection: string;
  project: string | null;
  title: string;
  description: string;
  headings: string[];
  text: string;
}

let cachedIndex: SearchEntry[] | null = null;
let inflight: Promise<SearchEntry[]> | null = null;

function loadIndex(): Promise<SearchEntry[]> {
  if (cachedIndex) return Promise.resolve(cachedIndex);
  if (!inflight) {
    inflight = fetch('/search-index.json')
      .then((res) => (res.ok ? (res.json() as Promise<SearchEntry[]>) : []))
      .then((entries) => {
        cachedIndex = entries;
        return entries;
      })
      .catch(() => [] as SearchEntry[]);
  }
  return inflight;
}

function score(entry: SearchEntry, tokens: string[]): number {
  const title = entry.title.toLowerCase();
  const description = entry.description.toLowerCase();
  const headings = entry.headings.join(' ').toLowerCase();
  const text = entry.text.toLowerCase();
  let total = 0;
  for (const token of tokens) {
    if (title.includes(token)) total += 5;
    if (headings.includes(token)) total += 3;
    if (description.includes(token)) total += 2;
    if (text.includes(token)) total += 1;
  }
  return total;
}

function breadcrumb(entry: SearchEntry): string {
  const path = entry.url.replace(/^\//, '').split('/');
  return path.join(' / ');
}

export function StaticSearchDialog({ open, onOpenChange, links = [] }: StaticSearchProps) {
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    loadIndex().then(setEntries);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open ]);

  const results = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];
    return entries
      .map((entry) => ({ entry, rank: score(entry, tokens) }))
      .filter((r) => r.rank > 0)
      .sort((a, b) => b.rank - a.rank)
      .slice(0, 12)
      .map((r) => r.entry);
  }, [entries, query]);

  useEffect(() => setActive(0), [results.length, query]);

  if (!open) return null;

  const showLinks = query.trim() === '';
  const activeId = results.length > 0 ? `${listId}-option-${active}` : undefined;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false);
    } else if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results.length > 0) {
      const target = results[Math.min(active, results.length - 1)];
      if (target) {
        onOpenChange(false);
        window.location.href = target.url;
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-[12vh]"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border bg-white shadow-2xl dark:bg-stone-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="static-search-box flex items-center gap-2 border-b px-4">
          <Search size={16} className="shrink-0 opacity-50" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            type="text"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-label="Search documentation"
            placeholder="Search pages…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="static-search-input m-0 h-12 w-full appearance-none rounded-none border-0 bg-transparent py-0 text-sm leading-normal shadow-none outline-none placeholder:opacity-50"
          />
          <kbd className="shrink-0 rounded border px-1.5 py-0.5 text-[11px] opacity-60">ESC</kbd>
        </div>

        {showLinks ? (
          <ul className="max-h-80 overflow-y-auto p-2" aria-label="Suggested pages">
            {links.map(([name, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-stone-100 dark:hover:bg-stone-900"
                >
                  <FileText size={14} className="shrink-0 opacity-50" aria-hidden />
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        ) : results.length > 0 ? (
          <ul id={listId} role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto p-2">
            {results.map((entry, i) => (
              <li
                key={entry.url}
                id={`${listId}-option-${i}`}
                role="option"
                aria-selected={i === active}
              >
                <Link
                  href={entry.url}
                  onClick={() => onOpenChange(false)}
                  onMouseMove={() => setActive(i)}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ${
                    i === active ? 'bg-stone-100 dark:bg-stone-900' : ''
                  }`}
                >
                  <FileText size={14} className="mt-0.5 shrink-0 opacity-50" aria-hidden />
                  <span>
                    <span className="block font-medium">{entry.title}</span>
                    <span className="block text-xs opacity-60">{breadcrumb(entry)}</span>
                    {entry.project ? (
                      <span className="mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium opacity-80">
                        {entry.project}
                      </span>
                    ) : null}
                    {entry.description ? (
                      <span className="mt-0.5 block text-xs opacity-70">{entry.description}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-8 text-center text-sm opacity-60" role="status">
            No results for “{query}”.
          </p>
        )}

        <div className="flex items-center gap-4 border-t px-4 py-2 text-[11px] opacity-60">
          <span className="flex items-center gap-1">
            <CornerDownLeft size={12} aria-hidden /> open
          </span>
          <span>↑↓ navigate</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
