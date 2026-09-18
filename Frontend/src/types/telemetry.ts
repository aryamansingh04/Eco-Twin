// Telemetry types — deliberately separate from types/index.ts's Machine.
//
// Machine (types/index.ts)        = what the machine IS (static config:
//                                    name, type, rated power, position...)
// MachineTelemetry (this file)    = what the machine is DOING right now
//                                    (a live/simulated reading)
//
// These must never be merged into one object. The canonical Machine record
// is edited in the Factory Editor and persisted; telemetry is transient,
// arrives continuously, and is never written back into Machine config.
// This mirrors the backend split: Machine model vs MachineTelemetry model.

export interface MachineTelemetry {
  machineId: string
  timestamp: string
  powerKw: number
  utilization: number // 0-1, live reading (may differ from configured baseline)
  operatingState: boolean // true = running, false = stopped/offline
  productionUnits: number // units produced since last reading
  temperatureC: number
  energyKwh: number // energy accumulated since last reading
}

// The shape GET /api/machine-status/ is expected to return later — one row
// per machine, derived from its most recent telemetry record.
export interface MachineStatusEntry {
  machineId: string
  machineName: string
  operatingState: boolean
  lastSeen: string
  powerKw: number
  utilization: number
  temperatureC: number
}

export interface MachineStatusSummary {
  total: number
  running: number
  offline: number
  currentPowerKw: number
  productionUnitsTotal: number
  entries: MachineStatusEntry[]
}
