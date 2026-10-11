'use client';

import { useEffect, useMemo, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Maximize2 } from 'lucide-react';
import { getDiagramSpec } from '../../content/diagrams';
import { edgeKey, getLayout, type PlacedDiagram } from '@/lib/diagram-layout';
import { DiagramLegend } from './diagram-shared';
import { DiagramCanvas } from './DiagramCanvas';
import { ExpandedView } from './ExpandedView';

/**
 * One read-only diagram, driven by a spec id (`<Diagram id="web" />`).
 * Specs live in content/diagrams/*.ts and are laid out once with elkjs
 * (memoized by id, shared with the expanded view).
 */
export function Diagram({ id }: { id: string }) {
  const spec = getDiagramSpec(id);
  const [placed, setPlaced] = useState<PlacedDiagram | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

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
  }, [spec, id]);

  const { activeNodes, activeEdgeKeys } = useMemo(() => {
    if (!spec || !selected) return { activeNodes: undefined, activeEdgeKeys: undefined };
    const nodes = new Set<string>([selected]);
    const keys = new Set<string>();
    for (const e of spec.edges) {
      if (e.from === selected || e.to === selected) {
        nodes.add(e.from);
        nodes.add(e.to);
        keys.add(edgeKey(e.from, e.to, e.kind));
      }
    }
    return { activeNodes: nodes, activeEdgeKeys: keys };
  }, [spec, selected]);

  if (!spec) {
    return (
      <p role="note" className="my-6 rounded-xl border border-dashed p-6 text-center text-sm">
        Unknown diagram “{id}”.
      </p>
    );
  }

  const inlineHeight = 280;
  const openModal = () => {
    setSelected(null);
    setOpen(true);
  };
  const legendProject = spec.project ?? 'excalidraw';

  return (
    <figure className="my-6">
      <ReactFlowProvider>
        <div className="relative overflow-hidden rounded-xl border">
          <button
            type="button"
            aria-label="Expand diagram"
            onClick={(e) => {
              e.stopPropagation();
              openModal();
            }}
            className="absolute right-2 top-2 z-10 inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border bg-[var(--dg-node-bg)] text-sm opacity-80 shadow-sm transition-opacity hover:opacity-100"
          >
            <Maximize2 size={16} aria-hidden />
          </button>
          <div onClick={openModal} className="cursor-zoom-in">
            <DiagramCanvas
              spec={spec}
              placed={placed}
              interactive={false}
              variant="md"
              height={inlineHeight}
              label={`${spec.title} diagram. Activate the Expand button for a fullscreen view.`}
              loadingText={`Laying out ${spec.title}…`}
              onPaneClick={openModal}
              onNodeClick={openModal}
            />
          </div>
        </div>
      </ReactFlowProvider>
      <figcaption className="mt-1 text-xs opacity-60">{spec.title}</figcaption>
      <DiagramLegend project={legendProject} />
      <ExpandedView
        open={open}
        onOpenChange={setOpen}
        title={spec.title}
        description={`Interactive diagram: ${spec.title}. Plus and minus zoom, zero fits, arrow keys pan, Escape closes. Selecting a node highlights its edges.`}
        panKeys
      >
        <div className="w-full">
          <DiagramCanvas
            spec={spec}
            placed={placed}
            interactive
            variant="xl"
            activeNodes={activeNodes}
            activeEdgeKeys={activeEdgeKeys}
            selectable
            onSelectNode={setSelected}
            fitSignal={open}
            heightClass="h-[38dvh] min-h-[260px] w-full lg:h-[62vh]"
            label={`${spec.title} diagram, fullscreen. Plus and minus zoom, zero fits, arrow keys pan.`}
            loadingText={`Laying out ${spec.title}…`}
          />
          <div className="border-t px-4 py-2">
            <DiagramLegend project={legendProject} />
          </div>
        </div>
      </ExpandedView>
    </figure>
  );
}
