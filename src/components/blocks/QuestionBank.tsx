'use client';

/**
 * Every interview question, searchable and filterable. State lives in
 * the URL (?q=&topic=&level=): read on mount, written with replaceState,
 * so filtered views survive reloads and sharing on static export.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { InterviewQuestion } from "@/lib/interview";
import { QuestionDetails } from "./QuestionItem";

export interface BankTopic {
  slug: string;
  title: string;
}

function parseSearch(search: string): {
  q: string;
  topics: string[];
  levels: string[];
} {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const csv = (v: string | null) =>
    v ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
  return { q: params.get("q") ?? "", topics: csv(params.get("topic")), levels: csv(params.get("level")) };
}

function serialize(q: string, topics: string[], levels: string[]): string {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (topics.length > 0) params.set("topic", topics.join(","));
  if (levels.length > 0) params.set("level", levels.join(","));
  const out = params.toString();
  return out ? `?${out}` : "";
}

function score(item: InterviewQuestion, tokens: string[]): number {
  const question = item.question.toLowerCase();
  const answer = item.answer.toLowerCase();
  const tags = [...item.tags, ...item.followUps].join(" ").toLowerCase();
  let total = 0;
  for (const t of tokens) {
    if (question.includes(t)) total += 5;
    if (tags.includes(t)) total += 2;
    if (answer.includes(t)) total += 1;
  }
  return total;
}

function readInitial(): { q: string; topics: string[]; levels: string[] } {
  if (typeof window === "undefined") return { q: "", topics: [], levels: [] };
  return parseSearch(window.location.search);
}

export function QuestionBank({
  questions,
  topics,
}: {
  questions: InterviewQuestion[];
  topics: BankTopic[];
}) {
  // URL state is read lazily on first render (defaults during static
  // prerender) so filtered views survive reloads and sharing.
  const [initial] = useState(readInitial);
  const [input, setInput] = useState(initial.q);
  const [query, setQuery] = useState(initial.q);
  const [activeTopics, setActiveTopics] = useState<string[]>(initial.topics);
  const [activeLevels, setActiveLevels] = useState<string[]>(initial.levels);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + serialize(query, activeTopics, activeLevels),
      );
    }, 300);
    return () => window.clearTimeout(t);
  }, [query, activeTopics, activeLevels]);

  useEffect(() => {
    const t = window.setTimeout(() => setQuery(input), 250);
    return () => window.clearTimeout(t);
  }, [input]);

  const toggle = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const titleOf = useMemo(() => new Map(topics.map((t) => [t.slug, t.title])), [topics]);

  const visible = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    return questions
      .filter(
        (q) =>
          (activeTopics.length === 0 || activeTopics.includes(q.topic)) &&
          (activeLevels.length === 0 || activeLevels.includes(q.level)),
      )
      .map((q) => ({
        q,
        rank: tokens.length === 0 ? 1 : score(q, tokens),
      }))
      .filter((r) => r.rank > 0)
      .sort((a, b) => b.rank - a.rank)
      .map((r) => r.q);
  }, [questions, query, activeTopics, activeLevels]);

  const filtering =
    query.trim() !== "" || activeTopics.length > 0 || activeLevels.length > 0;

  const clearAll = () => {
    setInput("");
    setQuery("");
    setActiveTopics([]);
    setActiveLevels([]);
  };

  return (
    <div>
      <div className="flex flex-1 items-center gap-2 rounded-xl border px-3">
        <Search size={16} className="shrink-0 opacity-50" aria-hidden />
        <label htmlFor="bank-search" className="sr-only">
          Search interview questions
        </label>
        <input
          ref={searchRef}
          id="bank-search"
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search questions and answers…"
          autoComplete="off"
          spellCheck={false}
          className="h-11 w-full bg-transparent text-sm outline-none placeholder:opacity-50"
        />
      </div>

      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wider opacity-60">
            Topic
          </legend>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {topics.map((t) => {
              const count = questions.filter((q) => q.topic === t.slug).length;
              if (count === 0) return null;
              const id = `bank-topic-${t.slug}`;
              return (
                <li key={t.slug}>
                  <label
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-900"
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={activeTopics.includes(t.slug)}
                      onChange={() => toggle(activeTopics, t.slug, setActiveTopics)}
                      className="h-4 w-4 shrink-0 accent-emerald-700"
                    />
                    <span className="flex-1">{t.title}</span>
                    <span className="text-xs tabular-nums opacity-50">{count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
        <fieldset>
          <legend className="text-xs font-semibold uppercase tracking-wider opacity-60">
            Level
          </legend>
          <ul className="mt-2 flex flex-col gap-1">
            {(
              [
                ["basic", "Basic"],
                ["intermediate", "Intermediate"],
              ] as const
            ).map(([value, label]) => {
              const count = questions.filter((q) => q.level === value).length;
              const id = `bank-level-${value}`;
              return (
                <li key={value}>
                  <label
                    htmlFor={id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-900"
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={activeLevels.includes(value)}
                      onChange={() => toggle(activeLevels, value, setActiveLevels)}
                      className="h-4 w-4 shrink-0 accent-emerald-700"
                    />
                    <span className="flex-1">{label}</span>
                    <span className="text-xs tabular-nums opacity-50">{count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p role="status" aria-live="polite" className="text-sm opacity-70">
          {visible.length} question{visible.length === 1 ? "" : "s"}
        </p>
        {filtering ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-emerald-800 underline dark:text-emerald-200"
          >
            Clear all <X size={12} aria-hidden />
          </button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed p-10 text-center">
          <p className="text-lg font-semibold">No questions match</p>
          <p className="mx-auto mt-1 max-w-sm text-sm opacity-70">
            Try different words, or clear the filters to browse everything.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {visible.map((q) => (
            <QuestionDetails key={q.id} item={q} topicTitle={titleOf.get(q.topic)} />
          ))}
        </div>
      )}
    </div>
  );
}
