/**
 * Single configuration file for the learn site.
 *
 * Personal links (footer + navbar) live here; per-project repository
 * URLs live on each entry of `projects` so a project sidebar always
 * links that project, not this profile.
 *
 * The documented sibling project lives at `excalidrawDir`
 * (relative to the learn folder). `excalidrawCommit` records the
 * commit being documented — update it when re-reading the sources.
 *
 * Nothing else in the codebase may hardcode the values above.
 */
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
  excalidrawDir: '../excalidraw',
  excalidrawCommit: 'b0026d9',
  collections: [
    { slug: 'projects', name: 'Projects', live: true },
    { slug: 'topics', name: 'Topics', live: false },
    { slug: 'books', name: 'Books', live: false },
  ],
  projects: [
    {
      slug: 'excalidraw',
      name: 'Excalidraw',
      description:
        'A collaborative drawing workspace: guest storage, authenticated scenes, real-time rooms, and Redis write-behind persistence.',
      repo: 'https://github.com/lakshyakumar90/excalidraw',
    },
    // __NEW_PROJECTS__ (appended by `pnpm new project <slug>`)
  ],
} as const;

export type SiteConfig = typeof siteConfig;
