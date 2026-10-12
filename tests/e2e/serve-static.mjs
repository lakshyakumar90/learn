/**
 * Minimal static server for Playwright: serves out/ with clean-URL
 * resolution like the production host (/topics -> topics.html,
 * /topics/category/orms -> topics/category/orms.html).
 *
 * Usage: node tests/e2e/serve-static.mjs [port] [dir]
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.argv[2] ?? '3100');
const DIR = process.argv[3] ?? 'out';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
};

function resolve(urlPath) {
  const clean = normalize(urlPath.split('?')[0]).replace(/^[/\\]+/, '').replace(/[/\\]$/, '');
  const candidates = [
    join(DIR, `${clean}.html`),
    join(DIR, clean, 'index.html'),
    join(DIR, clean),
  ];
  if (clean === '') candidates.unshift(join(DIR, 'index.html'));
  for (const file of candidates) {
    try {
      if (existsSync(file) && statSync(file).isFile()) return file;
    } catch {
      /* next */
    }
  }
  return null;
}

createServer((req, res) => {
  const file = resolve(req.url ?? '/');
  if (!file || file.includes('..')) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(PORT, '127.0.0.1', () => console.log(`static: http://127.0.0.1:${PORT} -> ${DIR}`));
