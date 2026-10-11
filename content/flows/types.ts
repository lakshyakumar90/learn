/**
 * End-to-end flow specs. Every step reuses the system diagram nodes:
 * `nodes` highlights canvas nodes, `edges` highlights canvas edges,
 * and `path` is the ordered route the packet travels.
 * `sources` is verified by scripts/check-sources.ts.
 */
export interface FlowEdgeRef {
  from: string;
  to: string;
  kind: 'solid' | 'dashed';
}

export interface FlowStep {
  title: string;
  /** 1-2 sentences of narration. */
  narration: string;
  nodes: string[];
  edges: FlowEdgeRef[];
  path: string[];
  sources: string[];
}

export interface FlowSpec {
  id: string;
  title: string;
  diagram: string;
  steps: FlowStep[];
  sources: string[];
}
