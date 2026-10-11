'use client';

import { create } from 'zustand';

export const FLOW_STEP_MS = 4200;
export const FLOW_SPEEDS = [0.5, 1, 2] as const;
export type FlowSpeed = (typeof FLOW_SPEEDS)[number];

export interface FlowUi {
  tab: string;
  step: number;
  playing: boolean;
  speed: FlowSpeed;
}

interface FlowStoreState {
  flows: Record<string, FlowUi>;
  setTab: (flowId: string, tab: string) => void;
  goTo: (flowId: string, step: number, total: number) => void;
  next: (flowId: string, total: number) => void;
  back: (flowId: string) => void;
  restart: (flowId: string, autoplay: boolean) => void;
  toggle: (flowId: string, total: number, autoplay: boolean) => void;
  stop: (flowId: string) => void;
  setSpeed: (flowId: string, speed: FlowSpeed) => void;
}

function fresh(tab = 'guest'): FlowUi {
  return { tab, step: 0, playing: false, speed: 1 };
}

function clampStep(step: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(0, step), total - 1);
}

/**
 * Playback state shared by the inline player and its expanded view,
 * keyed by flow id. Opening or closing the modal never touches this
 * state, so the step and playback survive the round trip.
 */
export const useFlowStore = create<FlowStoreState>()((set) => ({
  flows: { 'end-to-end': fresh() },

  setTab: (flowId, tab) =>
    set((s) => ({
      flows: {
        ...s.flows,
        [flowId]: { ...(s.flows[flowId] ?? fresh()), tab, step: 0, playing: false },
      },
    })),

  goTo: (flowId, step, total) =>
    set((s) => {
      const prev = s.flows[flowId] ?? fresh();
      return { flows: { ...s.flows, [flowId]: { ...prev, step: clampStep(step, total) } } };
    }),

  next: (flowId, total) =>
    set((s) => {
      const prev = s.flows[flowId] ?? fresh();
      return {
        flows: { ...s.flows, [flowId]: { ...prev, step: clampStep(prev.step + 1, total) } },
      };
    }),

  back: (flowId) =>
    set((s) => {
      const prev = s.flows[flowId] ?? fresh();
      return {
        flows: {
          ...s.flows,
          [flowId]: { ...prev, step: clampStep(prev.step - 1, Number.MAX_SAFE_INTEGER) },
        },
      };
    }),

  restart: (flowId, autoplay) =>
    set((s) => ({
      flows: { ...s.flows, [flowId]: { ...(s.flows[flowId] ?? fresh()), step: 0, playing: autoplay } },
    })),

  toggle: (flowId, total, autoplay) =>
    set((s) => {
      const prev = s.flows[flowId] ?? fresh();
      if (prev.playing) return { flows: { ...s.flows, [flowId]: { ...prev, playing: false } } };
      if (prev.step >= total - 1)
        return { flows: { ...s.flows, [flowId]: { ...prev, step: 0, playing: autoplay } } };
      return { flows: { ...s.flows, [flowId]: { ...prev, playing: autoplay } } };
    }),

  stop: (flowId) =>
    set((s) => {
      const prev = s.flows[flowId] ?? fresh();
      return { flows: { ...s.flows, [flowId]: { ...prev, playing: false } } };
    }),

  setSpeed: (flowId, speed) =>
    set((s) => ({
      flows: { ...s.flows, [flowId]: { ...(s.flows[flowId] ?? fresh()), speed } },
    })),
}));

/** Stable selector for one flow's UI state. */
const FALLBACK_UI: FlowUi = { tab: 'guest', step: 0, playing: false, speed: 1 };

export function useFlowUi(flowId: string): FlowUi {
  return useFlowStore((s) => s.flows[flowId] ?? FALLBACK_UI);
}
