import type { DiagramSpec } from './types';

/**
 * V8-specific, as of Oct 2026 (V8 overview docs): parse once, run
 * fast with Ignition, tier hot code up through Sparkplug and Maglev
 * to TurboFan/Turboshaft, and fall back when a guess proves wrong.
 */
export const jsEnginePipelineSpec: DiagramSpec = {
  id: 'js-engine-pipeline',
  title: 'Engine pipeline',
  nodes: [
    { id: 'source', label: 'Source', layer: 'language' },
    { id: 'parser', label: 'Parser', layer: 'engine' },
    { id: 'ast', label: 'Syntax tree', layer: 'engine' },
    { id: 'ignition', label: 'Ignition', layer: 'engine' },
    { id: 'bytecode', label: 'Bytecode', layer: 'engine' },
    { id: 'sparkplug', label: 'Sparkplug', layer: 'engine' },
    { id: 'maglev', label: 'Maglev', layer: 'engine' },
    { id: 'turbofan', label: 'Turbofan', layer: 'engine' },
    { id: 'machine', label: 'Machine code', layer: 'engine' },
    { id: 'feedback', label: 'Feedback', layer: 'engine' },
    { id: 'deopt', label: 'Deoptimize', layer: 'engine' },
  ],
  edges: [
    { from: 'source', to: 'parser', kind: 'solid' },
    { from: 'parser', to: 'ast', kind: 'solid' },
    { from: 'ast', to: 'ignition', kind: 'solid' },
    { from: 'ignition', to: 'bytecode', kind: 'solid' },
    { from: 'bytecode', to: 'sparkplug', kind: 'solid', label: 'baseline' },
    { from: 'sparkplug', to: 'machine', kind: 'solid' },
    { from: 'bytecode', to: 'maglev', kind: 'dashed', label: 'hot' },
    { from: 'bytecode', to: 'turbofan', kind: 'dashed', label: 'hotter' },
    { from: 'maglev', to: 'machine', kind: 'solid' },
    { from: 'turbofan', to: 'machine', kind: 'solid' },
    { from: 'machine', to: 'feedback', kind: 'dashed', label: 'profile' },
    { from: 'feedback', to: 'turbofan', kind: 'dashed', label: 'speculate' },
    { from: 'feedback', to: 'deopt', kind: 'dashed', label: 'wrong guess' },
    { from: 'deopt', to: 'ignition', kind: 'dashed', label: 'fall back' },
  ],
  sources: [],
};
