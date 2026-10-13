/**
 * Emit static redirect pages for removed topic URLs. Reads
 * content/topics/<dir>/redirects.json (old slug -> new slug) for every
 * topic that has one and writes public/topics/<dir>/<old>.html files
 * with a meta refresh plus a visible link, so old links land on the
 * closest new page.
 *
 * Usage: pnpm build-redirects (runs in `prebuild`).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function main(): void {
  let count = 0;
  for (const dir of readdirSync(join(ROOT, 'content', 'topics'))) {
    const mapFile = join(ROOT, 'content', 'topics', dir, 'redirects.json');
    if (!existsSync(mapFile)) continue;
    const map = JSON.parse(readFileSync(mapFile, 'utf8')) as Record<string, string>;
  for (const [oldSlug, newSlug] of Object.entries(map)) {
    if (oldSlug.includes('..') || newSlug.includes('..')) {
      console.error(`build-redirects: refusing unsafe slug "${oldSlug}"`);
      process.exit(1);
    }
    const target = `/topics/${dir}/${newSlug}`;
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Lesson moved</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${escapeHtml(target)}">
<link rel="canonical" href="${escapeHtml(target)}">
</head>
<body>
<p>This lesson moved to <a href="${escapeHtml(target)}">${escapeHtml(target)}</a>.</p>
</body>
</html>
`;
    const out = join(ROOT, 'public', 'topics', dir, `${oldSlug}.html`);
    mkdirSync(join(out, '..'), { recursive: true });
    writeFileSync(out, html);
    count += 1;
  }
  }
  console.log(`build-redirects: ${count} redirect page(s)`);
}

main();
