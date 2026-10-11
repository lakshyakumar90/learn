import type { FlowSpec } from './types';
import { guestFlow } from './guest';
import { signedInFlow } from './signedin';
import { roomFlow } from './room';

/**
 * Every animated end-to-end flow, keyed by tab id.
 * Adding a tab means adding one file here — no new components.
 */
export const flowSpecs: Record<string, FlowSpec> = {
  guest: guestFlow,
  signedin: signedInFlow,
  room: roomFlow,
};

export const flowOrder = ['guest', 'signedin', 'room'] as const;

export function getFlowSpec(id: string): FlowSpec | undefined {
  return flowSpecs[id];
}
