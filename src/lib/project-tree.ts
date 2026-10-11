import type { Folder, Node, Root } from 'fumadocs-core/page-tree';

/** Candidate identifiers for a project folder node, most specific first. */
function folderIds(node: Folder): string[] {
  const ids: Array<string | undefined> = [
    node.index?.url,
    node.$id,
    node.$ref?.folder,
    node.$ref?.meta,
  ];
  return ids.filter((id): id is string => typeof id === 'string' && id.length > 0);
}

/**
 * Narrow a collection page tree to one project sidebar root
 * (e.g. `excalidraw` inside the projects collection).
 * Returns null when the project folder is missing.
 */
export function projectSubtree(
  tree: Root,
  baseUrl: string,
  project: string,
): Root | null {
  const target = `${baseUrl}/${project}`;
  const folder = tree.children.find((node: Node): node is Folder => {
    if (node.type !== 'folder') return false;
    return folderIds(node).some(
      (id) =>
        id === target ||
        id === project ||
        id === `content/${project}` ||
        id.endsWith(`/${project}`) ||
        id.endsWith(`/${project}/meta.json`),
    );
  });
  if (!folder) return null;
  return { ...tree, children: folder.children };
}
