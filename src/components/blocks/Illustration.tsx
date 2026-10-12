import { readFileSync } from "node:fs";
import { load } from "js-yaml";
import { join } from "node:path";
import type { ImageAsset } from "./IllustrationClient";
import {
  IllustrationClient,
  StoryboardClient,
  AnnotatedImageClient,
} from "./image-client-blocks";
export function imageAssets(): ImageAsset[] {
  return (
    load(
      readFileSync(
        join(process.cwd(), "content/topics/javascript/images.manifest.yaml"),
        "utf8",
      ),
    ) as { images: ImageAsset[] }
  ).images;
}
function asset(id: string) {
  const found = imageAssets().find((image) => image.id === id);
  if (!found) throw new Error(`Unknown illustration ${id}`);
  return found;
}
export function Illustration({ id }: { id: string }) {
  return <IllustrationClient asset={asset(id)} />;
}
export function Storyboard({
  ids,
  title,
  captions,
}: {
  ids: string[];
  title: string;
  captions?: string[];
}) {
  return (
    <StoryboardClient
      assets={ids.map(asset)}
      title={title}
      captions={captions}
    />
  );
}
export function AnnotatedImage({
  id,
  hotspots,
}: {
  id: string;
  hotspots: Array<{ x: number; y: number; title: string; detail: string }>;
}) {
  return <AnnotatedImageClient asset={asset(id)} hotspots={hotspots} />;
}
