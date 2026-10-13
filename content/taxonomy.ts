/**
 * Single source of truth for catalog classification. Shared by
 * Projects, Topics, and (later) Books — no per-collection components.
 *
 * Adding a category or a tag means editing ONLY this file (plus the
 * item's own metadata). Components render whatever is declared here:
 * - a category with no items is hidden from filters but shown on the
 *   landing page as "Coming soon";
 * - icon is a closed key union, so new categories reuse existing icons
 *   with zero component changes.
 */
import { z } from 'zod';

export const ICON_KEYS = ['code', 'database', 'layers', 'wrench', 'bulb', 'git', 'book'] as const;
export type IconKey = (typeof ICON_KEYS)[number];

const categorySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.enum(ICON_KEYS),
  order: z.number(),
});

export type Category = z.infer<typeof categorySchema>;

export const TOPIC_LEVELS = ['beginner', 'intermediate', 'advanced', 'all'] as const;
export type TopicLevel = (typeof TOPIC_LEVELS)[number];

export const PLATFORMS = ['web', 'mobile'] as const;
export type Platform = (typeof PLATFORMS)[number];

export const ITEM_STATUS = ['live', 'soon'] as const;
export type ItemStatus = (typeof ITEM_STATUS)[number];

export interface CollectionTaxonomy {
  categories: Category[];
  /** Curated tag vocabulary. Unknown tags fail the build on purpose:
   * adding a tag = one line here, zero component changes. */
  tags: string[];
}

export const TOPIC_CATEGORIES: Category[] = [
  { id: 'languages', title: 'Languages', description: 'Programming languages, from first script to deep internals.', icon: 'code', order: 1 },
  { id: 'orms', title: 'ORMs & Database Tools', description: 'Prisma, Drizzle, and friends: modeling, migrations, and queries.', icon: 'database', order: 2 },
  { id: 'frameworks', title: 'Frameworks', description: 'Notes on frameworks and the ideas they are built from.', icon: 'layers', order: 3 },
  { id: 'databases', title: 'Databases', description: 'How data is stored, indexed, and retrieved.', icon: 'database', order: 4 },
  { id: 'tools-devops', title: 'Tools & DevOps', description: 'Editors, build tools, CI, and running systems in production.', icon: 'wrench', order: 5 },
  { id: 'concepts', title: 'Concepts & Ideas', description: 'Cross-cutting concepts, explained once and linked everywhere.', icon: 'bulb', order: 6 },
  { id: 'migrations', title: 'Migrations', description: 'Notes from moving real systems between stacks.', icon: 'git', order: 7 },
];

export const TOPIC_TAGS = [
  'Language',
  'Types',
  'Runtime',
  'Browser',
  'Async',
  'Interview',
  'ORM',
  'Database',
  'SQL',
  'Framework',
  'DevOps',
  'Testing',
  'Security',
  'Performance',
  'Concept',
];

export const PROJECT_TAGS = [
  'Next.js',
  'TypeScript',
  'WebSocket',
  'Redis',
  'Postgres',
  'React 19',
  'Express 5',
  'MongoDB',
  'Socket.io',
  'Expo',
  'React Native',
  'SQLite',
  'Firebase',
];

export const BOOK_GENRES: Category[] = [
  { id: 'software-craft', title: 'Software Craft', description: 'Long-form notes on writing code well.', icon: 'book', order: 1 },
  { id: 'systems', title: 'Systems', description: 'Long-form notes on how systems behave.', icon: 'book', order: 2 },
  { id: 'design', title: 'Design', description: 'Long-form notes on interfaces and experience.', icon: 'book', order: 3 },
];

export const BOOK_TAGS: string[] = [];

export const TAXONOMY: Record<'topics' | 'projects' | 'books', CollectionTaxonomy> = {
  topics: { categories: TOPIC_CATEGORIES, tags: TOPIC_TAGS },
  projects: { categories: [], tags: PROJECT_TAGS },
  books: { categories: BOOK_GENRES, tags: BOOK_TAGS },
};

const taxonomySchema = z.record(
  z.enum(['topics', 'projects', 'books']),
  z.object({
    categories: z
      .array(categorySchema)
      .refine(
        (cats) => new Set(cats.map((c) => c.id)).size === cats.length,
        'duplicate category id',
      ),
    tags: z.array(z.string().min(1)),
  }),
);

/** Throws on any taxonomy shape violation. Run by build-catalog and tests. */
export function validateTaxonomy(value: unknown = TAXONOMY): Record<'topics' | 'projects' | 'books', CollectionTaxonomy> {
  return taxonomySchema.parse(value) as Record<'topics' | 'projects' | 'books', CollectionTaxonomy>;
}

export function categoryById(
  collection: 'topics' | 'projects' | 'books',
  id: string,
): Category | undefined {
  return TAXONOMY[collection].categories.find((c) => c.id === id);
}
