// Live/synthetic machine status. Deliberately a SEPARATE store from
// useFactoryStore — telemetry is transient operational data, not part of
// the canonical factory configuration, and must never be persisted to
// localStorage as if it were machine config (see PROJECT CONTEXT: Machine
// vs MachineTelemetry).
//
// Polls machineStatusApi.getMachineStatus() on an interval driven by
// Settings → Dashboard → Refresh Interval. Swapping to a real Django
// endpoint later means changing machineStatusApi.ts only.
import { create } from 'zustand'
import type { MachineStatusSummary } from '../types/telemetry'
import * as machineStatusApi from '../services/machineStatusApi'

interface TelemetryState {
  summary: MachineStatusSummary | null
  loading: boolean
  lastUpdated: string | null
  pollHandle: ReturnType<typeof setInterval> | null

  refresh: () => Promise<void>
  startPolling: (intervalSec: number) => void
  stopPolling: () => void
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  summary: null,
  loading: false,
  lastUpdated: null,
  pollHandle: null,

  refresh: async () => {
    set({ loading: true })
    const summary = await machineStatusApi.getMachineStatus()
    set({ summary, loading: false, lastUpdated: new Date().toISOString() })
  },

  startPolling: (intervalSec) => {
    get().stopPolling()
    get().refresh()
    const handle = setInterval(() => get().refresh(), Math.max(3, intervalSec) * 1000)
    set({ pollHandle: handle })
  },

  stopPolling: () => {
    const { pollHandle } = get()
    if (pollHandle) clearInterval(pollHandle)
    set({ pollHandle: null })
  },
}))
