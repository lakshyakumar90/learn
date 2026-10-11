'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { LAYER_LABEL, type DiagramLayer } from '../../content/diagrams/types';
import type { FlowNodeData } from '@/lib/diagram-layout';

const LAYER_VAR: Record<DiagramLayer, string> = {
  browser: 'var(--dg-browser)',
  api: 'var(--dg-api)',
  realtime: 'var(--dg-realtime)',
  cache: 'var(--dg-cache)',
  database: 'var(--dg-database)',
  shared: 'var(--dg-shared)',
};

export const LayerNode = memo(function LayerNode({
  data,
}: NodeProps<Node<FlowNodeData>>) {
  const color = LAYER_VAR[data.layer];
  const xl = data.variant === 'xl';
  return (
    <div
      className={`flex h-full w-full items-center justify-center gap-1.5 rounded-lg border bg-[var(--dg-node-bg)] text-center ${
        xl ? 'px-3' : 'px-2'
      }`}
      style={{
        borderColor: data.external ? color : 'var(--dg-node-border)',
        borderStyle: data.external ? 'dashed' : 'solid',
        borderLeft: `4px solid ${color}`,
        opacity: data.dimmed ? 0.3 : 1,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <span
        aria-hidden
        className={`shrink-0 rounded-full ${xl ? 'h-2.5 w-2.5' : 'h-2 w-2'}`}
        style={{ background: color }}
      />
      <span className={`font-medium leading-tight ${xl ? 'text-sm' : 'text-xs'}`}>{data.label}</span>
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
});

export const diagramNodeTypes = { layer: LayerNode };

const LAYERS: DiagramLayer[] = ['browser', 'api', 'realtime', 'cache', 'database', 'shared'];

export function DiagramLegend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs opacity-80">
      {LAYERS.map((layer) => (
        <span key={layer} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: LAYER_VAR[layer] }}
          />
          {LAYER_LABEL[layer]}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5" aria-label="Solid line means durable data">
        <svg width="28" height="8" aria-hidden>
          <line x1="0" y1="4" x2="28" y2="4" stroke="var(--dg-edge)" strokeWidth="2" />
        </svg>
        durable
      </span>
      <span className="inline-flex items-center gap-1.5" aria-label="Dashed line means ephemeral data">
        <svg width="28" height="8" aria-hidden>
          <line x1="0" y1="4" x2="28" y2="4" stroke="var(--dg-edge)" strokeWidth="2" strokeDasharray="5 3" />
        </svg>
        ephemeral
      </span>
    </div>
  );
}
