import { loadDemo } from '@/lib/demo-load';
import { DemoGalleryClient } from './DemoGalleryClient';

/**
 * Gallery for one demo.yaml section. Headings and descriptions live in
 * the MDX page (they feed "On this page"); this renders only the media.
 */
export function DemoGallery({ project, section }: { project: string; section: string }) {
  const demo = loadDemo(project);
  const found = demo.sections.find((s) => s.id === section);
  if (!found) {
    return (
      <p role="note" className="my-6 rounded-xl border border-dashed p-6 text-center text-sm">
        Unknown demo section “{section}”.
      </p>
    );
  }
  return (
    <div className="my-6">
      <DemoGalleryClient section={found} />
    </div>
  );
}

/** Hero slot for the Demo overview ("Watch the 60-second tour"). */
export function DemoHero({ project }: { project: string }) {
  const demo = loadDemo(project);
  const hero = demo.hero;
  return (
    <div className="my-6">
      <p className="mb-2 text-sm font-semibold">{hero.caption}</p>
      <DemoGalleryClient
        section={{
          id: '__hero',
          layout: 'single',
          items: [
            {
              type: hero.type,
              src: hero.src,
              poster: hero.poster,
              alt: hero.alt,
              caption: hero.caption,
              device: 'none' as const,
            },
          ],
        }}
      />
    </div>
  );
}

/** Single media pointer for walkthrough entries (section + item index). */
export function DemoMedia({
  project,
  section,
  index = 0,
}: {
  project: string;
  section: string;
  index?: number;
}) {
  const demo = loadDemo(project);
  const found = demo.sections.find((s) => s.id === section);
  const item = found?.items[index];
  if (!found || !item) {
    return (
      <p role="note" className="my-6 rounded-xl border border-dashed p-6 text-center text-sm">
        Unknown demo media “{section} #{index}”.
      </p>
    );
  }
  return (
    <div className="my-6">
      <DemoGalleryClient section={{ id: `${section}-${index}`, layout: 'single', items: [item] }} />
    </div>
  );
}
