/**
 * The single registry of documented projects. Everything data-driven —
 * dependency extraction, source checks, search, landing cards, the docs
 * navbar switcher, and the per-project sidebars — reads this file.
 *
 * For each project:
 * - id:            URL slug and content folder (content/projects/<id>).
 * - title:         display name.
 * - description:   one-line card/landing text.
 * - tags:          landing card chips.
 * - status:        'live' (documented) or 'soon' (placeholder).
 * - documentedCommit: short sha the notes describe; shown on every page.
 * - repo:          public repository URL (sidebar icon, permalinks).
 * - source:        { type: 'local', path } for a sibling checkout, or
 *                  { type: 'git', url, commit } for a remote that
 *                  scripts/fetch-source.ts clones into .cache/sources/<id>.
 * - workspaces:    explicit list of folders that contain a package.json,
 *                  relative to the source root ('.' = the root itself).
 * - scanDir:       folder inside each workspace to scan for imports
 *                  (default 'src'; '.' scans the whole workspace).
 * - aliases:       virtual workspace keys mapping to real workspace paths.
 * - titles:        display titles for workspace paths (falls back to the
 *                  folder name in Title Case).
 * - rootPage:      docs slug that '.' workspace links point at.
 * - ignore:        directory basenames skipped while scanning sources.
 * - platform:      'web' or 'mobile' (landing badge, demo frames).
 * - cover:         optional cover image path under public/ for cards.
 * - diagramLayers: layer keys shown in this project's diagram legend.
 * - diagramLegend: solid/dashed line labels (and screen-reader hints).
 */

export type ProjectSource =
  | { type: 'local'; path: string }
  | { type: 'git'; url: string; commit: string };

export interface DiagramLegendText {
  solid: string;
  solidHint: string;
  dashed: string;
  dashedHint: string;
}

export interface ProjectConfig {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: 'live' | 'soon';
  documentedCommit: string;
  repo: string;
  source: ProjectSource;
  workspaces: string[];
  scanDir?: string;
  aliases?: Record<string, string[]>;
  titles?: Record<string, string>;
  rootPage?: string;
  ignore?: string[];
  platform: 'web' | 'mobile';
  cover?: string;
  diagramLayers: string[];
  diagramLegend: DiagramLegendText;
}

/** Registry categories shared by every project (checks + tables + map). */
export const CATEGORY_ORDER = [
  'Language and build',
  'Frontend framework',
  'UI and styling',
  'State',
  'Rendering and canvas',
  'Realtime and queues',
  'Realtime',
  'Backend framework',
  'Database and ORM',
  'Database and ODM',
  'File storage',
  'Email',
  'Auth and email',
  'Validation',
  'Testing',
  'Linting and formatting',
  'Monorepo tooling',
  'Mobile framework',
  'Navigation',
  'Local data',
  'Device APIs',
  'Styling',
  'Animation and gestures',
  'Auth and cloud',
  'Other',
];

const WEB_LAYERS = ['browser', 'api', 'realtime', 'cache', 'database', 'shared'];

const WEB_LEGEND: DiagramLegendText = {
  solid: 'durable',
  solidHint: 'durable data',
  dashed: 'ephemeral',
  dashedHint: 'ephemeral data',
};

export const PROJECTS: ProjectConfig[] = [
  {
    id: 'excalidraw',
    title: 'Excalidraw',
    description:
      'A collaborative drawing workspace: guest storage, authenticated scenes, real-time rooms, and Redis write-behind persistence.',
    tags: ['Next.js', 'TypeScript', 'WebSocket', 'Redis', 'Postgres'],
    status: 'live',
    documentedCommit: 'b0026d9',
    repo: 'https://github.com/lakshyakumar90/excalidraw',
    source: { type: 'local', path: '../excalidraw' },
    workspaces: [
      '.',
      'apps/web',
      'apps/http-server',
      'apps/ws-server',
      'apps/flush-worker',
      'packages/common',
      'packages/engine',
      'packages/backend-common',
      'packages/db',
      'packages/auth',
      'packages/redis',
      'packages/validations',
      'packages/ui',
      'packages/eslint-config',
      'packages/typescript-config',
    ],
    scanDir: 'src',
    aliases: {
      'packages/tooling': ['packages/eslint-config', 'packages/typescript-config'],
    },
    titles: {
      '.': 'Monorepo',
      apps: 'apps/',
      'apps/web': 'Web',
      'apps/http-server': 'HTTP server',
      'apps/ws-server': 'WebSocket server',
      'apps/flush-worker': 'Flush worker',
      packages: 'packages/',
      'packages/common': 'Common',
      'packages/engine': 'Engine',
      'packages/backend-common': 'Backend common',
      'packages/db': 'Database',
      'packages/auth': 'Auth',
      'packages/redis': 'Redis',
      'packages/validations': 'Validations',
      'packages/ui': 'UI',
      'packages/tooling': 'Tooling configs',
      'packages/eslint-config': 'Tooling configs',
      'packages/typescript-config': 'Tooling configs',
    },
    rootPage: 'monorepo',
    ignore: ['node_modules', 'dist', '.next', 'coverage', '.turbo', '.git'],
    platform: 'web',
    diagramLayers: WEB_LAYERS,
    diagramLegend: WEB_LEGEND,
  },
  {
    id: 'devconnect',
    title: 'DevConnect',
    description:
      'A social platform for developers: profiles, connections, feed posts, jobs, notifications, and real-time chat.',
    tags: ['React 19', 'Express 5', 'MongoDB', 'Socket.io', 'Redis'],
    status: 'live',
    documentedCommit: 'cdef8af',
    repo: 'https://github.com/lakshyakumar90/mini-project',
    source: { type: 'git', url: 'https://github.com/lakshyakumar90/mini-project', commit: 'cdef8af' },
    workspaces: ['backend', 'frontend'],
    scanDir: '.',
    titles: {
      backend: 'Backend',
      frontend: 'Frontend',
    },
    rootPage: 'project-structure',
    ignore: ['node_modules', 'dist', '.git', '.claude', '.codex', '.cursor', '.github', 'uploads'],
    platform: 'web',
    diagramLayers: WEB_LAYERS,
    diagramLegend: WEB_LEGEND,
  },
  {
    id: 'habitly',
    title: 'Habitly',
    description:
      'A mobile habit tracker: offline-first habits and tasks with SQLite, reminders, stats, and optional Firebase cloud sync.',
    tags: ['Expo', 'React Native', 'TypeScript', 'SQLite', 'Firebase'],
    status: 'live',
    documentedCommit: '99a2c3d',
    repo: 'https://github.com/lakshyakumar90/habit-tracker',
    source: { type: 'git', url: 'https://github.com/lakshyakumar90/habit-tracker', commit: '99a2c3d' },
    workspaces: ['.'],
    scanDir: '.',
    titles: {
      '.': 'Habitly app',
    },
    rootPage: 'project-structure',
    ignore: ['node_modules', 'dist', '.git', '.claude', '.codex', '.cursor', '.vscode', '.expo'],
    platform: 'mobile',
    diagramLayers: ['screens', 'features', 'localdata', 'device', 'cloud'],
    diagramLegend: {
      solid: 'on-device data',
      solidHint: 'data stored on the device (SQLite)',
      dashed: 'cloud sync',
      dashedHint: 'optional cloud sync, not always active',
    },
  },
  // __NEW_PROJECTS__ (appended by `pnpm new project <slug>`)
];

export function getProject(id: string): ProjectConfig | undefined {
  return PROJECTS.find((p) => p.id === id);
}

/** Files that look like env secrets: skipped by every source scan. */
export function isEnvSecretFile(basename: string): boolean {
  if (!basename.startsWith('.env')) return false;
  return !basename.endsWith('.example');
}

/** Permalink to a source path at the documented commit. */
export function permalink(project: ProjectConfig, path: string): string {
  return `${project.repo}/blob/${project.documentedCommit}/${path}`;
}
