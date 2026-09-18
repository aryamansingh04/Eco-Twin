// Synthetic telemetry generator. Deliberately time-based (not machine-
// config-based): it reads a machine's static config (rated power,
// baseline utilization, status) to produce plausible live readings, but
// never writes back into that config. Values drift over time using a
// deterministic seed bucketed by minute, so the dashboard feels "live"
// across repeated polls without being pure random noise.
import type { Machine } from '../types'
import type { MachineTelemetry } from '../types/telemetry'

function seededNoise(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x) // 0..1
}

// A small set of demo machine IDs that are more likely to show up offline
// in the synthetic feed, purely for a realistic-looking demo. This lives
// here — in the telemetry generator — and NOT in the Machine config, so it
// never contaminates the canonical machine record.
const OFFLINE_PRONE = new Set(['Weld-001', 'Pack-002'])

export function generateTelemetryFor(machine: Machine, tickMinute: number): MachineTelemetry {
  const seedBase = tickMinute * 97 + hashId(machine.id)
  const noise = seededNoise(seedBase)

  const offlineThreshold = OFFLINE_PRONE.has(machine.id) ? 0.55 : 0.08
  const operatingState = noise > offlineThreshold

  const utilizationDrift = (seededNoise(seedBase + 1) - 0.5) * 0.15
  const utilization = operatingState ? Math.min(1, Math.max(0, machine.utilization + utilizationDrift)) : 0

  const powerKw = operatingState ? Math.round(machine.powerKw * (0.85 + utilization * 0.3) * 10) / 10 : 0
  const temperatureC = Math.round((22 + (operatingState ? machine.heatOutput * 0.9 + seededNoise(seedBase + 2) * 4 : 0)) * 10) / 10
  const productionUnits = operatingState ? Math.round(utilization * 12) : 0
  const energyKwh = Math.round((powerKw / 60) * 10) / 10 // per one-minute tick

  return {
    machineId: machine.id,
    timestamp: new Date().toISOString(),
    powerKw,
    utilization,
    operatingState,
    productionUnits,
    temperatureC,
    energyKwh,
  }
}

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function currentTickMinute(): number {
  return Math.floor(Date.now() / 15000) // new "reading" every 15s, simulating a fast telemetry feed
}
