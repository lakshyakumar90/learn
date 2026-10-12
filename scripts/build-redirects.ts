/**
 * Emit static redirect pages for removed JavaScript URLs. Reads
 * content/topics/javascript/redirects.json (old slug -> new slug) and
 * writes public/topics/javascript/<old>.html files with a meta refresh
 * plus a visible link, so old links land on the closest new page.
 *
 * Usage: pnpm build-redirects (runs in `prebuild`).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function main(): void {
  const mapFile = join(ROOT, 'content', 'topics', 'javascript', 'redirects.json');
  const map = JSON.parse(readFileSync(mapFile, 'utf8')) as Record<string, string>;
  let count = 0;
  for (const [oldSlug, newSlug] of Object.entries(map)) {
    if (oldSlug.includes('..') || newSlug.includes('..')) {
      console.error(`build-redirects: refusing unsafe slug "${oldSlug}"`);
      process.exit(1);
    }
    const target = `/topics/javascript/${newSlug}`;
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
    const out = join(ROOT, 'public', 'topics', 'javascript', `${oldSlug}.html`);
    mkdirSync(join(out, '..'), { recursive: true });
    writeFileSync(out, html);
    count += 1;
  }
  if (!existsSync(mapFile)) {
    console.error('build-redirects: redirects.json missing');
    process.exit(1);
  }
  console.log(`build-redirects: ${count} redirect page(s)`);
}

main();
