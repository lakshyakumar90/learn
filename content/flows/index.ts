import type { FlowSpec } from './types';
import { guestFlow } from './guest';
import { signedInFlow } from './signedin';
import { roomFlow } from './room';
import { dcSignupFlow } from './dc-signup';
import { dcConnectionFlow } from './dc-connection';
import { dcChatFlow } from './dc-chat';
import { dcPostFlow } from './dc-post';
import { dcNotifyFlow } from './dc-notify';

/**
 * Every animated end-to-end flow, keyed by tab id.
 * Adding a tab means adding one file here — no new components.
 * Tab ids are unique across projects; each spec carries its project.
 */
export const flowSpecs: Record<string, FlowSpec> = {
  guest: guestFlow,
  signedin: signedInFlow,
  room: roomFlow,
  'dc-signup': dcSignupFlow,
  'dc-connection': dcConnectionFlow,
  'dc-chat': dcChatFlow,
  'dc-post': dcPostFlow,
  'dc-notify': dcNotifyFlow,
};

export const flowOrder = ['guest', 'signedin', 'room'] as const;

export function getFlowSpec(id: string): FlowSpec | undefined {
  return flowSpecs[id];
}

function specProject(flow: FlowSpec): string {
  return flow.project ?? 'excalidraw';
}

/** Tab ids for one project, in registry order. */
export function flowOrderForProject(project: string): string[] {
  return Object.keys(flowSpecs).filter((id) => specProject(flowSpecs[id]) === project);
}
