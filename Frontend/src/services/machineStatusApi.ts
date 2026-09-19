import type { MachineStatusSummary } from '../types/telemetry'
import { apiRequest } from './api'

interface BackendMachineStatusEntry {
  machine_id: number
  machine_name: string
  machine_type: string
  status: 'ON' | 'OFF' | 'NO_DATA'
  power_kw: number | null
  utilization: number | null
  production_units: number | null
  temperature_c: number | null
  timestamp: string | null
}

export async function getMachineStatus(): Promise<MachineStatusSummary> {
  const values = await apiRequest<BackendMachineStatusEntry[]>('/machine-status/')

  const entries = values.map((value) => ({
    machineId: String(value.machine_id),
    machineName: value.machine_name,
    operatingState: value.status === 'ON',
    lastSeen: value.timestamp ?? '',
    powerKw: value.power_kw ?? 0,
    utilization: value.utilization ?? 0,
    temperatureC: value.temperature_c ?? 0,
  }))

  return {
    total: values.length,
    running: values.filter((value) => value.status === 'ON').length,
    offline: values.filter((value) => value.status === 'OFF').length,
    currentPowerKw: values.reduce((sum, value) => sum + (value.power_kw ?? 0), 0),
    productionUnitsTotal: values.reduce((sum, value) => sum + (value.production_units ?? 0), 0),
    entries,
  }
}
