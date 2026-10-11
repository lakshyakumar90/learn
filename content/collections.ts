/**
 * Landing page content. Project cards are driven by
 * src/projects.config.ts (live projects first); topics and books stay
 * "Coming soon" placeholders, so adding an item needs no UI change.
 */
import { PROJECTS } from '../src/projects.config';

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

const FIRST_LIVE = PROJECTS.find((p) => p.status === 'live')?.id ?? 'excalidraw';

export const projectCards: ProjectCard[] = [
  ...PROJECTS.filter((p) => p.status === 'live').map((p) => ({
    slug: p.id,
    name: p.title,
    line: p.description,
    tags: p.tags,
    href: `/projects/${p.id}`,
    cta: 'Read the docs',
    status: 'live' as CardStatus,
  })),
  ...PROJECTS.filter((p) => p.status !== 'live').map((p) => ({
    slug: p.id,
    name: p.title,
    line: p.description,
    tags: p.tags,
    href: '/projects',
    cta: 'Coming soon',
    status: 'soon' as CardStatus,
  })),
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
    href: `/projects/${FIRST_LIVE}`,
  },
  {
    name: 'See',
    line: 'One diagram per folder, all drawn in the same visual language.',
    href: `/projects/${FIRST_LIVE}/low-level`,
  },
  {
    name: 'Watch',
    line: 'Animated flows that follow one action through the system.',
    href: `/projects/${FIRST_LIVE}/end-to-end`,
  },
];
