import type { MachineTelemetry } from '../types/telemetry'
import { apiRequest } from './api'

interface BackendTelemetry {
  id: number
  machine: number
  timestamp: string
  power_kw: number
  utilization: number
  operating_state: boolean
  production_units: number
  temperature_c: number
  energy_kwh: number
  created_at: string
}

function telemetryFromApi(value: BackendTelemetry): MachineTelemetry {
  return {
    machineId: String(value.machine),
    timestamp: value.timestamp,
    powerKw: value.power_kw,
    utilization: value.utilization,
    operatingState: value.operating_state,
    productionUnits: value.production_units,
    temperatureC: value.temperature_c,
    energyKwh: value.energy_kwh,
  }
}

async function getAllTelemetry(): Promise<MachineTelemetry[]> {
  const values = await apiRequest<BackendTelemetry[]>('/machine-telemetry/')
  return values.map(telemetryFromApi)
}

export async function getAllLatestTelemetry(): Promise<MachineTelemetry[]> {
  const telemetry = await getAllTelemetry()
  const latest = new Map<string, MachineTelemetry>()

  for (const reading of telemetry) {
    const previous = latest.get(reading.machineId)
    if (!previous || reading.timestamp > previous.timestamp) {
      latest.set(reading.machineId, reading)
    }
  }

  return [...latest.values()]
}

export async function getLatestTelemetry(machineId: string): Promise<MachineTelemetry | null> {
  const telemetry = await getAllTelemetry()
  const readings = telemetry.filter((reading) => reading.machineId === machineId)
  if (!readings.length) return null

  return readings.reduce((latest, reading) => (
    reading.timestamp > latest.timestamp ? reading : latest
  ))
}

export async function getTelemetryHistory(machineId: string, points = 12): Promise<MachineTelemetry[]> {
  const telemetry = await getAllTelemetry()

  return telemetry
    .filter((reading) => reading.machineId === machineId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-points)
}
