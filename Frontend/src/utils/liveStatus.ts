// Helpers for turning a raw telemetry reading into the UI-facing
// MachineStatus enum. This is the ONLY place that interprets telemetry
// into a status label — components should call this rather than
// re-deriving the thresholds themselves.
import type { MachineStatus } from '../types'
import type { MachineStatusEntry } from '../types/telemetry'

export function statusFromEntry(entry: MachineStatusEntry | undefined): MachineStatus {
  if (!entry) return 'offline'
  if (!entry.operatingState) return 'offline'
  if (entry.utilization < 0.15) return 'idle'
  return 'running'
}

export function statusMapFromEntries(entries: MachineStatusEntry[]): Map<string, MachineStatus> {
  const map = new Map<string, MachineStatus>()
  for (const e of entries) map.set(e.machineId, statusFromEntry(e))
  return map
}
