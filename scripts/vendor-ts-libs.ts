/**
 * Vendor the sandbox compiler's lib .d.ts files for lazy browser loading,
 * plus machine-readable metadata (version, compiler bytes, file list).
 *
 * Output (committed, like catalog.json):
 * - public/ts-libs/<version>/*.d.ts  (fetched on demand by the TS worker)
 * - generated/ts-compiler.json        (version/size display, bundle audit)
 *
 * The compiler itself is NEVER copied: the worker chunk bundles it from
 * the pinned `typescript6` alias. Run in `prebuild` before the checks.
 *
 * Usage: pnpm vendor-ts-libs
 */
import { createRequire } from 'node:module';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { SANDBOX_TS_VERSION } from '../src/lib/ts-compiler';

const ROOT = join(__dirname, '..');

function realLibDir(): { libDir: string; compilerBytes: number } {
  const req = createRequire(join(ROOT, 'scripts', 'vendor-ts-libs.ts'));
  const stub = req.resolve('typescript6');
  const req2 = createRequire(stub);
  const oldPkgJson = req2.resolve('@typescript/old/package.json');
  const libDir = join(dirname(oldPkgJson), 'lib');
  const compilerBytes = statSync(join(libDir, 'typescript.js')).size;
  return { libDir, compilerBytes };
}

function main(): void {
  const { libDir, compilerBytes } = realLibDir();
  const files = readdirSync(libDir)
    .filter((f) => f.startsWith('lib.') && f.endsWith('.d.ts'))
    .sort();
  if (files.length === 0) {
    console.error('vendor-ts-libs: no lib files found');
    process.exit(1);
  }
  const outDir = join(ROOT, 'public', 'ts-libs', SANDBOX_TS_VERSION);
  mkdirSync(outDir, { recursive: true });
  for (const f of files) copyFileSync(join(libDir, f), join(outDir, f));
  mkdirSync(join(ROOT, 'generated'), { recursive: true });
  writeFileSync(
    join(ROOT, 'generated', 'ts-compiler.json'),
    JSON.stringify(
      { version: SANDBOX_TS_VERSION, compilerBytes, libFiles: files },
      null,
      2,
    ) + '\n',
  );
  console.log(
    `vendor-ts-libs: ${files.length} lib files, compiler ${(compilerBytes / 1048576).toFixed(1)} MB`,
  );
}

main();
