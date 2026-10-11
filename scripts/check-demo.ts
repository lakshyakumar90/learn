/**
 * Validate every content/projects/<id>/demo.yaml.
 *
 * FAILS the build when:
 * - a demo.yaml is missing, unparsable, or violates the zod schema
 *   (alt and caption are required on every item),
 * - a featureLink points at an internal page that does not exist,
 * - a referenced local file does not exist under public/,
 * - any single media file is over 90 MB.
 *
 * WARNS with a per-project placeholder count, for images over 500 KB
 * and videos over 25 MB.
 *
 * Media note: do not commit large videos to git (GitHub rejects files
 * over 100 MB). Use YouTube or another host, or Git LFS — and prefer
 * WebP/AVIF for images.
 *
 * Usage: pnpm check-demo (runs in `prebuild`).
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { load as loadYaml } from 'js-yaml';
import { PROJECTS } from '../src/projects.config';
import { DemoYaml, isPlaceholder, localMediaPath, type DemoMediaItem } from '../src/lib/demo';

const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'content');
const PUBLIC = join(ROOT, 'public');

const IMAGE_WARN = 500 * 1024;
const VIDEO_WARN = 25 * 1024 * 1024;
const FAIL_BYTES = 90 * 1024 * 1024;

const errors: string[] = [];
const warnings: string[] = [];
const fail = (message: string) => errors.push(message);
const warn = (message: string) => warnings.push(message);

function internalPageExists(href: string): boolean {
  const clean = href.split('#')[0];
  const match = clean.match(/^\/(projects|topics|books)(\/.*)?$/);
  if (!match) return false;
  const parts = (match[2] ?? '/').replace(/^\//, '').split('/').filter(Boolean);
  const base = join(CONTENT, match[1], ...parts);
  return existsSync(`${base}.mdx`) || existsSync(`${base}.md`) || existsSync(join(base, 'index.mdx'));
}

function checkFeatureLink(project: string, where: string, link?: string): void {
  if (!link) return;
  if (/^https?:\/\//.test(link)) return;
  if (!internalPageExists(link)) fail(`demo/${project}: ${where} has unknown featureLink "${link}"`);
}

function checkFile(project: string, where: string, src?: string): void {
  const local = localMediaPath(src);
  if (!local) return;
  const full = join(PUBLIC, local);
  if (!existsSync(full)) {
    fail(`demo/${project}: ${where} references missing file "${src}"`);
    return;
  }
  const size = statSync(full).size;
  if (size > FAIL_BYTES) {
    fail(`demo/${project}: ${where} file "${src}" is over 90 MB`);
    return;
  }
  if (/\.(mp4|webm|mov)$/i.test(local) && size > VIDEO_WARN) {
    warn(`demo/${project}: video "${src}" is over 25 MB`);
  } else if (/\.(png|jpe?g|webp|avif|gif|svg)$/i.test(local) && size > IMAGE_WARN) {
    warn(`demo/${project}: image "${src}" is over 500 KB`);
  }
}

function checkItem(project: string, where: string, item: DemoMediaItem): boolean {
  checkFeatureLink(project, where, item.featureLink);
  if (isPlaceholder(item)) return true;
  checkFile(project, where, item.src);
  checkFile(project, `${where} poster`, item.poster);
  return false;
}

function main(): void {
  for (const project of PROJECTS.filter((p) => p.status === 'live')) {
    const file = join(CONTENT, 'projects', project.id, 'demo.yaml');
    if (!existsSync(file)) {
      fail(`demo/${project.id}: demo.yaml is missing`);
      continue;
    }
    let data;
    try {
      data = DemoYaml.parse(loadYaml(readFileSync(file, 'utf8')));
    } catch (e) {
      fail(`demo/${project.id}: invalid demo.yaml (${(e as Error).message})`);
      continue;
    }
    let placeholders = 0;
    let total = 1; // hero
    if (isPlaceholder(data.hero)) placeholders += 1;
    checkFile(project.id, 'hero', data.hero.src);
    checkFile(project.id, 'hero poster', data.hero.poster);
    for (const section of data.sections) {
      section.items.forEach((item, i) => {
        total += 1;
        if (checkItem(project.id, `section "${section.id}" item ${i}`, item)) placeholders += 1;
      });
    }
    for (const w of data.walkthroughs) {
      const section = data.sections.find((s) => s.id === w.section);
      if (!section) {
        fail(`demo/${project.id}: walkthrough "${w.id}" points at unknown section "${w.section}"`);
        continue;
      }
      if (!section.items[w.index]) {
        fail(`demo/${project.id}: walkthrough "${w.id}" points at missing item ${w.index}`);
        continue;
      }
      checkFeatureLink(project.id, `walkthrough "${w.id}"`, w.featureLink);
    }
    warn(`demo/${project.id}: ${placeholders} of ${total} media slots are placeholders`);
    console.log(`check-demo: ${project.id} OK (${data.sections.length} sections, ${data.walkthroughs.length} walkthroughs)`);
  }

  for (const w of warnings) console.warn(`check-demo warning: ${w}`);
  if (errors.length > 0) {
    console.error(`check-demo: ${errors.length} problem(s)\n- ${errors.join('\n- ')}`);
    process.exit(1);
  }
  console.log('check-demo: OK');
}

main();
