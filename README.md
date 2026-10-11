# learn

Read-only, diagram-first notes on real codebases. Next.js App Router +
Fumadocs, statically exported. Documented projects live outside this repo;
this site only reads them.

## Projects registry

`src/projects.config.ts` is the single registry. Each entry carries its id,
title, description, tags, status, documented commit, repo URL, source
(`{ type: 'local', path }` for a sibling checkout or `{ type: 'git', url,
commit }` for a remote), the explicit workspace list (folders containing a
`package.json`), and ignore globs. Scripts, search, landing cards, the
navbar switcher, and dependency tables all read it — nothing hardcodes a
project elsewhere.

## Pipeline

`pnpm build` runs `prebuild` first, in this order:

1. `pnpm fetch-source` — shallow-clones every `git` source into
   `.cache/sources/<id>` (gitignored) and checks out the pinned commit.
   Fails when the pinned commit cannot be fetched.
2. `pnpm extract-deps` — scans each project's workspaces for declared vs
   imported dependencies and file counts; writes `generated/deps.json` and
   `generated/libraries.json` (per-project sections).
3. `pnpm check-deps` — fails when an external dependency lacks a
   `content/projects/<id>/libraries.yaml` entry, or an entry is stale.
4. `pnpm check-sources` — fails when a cited source path, diagram id, flow
   id, or talksTo link does not resolve (paths resolve under the owning
   project's source root, whether local or cached).
5. `pnpm check-demo` — validates every `content/projects/<id>/demo.yaml`
   (alt/caption required, featureLinks resolve, local files exist; fails a
   single file over 90 MB, warns over 500 KB images / 25 MB videos, and
   reports remaining placeholder counts).
6. `pnpm build-search-index` — writes `public/search-index.json` with a
   project badge per project page.

Where a local source is absent (deploy clones only this repo), the steps
reuse the committed `generated/` files instead of failing.

## Bumping a pinned commit

1. In `src/projects.config.ts`, update the project's `documentedCommit`
   (and the git source `commit` for remote projects).
2. Re-run `pnpm fetch-source` and confirm the logged date matches.
3. Re-read the changed sources; update pages, diagrams, flows, and
   `libraries.yaml` to match.
4. Run `pnpm extract-deps && pnpm check-deps && pnpm check-sources` and fix
   everything they flag.
5. Commit the code changes **plus** the regenerated `generated/` files.

Never copy uploaded files, PDFs, images, or env values into the site.
`.env` contents stay out; only variable names and placeholders are
documented.

## Demo media

Each project's `demo.yaml` drives its Demo page. Replacing a placeholder
takes two steps: drop the file into `public/media/<project>/` and set its
`src` in `demo.yaml`. Do not commit large videos to git (GitHub rejects
files over 100 MB) — use YouTube or another host, or Git LFS — and prefer
WebP/AVIF for images.

## Scaffolding

`pnpm new project <slug>` / `pnpm new topic <slug>` scaffolds MDX pages and
registers the project in `src/projects.config.ts`.
