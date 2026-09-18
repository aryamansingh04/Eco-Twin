// Convenience hooks for consuming live machine status anywhere in the app.
// Every page that needs "is this machine running?" should use these rather
// than reading useTelemetryStore directly, so the derivation logic
// (utils/liveStatus.ts) stays in one place.
import { useEffect } from 'react'
import { useTelemetryStore } from '../store/useTelemetryStore'
import { statusFromEntry, statusMapFromEntries } from '../utils/liveStatus'
import type { MachineStatus } from '../types'

/** Ensures polling has started (idempotent) and returns the latest summary. */
export function useMachineStatusSummary() {
  const summary = useTelemetryStore((s) => s.summary)
  const loading = useTelemetryStore((s) => s.loading)
  const startPolling = useTelemetryStore((s) => s.startPolling)
  const lastUpdated = useTelemetryStore((s) => s.lastUpdated)

  useEffect(() => {
    if (!summary) startPolling(15)
  }, [summary, startPolling])

  return { summary, loading, lastUpdated }
}

export function useLiveStatusMap(): Map<string, MachineStatus> {
  const summary = useTelemetryStore((s) => s.summary)
  return statusMapFromEntries(summary?.entries ?? [])
}

export function useLiveStatusFor(machineId: string): MachineStatus {
  const summary = useTelemetryStore((s) => s.summary)
  return statusFromEntry(summary?.entries.find((e) => e.machineId === machineId))
}
