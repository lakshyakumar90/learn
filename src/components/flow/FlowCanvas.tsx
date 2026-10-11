'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { getDiagramSpec } from '../../../content/diagrams';
import { getFlowSpec } from '../../../content/flows';
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  edgeKey,
  getLayout,
  type PlacedDiagram,
} from '@/lib/diagram-layout';
import { useFlowUi } from '@/lib/flow-store';
import { DiagramCanvas } from '../DiagramCanvas';

const PACKET_R = 6;

function FlowPacket({
  centers,
  path,
  stepKey,
  playing,
  speed,
  canAnimate,
}: {
  centers: Map<string, { x: number; y: number }>;
  path: string[];
  stepKey: string;
  playing: boolean;
  speed: number;
  canAnimate: boolean;
}) {
  const controls = useAnimationControls();
  const prevStep = useRef(stepKey);

  const pts = useMemo(
    () => path.map((id) => centers.get(id)).filter((p): p is { x: number; y: number } => Boolean(p)),
    [centers, path],
  );

  useEffect(() => {
    if (pts.length < 2 || !canAnimate) return;
    const changed = prevStep.current !== stepKey;
    prevStep.current = stepKey;
    const start = { x: pts[0].x - PACKET_R, y: pts[0].y - PACKET_R };
    if (playing) {
      controls.set(start);
      controls.start({
        x: pts.map((p) => p.x - PACKET_R),
        y: pts.map((p) => p.y - PACKET_R),
        transition: {
          duration: Math.max(0.4, (1.0 * (pts.length - 1)) / speed),
          ease: 'easeInOut' as const,
        },
      });
    } else {
      // Pause truly pauses: freeze mid-travel; a step change parks at the start.
      controls.stop();
      if (changed) controls.set(start);
    }
  }, [controls, pts, stepKey, playing, speed, canAnimate]);

  // Reduced motion (or single-node steps): jump to the end state, no travel.
  if (pts.length === 0) return null;
  if (pts.length < 2 || !canAnimate) {
    const end = pts[pts.length - 1];
    return (
      <div
        aria-hidden
        className="absolute h-3 w-3 rounded-full"
        style={{ left: end.x - PACKET_R, top: end.y - PACKET_R, background: 'var(--dg-realtime)' }}
      />
    );
  }

  return (
    <motion.div
      aria-hidden
      className="h-3 w-3 rounded-full"
      style={{
        background: 'var(--dg-realtime)',
        boxShadow: '0 0 0 4px color-mix(in srgb, var(--dg-realtime) 25%, transparent)',
      }}
      initial={{ x: pts[0].x - PACKET_R, y: pts[0].y - PACKET_R }}
      animate={controls}
    />
  );
}

interface FlowCanvasProps {
  flowId: string;
  modal: boolean;
  canAnimate: boolean;
  height?: number | string;
  heightClass?: string;
  fitSignal?: unknown;
}

/**
 * Flow canvas: the shared system diagram with the current step's nodes
 * and edges highlighted plus the travelling packet. Used inline and in
 * the expanded view; both read the same store, so they stay in sync.
 * Must render under a ReactFlowProvider supplied by the parent
 * (inline player section, or the expanded view shell).
 */
export function FlowCanvas({ flowId, modal, canAnimate, height, heightClass, fitSignal }: FlowCanvasProps) {
  const { tab, step: stepIndex, playing, speed } = useFlowUi(flowId);
  const [placed, setPlaced] = useState<PlacedDiagram | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const flow = getFlowSpec(tab);
  const spec = getDiagramSpec(flow?.diagram ?? '');

  useEffect(() => {
    let cancelled = false;
    setPlaced(null);
    if (spec) {
      getLayout(spec).then((result) => {
        if (!cancelled) setPlaced(result);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [spec, tab]);

  const centers = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const n of placed?.nodes ?? []) {
      map.set(n.id, { x: n.x + NODE_WIDTH / 2, y: n.y + NODE_HEIGHT / 2 });
    }
    return map;
  }, [placed]);

  if (!flow || !spec) return null;
  const steps = flow.steps;
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  if (!step) return null;

  let activeNodes = new Set(step.nodes);
  let activeEdges = new Set(step.edges.map((e) => edgeKey(e.from, e.to, e.kind)));
  if (modal && selected && spec) {
    // In the modal, an explicit node selection spotlights its neighbourhood.
    activeNodes = new Set<string>([selected]);
    activeEdges = new Set<string>();
    for (const e of spec.edges) {
      if (e.from === selected || e.to === selected) {
        activeNodes.add(e.from);
        activeNodes.add(e.to);
        activeEdges.add(edgeKey(e.from, e.to, e.kind));
      }
    }
  }

  return (
    <DiagramCanvas
      spec={spec}
      placed={placed}
      interactive={modal}
      variant={modal ? 'xl' : 'md'}
      activeNodes={activeNodes}
      activeEdgeKeys={activeEdges}
      selectable={modal}
      onSelectNode={modal ? setSelected : undefined}
      minimap={modal}
      fitSignal={fitSignal}
      height={height}
      heightClass={heightClass}
      label={`${flow.title} flow, step ${stepIndex + 1} of ${steps.length}: ${step.title}`}
      loadingText="Laying out flow…"
      overlay={
        <FlowPacket
          centers={centers}
          path={step.path}
          stepKey={`${tab}-${stepIndex}`}
          playing={playing}
          speed={speed}
          canAnimate={canAnimate}
        />
      }
    />
  );
}
