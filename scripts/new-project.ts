/**
 * Scaffold a new project or topic with zero new components:
 * only content files (and a topic.yaml) are created.
 *
 * Usage:
 *   pnpm new project <slug> [--name "Display name"] [--status live|soon]
 *   pnpm new topic <slug> --category <id> --level <level> [--name "Display name"] [--status live|soon] [--order N]
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TOPIC_CATEGORIES, TOPIC_LEVELS } from '../content/taxonomy';

const ROOT = join(__dirname, '..');

function fail(message: string): never {
  console.error(`new: ${message}`);
  process.exit(1);
}

function titleCase(slug: string): string {
  return slug
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function frontMatter(title: string, description: string): string {
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---\n`;
}

function write(path: string, content: string): void {
  if (existsSync(path)) fail(`refusing to overwrite existing ${path}`);
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content);
  console.log(`created ${path}`);
}

/** Parse `--flag value` pairs out of argv. */
function flags(args: string[]): Map<string, string> {
  const out = new Map<string, string>();
  for (let i = 0; i < args.length; i += 1) {
    if (args[i].startsWith('--')) {
      const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : '';
      out.set(args[i].slice(2), value);
    }
  }
  return out;
}

function parseStatus(flagsMap: Map<string, string>): 'live' | 'soon' {
  const status = flagsMap.get('status') ?? 'live';
  if (status !== 'live' && status !== 'soon') fail('--status must be live or soon');
  return status;
}

const PROJECT_PAGES: Array<[string, string, string]> = [
  ['index.mdx', 'Introduction', 'What this project is and how to read these notes.'],
  ['installation.mdx', 'Installation', 'How to run this project locally.'],
  ['monorepo.mdx', 'Monorepo', 'How the workspace is organised.'],
  ['folder-structure.mdx', 'Folder structure', 'Where everything lives and why.'],
  ['high-level.mdx', 'High-level architecture', 'The system in one diagram.'],
  ['low-level.mdx', 'Low-level diagrams', 'One diagram per folder, side by side.'],
  ['apps/index.mdx', 'apps/', 'What the runnable services own together.'],
  ['packages/index.mdx', 'packages/', 'What the shared libraries own together.'],
  ['end-to-end.mdx', 'End-to-end flow', 'Follow one action through the whole system.'],
];

function projectMeta(): string {
  return JSON.stringify(
    {
      title: 'Excalidraw',
      pages: [
        '---Get Started---',
        'index',
        'installation',
        'monorepo',
        '---Architecture---',
        'folder-structure',
        'high-level',
        'low-level',
        '---Folders---',
        'apps',
        'packages',
        '---How It Works---',
        'end-to-end',
      ],
    },
    null,
    2,
  );
}

function scaffoldProject(slug: string, name: string, status: 'live' | 'soon'): void {
  const dir = join(ROOT, 'content', 'projects', slug);
  if (existsSync(dir)) fail(`project ${slug} already exists`);
  write(join(dir, 'meta.json'), projectMeta() + '\n');
  for (const [file, title, description] of PROJECT_PAGES) {
    write(
      join(dir, file),
      `${frontMatter(title, description)}\n${title} content for ${name} goes here.\n`,
    );
  }
  write(
    join(dir, 'apps', 'meta.json'),
    JSON.stringify({ title: 'apps/', pages: ['index'] }, null, 2) + '\n',
  );
  write(
    join(dir, 'packages', 'meta.json'),
    JSON.stringify({ title: 'packages/', pages: ['index'] }, null, 2) + '\n',
  );

  // Register the project in the projects config.
  const configPath = join(ROOT, 'src', 'projects.config.ts');
  const config = readFileSync(configPath, 'utf8');
  const marker = '// __NEW_PROJECTS__ (appended by `pnpm new project <slug>`)';
  if (!config.includes(marker)) fail('projects.config.ts marker missing');
  const entry = `  {\n    id: '${slug}',\n    title: '${name.replace(/'/g, "\\'")}',\n    description: '${name} notes.',\n    summary: '${name} notes.', // TODO: short card summary (max 160 chars)\n    tags: [], // TODO: curated tags from content/taxonomy.ts PROJECT_TAGS\n    status: '${status}',\n    updated: '${new Date().toISOString().slice(0, 10)}',\n    documentedCommit: 'main', // TODO: pin the documented commit\n    repo: '', // TODO: project repository URL\n    source: { type: 'git', url: '', commit: 'main' }, // TODO: local path or git remote\n    workspaces: [], // TODO: folders that contain a package.json\n  },\n  ${marker}`;
  writeFileSync(configPath, config.replace(marker, entry));
  console.log(`registered ${slug} in src/projects.config.ts`);
}

function topicIntro(name: string, slug: string): string {
  return `${frontMatter(name, `${name} notes: start here.`)}
## In one sentence

${name} in one paragraph: what it is, when you reach for it, and what this
path will teach you. Replace this paragraph first.

## Why it matters

A real situation where ${name} shows up in everyday work. One concrete
example beats three abstract ones.

## Run it

<CodeRunner title="Say hello" expect="hello, ${slug}">
console.log("hello, ${slug}");
</CodeRunner>

## Common mistakes

- Mistake one: what goes wrong and the one-line fix.
- Mistake two: what goes wrong and the one-line fix.

## Try it

<Exercise
  title="Keep the greeting"
  tests={\`assert(greeting === "hello", "keeps the greeting");\`}
  solution={\`const greeting = "hello";\`}
>
const greeting = "hello";
</Exercise>

## Check yourself

<Quiz
  title="Check yourself"
  questions={[
    {
      question: "What is the first thing this path teaches?",
      options: [
        { text: "The one-sentence idea above", correct: true, why: "Start with the idea, then the details." },
        { text: "Every detail at once", correct: false, why: "Details come page by page; the idea comes first." },
      ],
    },
  ]}
/>

## Key takeaways

- Takeaway one: the single idea to remember from this page.
- Takeaway two: where to go next in this path.

## References

- [MDN Web Docs](https://developer.mozilla.org/) — replace with the sources you actually used.
`;
}

function topicYaml(
  slug: string,
  name: string,
  category: string,
  level: string,
  status: 'live' | 'soon',
  order: number,
): string {
  return [
    `id: ${slug}`,
    `title: ${name}`,
    `summary: ${name} notes. Replace with a card summary (max 160 chars).`,
    `category: ${category}`,
    `tags: []`,
    `level: ${level}`,
    `status: ${status}`,
    `order: ${order}`,
    `updated: '${new Date().toISOString().slice(0, 10)}'`,
    `keywords: []`,
    '',
  ].join('\n');
}

function scaffoldTopic(
  slug: string,
  name: string,
  category: string,
  level: string,
  status: 'live' | 'soon',
  order: number,
): void {
  const knownCategories = new Set(TOPIC_CATEGORIES.map((c) => c.id));
  if (!knownCategories.has(category)) {
    fail(`--category must be one of: ${[...knownCategories].join(', ')}`);
  }
  if (!(TOPIC_LEVELS as readonly string[]).includes(level)) {
    fail(`--level must be one of: ${TOPIC_LEVELS.join(', ')}`);
  }
  const dir = join(ROOT, 'content', 'topics', slug);
  if (existsSync(dir)) fail(`topic ${slug} already exists`);
  write(join(dir, 'topic.yaml'), topicYaml(slug, name, category, level, status, order));
  write(join(dir, 'meta.json'), JSON.stringify({ title: name, pages: ['index'] }, null, 2) + '\n');
  write(join(dir, 'index.mdx'), topicIntro(name, slug));
  console.log(`topic ${slug}: run \`pnpm build-catalog\` to add its card (no component edits needed)`);
}

function main(): void {
  const [kind, slug, ...rest] = process.argv.slice(2);
  if ((kind !== 'project' && kind !== 'topic') || !slug) {
    fail(
      'usage: pnpm new project <slug> [--name "Display name"] [--status live|soon]\n' +
        '   or: pnpm new topic <slug> --category <id> --level <level> [--name "Display name"] [--status live|soon] [--order N]',
    );
  }
  if (!/^[a-z0-9-]+$/.test(slug)) fail('slug must match ^[a-z0-9-]+$');
  const parsed = flags(rest);
  const name = parsed.get('name') || titleCase(slug);
  const status = parseStatus(parsed);
  if (kind === 'project') {
    scaffoldProject(slug, name, status);
  } else {
    const category = parsed.get('category') ?? '';
    const level = parsed.get('level') ?? '';
    if (!category || !level) fail('topic scaffold needs --category <id> and --level <level>');
    const order = Number(parsed.get('order') || '999');
    if (!Number.isFinite(order)) fail('--order must be a number');
    scaffoldTopic(slug, name, category, level, status, order);
  }
}

main();
