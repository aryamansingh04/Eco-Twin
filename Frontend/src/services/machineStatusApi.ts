// Mock implementation of the future GET /api/machine-status/ endpoint.
// Aggregates the latest telemetry into the exact shape the real endpoint
// is expected to return (see types/telemetry.ts: MachineStatusSummary),
// so swapping this file's body for a single fetch() later requires no
// changes anywhere it's consumed (store/useTelemetryStore.ts).
import type { MachineStatusSummary } from '../types/telemetry'
import * as factoryService from './factoryService'
import * as telemetryApi from './telemetryApi'

export async function getMachineStatus(): Promise<MachineStatusSummary> {
  const [machines, telemetry] = await Promise.all([factoryService.getMachines(), telemetryApi.getAllLatestTelemetry()])

  const entries = telemetry.map((t) => {
    const machine = machines.find((m) => m.id === t.machineId)
    return {
      machineId: t.machineId,
      machineName: machine?.name ?? t.machineId,
      operatingState: t.operatingState,
      lastSeen: t.timestamp,
      powerKw: t.powerKw,
      utilization: t.utilization,
      temperatureC: t.temperatureC,
    }
  })

  return {
    total: entries.length,
    running: entries.filter((e) => e.operatingState).length,
    offline: entries.filter((e) => !e.operatingState).length,
    currentPowerKw: Math.round(telemetry.reduce((s, t) => s + t.powerKw, 0) * 10) / 10,
    productionUnitsTotal: telemetry.reduce((s, t) => s + t.productionUnits, 0),
    entries,
  }
}
