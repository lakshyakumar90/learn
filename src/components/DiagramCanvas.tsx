'use client';

import { useEffect, useRef } from 'react';
import {
  Background,
  MiniMap,
  ReactFlow,
  ViewportPortal,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { DiagramSpec } from '../../content/diagrams/types';
import type { PlacedDiagram } from '@/lib/diagram-layout';
import { toFlowEdges, toFlowNodes } from '@/lib/diagram-layout';
import { diagramNodeTypes } from './diagram-shared';

interface DiagramCanvasProps {
  spec: DiagramSpec;
  placed: PlacedDiagram | null;
  /** Locked-down read-only canvas vs fully pannable/zoomable canvas. */
  interactive: boolean;
  variant?: 'md' | 'xl';
  activeNodes?: Set<string>;
  activeEdgeKeys?: Set<string>;
  selectable?: boolean;
  onSelectNode?: (id: string | null) => void;
  minimap?: boolean;
  /** Rendered inside a ViewportPortal (flow packet). Scales with zoom. */
  overlay?: React.ReactNode;
  /** Change to refit (e.g. modal open state). */
  fitSignal?: unknown;
  /** Explicit pixel height (inline views). */
  height?: number | string;
  /** Sizing classes (expanded views use explicit dvh heights, never %). */
  heightClass?: string;
  label: string;
  loadingText: string;
  onPaneClick?: () => void;
  onNodeClick?: () => void;
}

/**
 * One React Flow canvas shared by inline diagrams, expanded diagrams,
 * and both flow player views. Must render under a ReactFlowProvider
 * (each instance gets its own, supplied by the parent).
 */
export function DiagramCanvas({
  spec,
  placed,
  interactive,
  variant = 'md',
  activeNodes,
  activeEdgeKeys,
  selectable = false,
  onSelectNode,
  minimap = false,
  overlay,
  fitSignal,
  height,
  heightClass,
  label,
  loadingText,
  onPaneClick,
  onNodeClick,
}: DiagramCanvasProps) {
  const { fitView } = useReactFlow();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Fit after mount/sizing: immediate fit, a next-frame refit, and one
  // ResizeObserver refit for the first size settle, then disconnect so
  // later resizes never yank a user's zoom.
  useEffect(() => {
    if (!placed) return;
    const opts = { padding: 0.2, duration: 0 };
    fitView(opts);
    const raf = requestAnimationFrame(() => fitView(opts));
    const el = wrapRef.current;
    let settled = false;
    const ro = new ResizeObserver(() => {
      if (!settled) {
        settled = true;
        fitView(opts);
        ro.disconnect();
      }
    });
    if (el) ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [placed, fitSignal, fitView]);

  const nodes: Node[] = placed ? toFlowNodes(placed, activeNodes, variant) : [];
  const edges: Edge[] = toFlowEdges(spec, activeEdgeKeys);

  return (
    <div
      ref={wrapRef}
      role={interactive ? 'region' : 'img'}
      aria-label={label}
      aria-busy={!placed}
      className={`overflow-hidden bg-[var(--dg-node-bg)] ${heightClass ?? ''}`}
      style={height !== undefined ? { height } : undefined}
    >
      {placed ? (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={diagramNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={selectable}
          onSelectionChange={
            selectable
              ? ({ nodes: selected }) => onSelectNode?.(selected[0]?.id ?? null)
              : undefined
          }
          panOnDrag={interactive}
          zoomOnScroll={interactive}
          zoomOnPinch={interactive}
          panOnScroll={false}
          zoomOnDoubleClick={interactive}
          proOptions={{ hideAttribution: false }}
          className="!bg-transparent"
          onPaneClick={onPaneClick}
          onNodeClick={onNodeClick}
        >
          <Background gap={22} size={1} color="var(--dg-node-border)" bgColor="transparent" />
          {minimap ? (
            <MiniMap
              pannable
              zoomable
              nodeColor="var(--dg-edge)"
              maskColor="var(--dg-node-bg)"
              className="!m-2 rounded-lg border"
            />
          ) : null}
          {overlay ? <ViewportPortal>{overlay}</ViewportPortal> : null}
        </ReactFlow>
      ) : (
        <div className="flex h-full items-center justify-center text-sm opacity-50">
          {loadingText}
        </div>
      )}
    </div>
  );
}
