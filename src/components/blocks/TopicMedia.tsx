import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load as loadYaml } from 'js-yaml';

interface MediaSlot {
  /** Shot note: what to capture when the photo is produced. */
  note?: string;
  /** Local file under public/media/<topic>/, when uploaded. */
  src?: string;
  alt?: string;
  caption?: string;
}

function loadMedia(topic: string): Record<string, MediaSlot> {
  const file = join(process.cwd(), 'content', 'topics', topic, 'media.yaml');
  if (!existsSync(file)) return {};
  const parsed = loadYaml(readFileSync(file, 'utf8')) as { slots?: Record<string, MediaSlot> };
  return parsed?.slots ?? {};
}

/**
 * Photo slot for tutorial pages (generic across topics). While no
 * photo is uploaded, renders a labelled placeholder with the shot
 * note so the page layout is final. Photos arrive later through the
 * normal public/media flow; never hotlink remote images.
 */
export function TopicMedia({ topic, slot }: { topic: string; slot: string }) {
  const slots = loadMedia(topic);
  const entry = slots[slot];
  if (!entry) {
    return (
      <p role="note" className="my-6 rounded-xl border border-dashed p-4 text-sm opacity-70">
        Unregistered media slot &quot;{slot}&quot; for topic &quot;{topic}&quot;.
      </p>
    );
  }
  if (!entry.src) {
    return (
      <figure className="my-6">
        <div
          role="img"
          aria-label={`Photo coming soon: ${entry.note ?? slot}`}
          className="flex min-h-40 flex-col items-center justify-center gap-1 rounded-xl border border-dashed bg-stone-100 p-6 text-center dark:bg-stone-900"
        >
          <p className="text-sm font-medium">Photo coming soon: {slot}</p>
          {entry.note && <p className="max-w-xl text-xs opacity-70">{entry.note}</p>}
        </div>
        {entry.caption && <figcaption className="mt-1 text-center text-xs opacity-60">{entry.caption}</figcaption>}
      </figure>
    );
  }
  return (
    <figure className="my-6">
      {/* Local uploaded media; static export handles sizing in HTML. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={entry.src}
        alt={entry.alt ?? entry.caption ?? slot}
        className="w-full rounded-xl border"
        loading="lazy"
      />
      {entry.caption && <figcaption className="mt-1 text-center text-xs opacity-60">{entry.caption}</figcaption>}
    </figure>
  );
}
