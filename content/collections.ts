/**
 * Landing page content. Every card on the landing page is driven from
 * here with status "live" | "soon", so adding an item needs no UI change.
 */
export type CardStatus = 'live' | 'soon';

export interface ProjectCard {
  slug: string;
  name: string;
  line: string;
  tags: string[];
  href: string;
  cta: string;
  status: CardStatus;
}

export interface TopicCard {
  name: string;
  line: string;
  status: CardStatus;
}

export interface BookCard {
  name: string;
  line: string;
  status: CardStatus;
}

export interface HowCard {
  name: string;
  line: string;
  href: string;
}

export const projectCards: ProjectCard[] = [
  {
    slug: 'excalidraw',
    name: 'Excalidraw',
    line: 'A collaborative drawing workspace, documented folder by folder.',
    tags: ['Next.js', 'TypeScript', 'WebSocket', 'Redis', 'Postgres'],
    href: '/projects/excalidraw',
    cta: 'Read the docs',
    status: 'live',
  },
  {
    slug: 'next-system',
    name: 'Next system',
    line: 'A second codebase, documented the same way.',
    tags: [],
    href: '/projects',
    cta: 'Coming soon',
    status: 'soon',
  },
  {
    slug: 'more-systems',
    name: 'More systems',
    line: 'Real projects worth reading closely.',
    tags: [],
    href: '/projects',
    cta: 'Coming soon',
    status: 'soon',
  },
];

export const topicCards: TopicCard[] = [
  { name: 'Languages', line: 'Notes on programming languages.', status: 'soon' },
  { name: 'Frameworks', line: 'Notes on frameworks and their ideas.', status: 'soon' },
  { name: 'Concepts and ideas', line: 'Cross-cutting concepts, explained once.', status: 'soon' },
  { name: 'Migrations', line: 'Notes from moving real systems.', status: 'soon' },
];

export const bookCards: BookCard[] = [
  { name: 'Book notes', line: 'Long-form notes. Titles announced here first.', status: 'soon' },
];

export const howCards: HowCard[] = [
  {
    name: 'Read',
    line: 'Short docs pages: what each folder owns and what it talks to.',
    href: '/projects/excalidraw',
  },
  {
    name: 'See',
    line: 'One diagram per folder, all drawn in the same visual language.',
    href: '/projects/excalidraw/low-level',
  },
  {
    name: 'Watch',
    line: 'Animated flows that follow one action through the system.',
    href: '/projects/excalidraw/end-to-end',
  },
];
