/**
 * Data-driven diagram specs.
 *
 * Visual language (fixed for every diagram):
 * - SOLID edge  = durable data (committed elements, database rows).
 * - DASHED edge = ephemeral data (presence, previews, selections, laser, viewport).
 * - Node colour = system layer: Browser, API, Realtime, Cache, Database, Shared.
 * - Max 12 nodes, labels of 1-3 words, no code.
 *
 * `sources` lists real paths inside the documented repo and is
 * verified by scripts/check-sources.ts — every entry must exist.
 */
export type DiagramLayer =
  | 'browser'
  | 'api'
  | 'realtime'
  | 'cache'
  | 'database'
  | 'shared';

export interface DiagramNodeSpec {
  id: string;
  label: string;
  layer: DiagramLayer;
  /** True for nodes that live outside the folder being described. */
  external?: boolean;
}

export interface DiagramEdgeSpec {
  from: string;
  to: string;
  kind: 'solid' | 'dashed';
  label?: string;
}

export interface DiagramSpec {
  id: string;
  title: string;
  nodes: DiagramNodeSpec[];
  edges: DiagramEdgeSpec[];
  sources: string[];
}

export const LAYER_LABEL: Record<DiagramLayer, string> = {
  browser: 'Browser',
  api: 'API',
  realtime: 'Realtime',
  cache: 'Cache',
  database: 'Database',
  shared: 'Shared',
};
