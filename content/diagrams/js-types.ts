import type { DiagramSpec } from './types';

/** Primitives copy by value; objects share by reference. */
export const jsTypesSpec: DiagramSpec = {
  id: 'js-types',
  title: 'Value types',
  nodes: [
    { id: 'values', label: 'Values', layer: 'language' },
    { id: 'prims', label: 'Primitives', layer: 'language' },
    { id: 'string', label: 'String', layer: 'language' },
    { id: 'number', label: 'Number', layer: 'language' },
    { id: 'boolean', label: 'Boolean', layer: 'language' },
    { id: 'null', label: 'Null', layer: 'language' },
    { id: 'undef', label: 'Undefined', layer: 'language' },
    { id: 'symbol', label: 'Symbol', layer: 'language' },
    { id: 'bigint', label: 'BigInt', layer: 'language' },
    { id: 'objects', label: 'Objects', layer: 'runtime' },
    { id: 'array', label: 'Array', layer: 'runtime' },
    { id: 'function', label: 'Function', layer: 'runtime' },
  ],
  edges: [
    { from: 'values', to: 'prims', kind: 'solid', label: 'copied' },
    { from: 'values', to: 'objects', kind: 'solid', label: 'shared' },
    { from: 'prims', to: 'string', kind: 'solid' },
    { from: 'prims', to: 'number', kind: 'solid' },
    { from: 'prims', to: 'boolean', kind: 'solid' },
    { from: 'prims', to: 'null', kind: 'solid' },
    { from: 'prims', to: 'undef', kind: 'solid' },
    { from: 'prims', to: 'symbol', kind: 'dashed' },
    { from: 'prims', to: 'bigint', kind: 'dashed' },
    { from: 'objects', to: 'array', kind: 'solid' },
    { from: 'objects', to: 'function', kind: 'solid' },
  ],
  sources: [],
};
