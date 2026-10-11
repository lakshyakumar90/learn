import ELK from 'elkjs';
import type { ElkNode } from 'elkjs';
import type { Node, Edge } from '@xyflow/react';
import type {
  DiagramLayer,
  DiagramNodeSpec,
  DiagramSpec,
} from '../../content/diagrams/types';

export const NODE_WIDTH = 150;
export const NODE_HEIGHT = 58;

export interface PlacedNode extends DiagramNodeSpec {
  x: number;
  y: number;
}

export interface PlacedDiagram {
  nodes: PlacedNode[];
  width: number;
  height: number;
}

let elk: InstanceType<typeof ELK> | null = null;

function getElk(): InstanceType<typeof ELK> {
  if (!elk) elk = new ELK();
  return elk;
}

/** Memoized layouts by diagram id: inline and expanded views share one result. */
const layoutCache = new Map<string, Promise<PlacedDiagram>>();

export function getLayout(spec: DiagramSpec): Promise<PlacedDiagram> {
  let pending = layoutCache.get(spec.id);
  if (!pending) {
    pending = layoutDiagram(spec);
    layoutCache.set(spec.id, pending);
  }
  return pending;
}

/** Lay a spec out left-to-right with elkjs. Runs in the browser. */
export async function layoutDiagram(spec: DiagramSpec): Promise<PlacedDiagram> {
  const graph: ElkNode = {
    id: spec.id,
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '36',
      'elk.layered.spacing.nodeNodeBetweenLayers': '72',
      'elk.spacing.edgeNode': '24',
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
    },
    children: spec.nodes.map((n) => ({
      id: n.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    })),
    edges: spec.edges.map((e, i) => ({
      id: `e${i}`,
      sources: [e.from],
      targets: [e.to],
    })),
  };

  const laid = await getElk().layout(graph);
  const nodes: PlacedNode[] = spec.nodes.map((n) => {
    const placed = laid.children?.find((c) => c.id === n.id);
    return { ...n, x: placed?.x ?? 0, y: placed?.y ?? 0 };
  });
  const width = Math.max(...nodes.map((n) => n.x + NODE_WIDTH), 0) + 24;
  const height = Math.max(...nodes.map((n) => n.y + NODE_HEIGHT), 0) + 24;
  return { nodes, width, height };
}

export type FlowNodeData = {
  label: string;
  layer: DiagramLayer;
  external?: boolean;
  dimmed?: boolean;
  /** 'xl' renders larger text/padding in expanded views (same box, same layout). */
  variant?: 'md' | 'xl';
};

export function toFlowNodes(
  placed: PlacedDiagram,
  activeIds?: Set<string>,
  variant: 'md' | 'xl' = 'md',
): Node<FlowNodeData>[] {
  return placed.nodes.map((n) => ({
    id: n.id,
    type: 'layer',
    position: { x: n.x, y: n.y },
    data: {
      label: n.label,
      layer: n.layer,
      external: n.external,
      dimmed: activeIds ? !activeIds.has(n.id) : false,
      variant,
    },
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    selectable: false,
    draggable: false,
  }));
}

export function toFlowEdges(
  spec: DiagramSpec,
  activeKeys?: Set<string>,
): Edge[] {
  return spec.edges.map((e, i) => {
    const key = `${e.from}>${e.to}:${e.kind}`;
    const dimmed = activeKeys ? !activeKeys.has(key) : false;
    return {
      id: `e${i}`,
      source: e.from,
      target: e.to,
      label: e.label,
      selectable: false,
      style: {
        stroke: 'var(--dg-edge)',
        strokeWidth: 1.6,
        ...(e.kind === 'dashed' ? { strokeDasharray: '6 4' } : null),
        opacity: dimmed ? 0.18 : 1,
      },
      labelStyle: { fontSize: 10, fill: 'var(--dg-edge)', opacity: dimmed ? 0.25 : 0.9 },
      labelBgStyle: { fill: 'var(--dg-node-bg)', opacity: dimmed ? 0.2 : 0.85 },
    };
  });
}

export function edgeKey(from: string, to: string, kind: string): string {
  return `${from}>${to}:${kind}`;
}
