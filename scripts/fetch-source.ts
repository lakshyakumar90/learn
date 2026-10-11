/**
 * Materialise every `git` project source into .cache/sources/<id>.
 *
 * Shallow-clones (blob filter, no checkout), fetches the pinned commit,
 * and checks it out. Skips work when the cache already sits on the pinned
 * commit. FAILS when the pinned commit cannot be fetched — the docs must
 * never silently describe a different tree.
 *
 * Local sources are only existence-checked here; the dep and source
 * checks handle a missing sibling with their deploy fallback.
 *
 * Usage: pnpm fetch-source (runs first in `prebuild`).
 */
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { PROJECTS } from '../src/projects.config';
import { cacheDir, LEARN_ROOT as ROOT } from './project-sources';

function git(dest: string, args: string): string {
  return execSync(`git -C "${dest}" ${args}`, { encoding: 'utf8' }).trim();
}

function main(): void {
  mkdirSync(join(ROOT, '.cache', 'sources'), { recursive: true });
  for (const project of PROJECTS) {
    if (project.source.type === 'local') {
      const dir = join(ROOT, project.source.path);
      if (!existsSync(dir)) {
        console.warn(`fetch-source: local source for ${project.id} absent at ${dir} (deploy fallback applies)`);
      } else {
        console.log(`fetch-source: ${project.id} uses local source at ${dir}`);
      }
      continue;
    }
    const dest = cacheDir(project.id);
    const want = project.source.commit;
    try {
      if (!existsSync(join(dest, '.git'))) {
        console.log(`fetch-source: cloning ${project.source.url} into ${dest}`);
        execSync(
          `git clone --filter=blob:none --no-checkout "${project.source.url}" "${dest}"`,
          { stdio: 'inherit' },
        );
      }
      // A fresh --no-checkout clone has no worktree; check the pin out.
      const worktreeEmpty = readdirSync(dest).filter((n) => n !== '.git').length === 0;
      const head = worktreeEmpty ? '' : git(dest, 'rev-parse HEAD');
      const expected = git(dest, `rev-parse --verify ${want}`);
      if (worktreeEmpty || head !== expected) {
        console.log(`fetch-source: checking out pinned commit ${want} for ${project.id}`);
        execSync(`git -C "${dest}" fetch origin`, { stdio: 'inherit' });
        execSync(`git -C "${dest}" checkout ${want}`, { stdio: 'inherit' });
      }
      const finalHead = git(dest, 'rev-parse HEAD');
      const finalExpected = git(dest, `rev-parse --verify ${want}`);
      if (finalHead !== finalExpected) {
        console.error(`fetch-source: ${project.id} sits on ${finalHead}, want ${finalExpected}`);
        process.exit(1);
      }
      const date = git(dest, 'log -1 --format=%ci');
      console.log(`fetch-source: ${project.id} at ${finalHead.slice(0, 7)} (${date})`);
    } catch (e) {
      console.error(`fetch-source: cannot materialise ${project.id} at ${want} (${(e as Error).message})`);
      process.exit(1);
    }
  }
}

main();
