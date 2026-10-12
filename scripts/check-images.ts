import { existsSync, readFileSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { load } from "js-yaml";
import { imageSize } from "image-size";
import { mdxFiles } from "./javascript-content";
interface ManifestImage {
  id: string;
  page: string;
  src: string;
  darkSrc?: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  size: number;
  date: string;
  containsText: boolean;
  prompt: string;
}
const file = join(
  process.cwd(),
  "content/topics/javascript/images.manifest.yaml",
);
const manifest = load(readFileSync(file, "utf8")) as {
  images: ManifestImage[];
};
const errors: string[] = [];
const ids = new Set<string>();
const references = new Set<string>();
const pages = mdxFiles();
for (const page of pages) {
  const text = readFileSync(page, "utf8");
  for (const m of text.matchAll(
    /<(Illustration|AnnotatedImage)\s+id="([^"]+)"/g,
  ))
    references.add(m[2]);
  for (const m of text.matchAll(/<Storyboard\s[\s\S]*?ids=\{(\[[\s\S]*?\])\}/g))
    for (const id of JSON.parse(m[1])) references.add(id);
  for (const m of text.matchAll(/\/topics\/javascript\/img\/([\w-]+)\.webp/g))
    references.add(m[1].replace(/-dark$/, ""));
}
for (const entry of manifest.images) {
  if (ids.has(entry.id)) errors.push(`Duplicate image ${entry.id}`);
  ids.add(entry.id);
  if (
    !entry.alt?.trim() ||
    !entry.caption?.trim() ||
    !entry.prompt?.trim() ||
    !entry.page ||
    !/\d{4}-\d{2}-\d{2}/.test(entry.date) ||
    entry.containsText !== false
  )
    errors.push(`${entry.id}: missing metadata or containsText is not false`);
  if (!references.has(entry.id))
    errors.push(`${entry.id}: unused manifest image`);
  if (
    !existsSync(
      join(process.cwd(), "content/topics/javascript", entry.page + ".mdx"),
    )
  )
    errors.push(`${entry.id}: invalid owning page`);
  for (const src of [entry.src, entry.darkSrc].filter(Boolean) as string[]) {
    if (!/^\/topics\/javascript\/img\/[\w-]+\.webp$/.test(src)) {
      errors.push(`${entry.id}: invalid image path`);
      continue;
    }
    const path = join(process.cwd(), "public", src.slice(1));
    if (!existsSync(path)) {
      errors.push(`${entry.id}: missing ${src}`);
      continue;
    }
    const size = statSync(path).size;
    const dimensions = imageSize(readFileSync(path));
    if (size > 150 * 1024) errors.push(`${entry.id}: exceeds 150 KB`);
    if (src === entry.src && size !== entry.size)
      errors.push(`${entry.id}: manifest size does not match`);
    if (
      dimensions.width !== entry.width ||
      dimensions.height !== entry.height ||
      entry.width > 1600 ||
      !entry.height
    )
      errors.push(`${entry.id}: dimensions do not match or exceed 1600px`);
  }
}
for (const id of references)
  if (!ids.has(id)) errors.push(`Unregistered image ${id}`);
const registered = new Set(
  manifest.images.flatMap((i) => [i.src, i.darkSrc].filter(Boolean)),
);
for (const name of readdirSync(
  join(process.cwd(), "public/topics/javascript/img"),
))
  if (
    name.endsWith(".webp") &&
    !registered.has("/topics/javascript/img/" + name)
  )
    errors.push(`Unregistered asset ${name}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `check-images: ${manifest.images.length} illustrations and their variants OK`,
);
