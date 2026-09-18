// Telemetry service abstraction. Today this reads canonical machine config
// via factoryService and runs it through the synthetic generator; later,
// every function here becomes a fetch() against Django:
//
//   getLatestTelemetry(machineId) -> GET /api/machine-telemetry/?machine=:id&latest=true
//   getAllLatestTelemetry()       -> GET /api/machine-telemetry/latest/
//   getTelemetryHistory(id, n)    -> GET /api/machine-telemetry/?machine=:id&limit=:n
//
// Components should only ever import from this file (or machineStatusApi,
// which builds on it) — never call the generator directly.
import type { MachineTelemetry } from '../types/telemetry'
import * as factoryService from './factoryService'
import { generateTelemetryFor, currentTickMinute } from '../data/mockTelemetry'

const NETWORK_DELAY_MS = 80

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function getAllLatestTelemetry(): Promise<MachineTelemetry[]> {
  const machines = await factoryService.getMachines()
  const tick = currentTickMinute()
  return delay(machines.map((m) => generateTelemetryFor(m, tick)))
}

export async function getLatestTelemetry(machineId: string): Promise<MachineTelemetry | null> {
  const machines = await factoryService.getMachines()
  const machine = machines.find((m) => m.id === machineId)
  if (!machine) return delay(null)
  return delay(generateTelemetryFor(machine, currentTickMinute()))
}

// Short synthetic history for sparkline-style charts — real history will
// come from GET /api/machine-telemetry/?machine=:id&limit=:points later.
export async function getTelemetryHistory(machineId: string, points = 12): Promise<MachineTelemetry[]> {
  const machines = await factoryService.getMachines()
  const machine = machines.find((m) => m.id === machineId)
  if (!machine) return delay([])
  const tick = currentTickMinute()
  const history = Array.from({ length: points }, (_, i) => generateTelemetryFor(machine, tick - (points - 1 - i)))
  return delay(history)
}
