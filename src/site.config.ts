/**
 * Single configuration file for the learn site.
 *
 * Personal links (footer + navbar) live here; per-project entries are
 * derived from src/projects.config.ts so a project sidebar always links
 * that project, not this profile.
 *
 * Nothing else in the codebase may hardcode the values above.
 */
import { PROJECTS } from './projects.config';

export const siteConfig = {
  siteName: 'learn',
  tagline: 'Learn how real software fits together.',
  description:
    'Read-only, diagram-first notes on real codebases — projects, topics, and books.',
  email: 'lakshyakumar5023@gmail.com',
  calUrl: 'https://cal.com/lakshya-kumar/30min',
  githubUrl: 'https://github.com/lakshyakumar90',
  linkedinUrl: 'https://www.linkedin.com/in/kumar-lakshya/',
  twitterUrl: 'https://x.com/LakshyaKum67542',
  portfolioUrl: 'https://lakshyakumar.in/',
  collections: [
    { slug: 'projects', name: 'Projects', live: true },
    { slug: 'topics', name: 'Topics', live: false },
    { slug: 'books', name: 'Books', live: false },
  ],
  projects: PROJECTS.map((p) => ({
    slug: p.id,
    name: p.title,
    description: p.description,
    repo: p.repo,
  })),
} as const;

export type SiteConfig = typeof siteConfig;
