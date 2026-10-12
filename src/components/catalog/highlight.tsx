'use client';

/** Case-insensitive substring highlight for query tokens in card text. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return <>{text}</>;
  const lower = text.toLowerCase();
  let first = -1;
  let used = '';
  for (const t of tokens) {
    const i = lower.indexOf(t);
    if (i >= 0 && (first < 0 || i < first)) {
      first = i;
      used = text.slice(i, i + t.length);
    }
  }
  if (first < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, first)}
      <mark className="rounded-sm bg-amber-200 dark:bg-amber-800">{used}</mark>
      {text.slice(first + used.length)}
    </>
  );
}
