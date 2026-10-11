/**
 * Scaffold a new project or topic with zero new components:
 * only MDX files (and later, diagram spec files) are created.
 *
 * Usage:
 *   pnpm new project <slug> [--name "Display name"]
 *   pnpm new topic <slug> [--name "Display name"]
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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

function scaffoldProject(slug: string, name: string): void {
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
  const entry = `  {\n    id: '${slug}',\n    title: '${name.replace(/'/g, "\\'")}',\n    description: '${name} notes.',\n    tags: [],\n    status: 'live',\n    documentedCommit: 'main', // TODO: pin the documented commit\n    repo: '', // TODO: project repository URL\n    source: { type: 'git', url: '', commit: 'main' }, // TODO: local path or git remote\n    workspaces: [], // TODO: folders that contain a package.json\n  },\n  ${marker}`;
  writeFileSync(configPath, config.replace(marker, entry));
  console.log(`registered ${slug} in src/projects.config.ts`);
}

function scaffoldTopic(slug: string, name: string): void {
  const dir = join(ROOT, 'content', 'topics', slug);
  if (existsSync(dir)) fail(`topic ${slug} already exists`);
  write(join(dir, 'meta.json'), JSON.stringify({ title: name, pages: ['index'] }, null, 2) + '\n');
  write(
    join(dir, 'index.mdx'),
    `${frontMatter(name, `${name} notes.`)}\n${name} content goes here.\n`,
  );
}

function main(): void {
  const [kind, slug, ...rest] = process.argv.slice(2);
  if ((kind !== 'project' && kind !== 'topic') || !slug) {
    fail('usage: pnpm new (project|topic) <slug> [--name "Display name"]');
  }
  if (!/^[a-z0-9-]+$/.test(slug)) fail('slug must match ^[a-z0-9-]+$');
  const nameFlag = rest.indexOf('--name');
  const name = nameFlag >= 0 && rest[nameFlag + 1] ? rest[nameFlag + 1] : titleCase(slug);
  if (kind === 'project') scaffoldProject(slug, name);
  else scaffoldTopic(slug, name);
}

main();
