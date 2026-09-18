// Single source of truth for every derived number in the app.
// Nothing else in the codebase should compute energy, carbon, or spatial
// metrics inline — always call through here, so a change to the formula
// only has to happen once.
import type { Machine, Connection, Zone, MachineStatus } from '../types'

/** Daily Energy (kWh) = Power (kW) × Operating Hours × Utilization (0-1) */
export function machineDailyEnergyKwh(machine: Machine): number {
  return Math.round(machine.powerKw * machine.operatingHours * machine.utilization * 10) / 10
}

/** Carbon (kg CO2e) = Energy (kWh) × Emission Factor (kg CO2e/kWh) */
export function machineDailyCarbonKg(machine: Machine, factoryDefaultFactor: number): number {
  const factor = machine.emissionFactor ?? factoryDefaultFactor
  return Math.round(machineDailyEnergyKwh(machine) * factor * 10) / 10
}

export function totalEnergyKwh(machines: Machine[]): number {
  return Math.round(machines.reduce((s, m) => s + machineDailyEnergyKwh(m), 0) * 10) / 10
}

export function totalCarbonKg(machines: Machine[], factoryDefaultFactor: number): number {
  return Math.round(machines.reduce((s, m) => s + machineDailyCarbonKg(m, factoryDefaultFactor), 0) * 10) / 10
}

export function activeMachineCount(machines: Machine[], statusByMachineId: Map<string, MachineStatus>): { active: number; total: number } {
  const active = machines.filter((m) => statusByMachineId.get(m.id) === 'running').length
  return { active, total: machines.length }
}

/** A simple, transparent prototype health score based on configured
 * utilization only — live operating state is a separate telemetry concern
 * and does not feed this score (health is a config/design-time heuristic,
 * not a live reading). */
export function machineHealthScore(machine: Machine): number {
  let score = 100
  const util = machine.utilization
  if (util > 0.9) score -= 12 // sustained overload by design
  if (util < 0.15) score -= 6 // under-utilized relative to its rating
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function distance3D(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }): number {
  const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z
  return Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz) * 10) / 10
}

export function connectionDistance(connection: Connection, machines: Machine[]): number | null {
  const from = machines.find((m) => m.id === connection.fromMachineId)
  const to = machines.find((m) => m.id === connection.toMachineId)
  if (!from || !to) return null
  return distance3D(from.position, to.position)
}

export interface MaterialFlowStats {
  totalDistance: number
  averageDistance: number
  longestConnection: { connectionId: string; distance: number } | null
}

export function materialFlowStats(connections: Connection[], machines: Machine[]): MaterialFlowStats {
  const distances = connections
    .map((c) => ({ connectionId: c.id, distance: connectionDistance(c, machines) }))
    .filter((d): d is { connectionId: string; distance: number } => d.distance !== null)

  const totalDistance = Math.round(distances.reduce((s, d) => s + d.distance, 0) * 10) / 10
  const averageDistance = distances.length ? Math.round((totalDistance / distances.length) * 10) / 10 : 0
  const longestConnection = distances.length
    ? distances.reduce((a, b) => (b.distance > a.distance ? b : a))
    : null

  return { totalDistance, averageDistance, longestConnection }
}

/** Daily production capacity (units) = productionRate (units/hour) ×
 * operatingHours × utilization. Reads directly from each machine's own
 * productionRate — never a type-level constant — so two machines of the
 * same type with different rates contribute correctly. */
export function machineDailyProductionUnits(machine: Machine): number {
  return Math.round(machine.productionRate * machine.operatingHours * machine.utilization)
}

export function totalDailyProductionUnits(machines: Machine[]): number {
  return machines.reduce((s, m) => s + machineDailyProductionUnits(m), 0)
}

export function machinesByType(machines: Machine[]): { type: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const m of machines) counts.set(m.type, (counts.get(m.type) ?? 0) + 1)
  return Array.from(counts.entries()).map(([type, count]) => ({ type, count }))
}

export function machinesByZone(machines: Machine[], zones: Zone[]): { zoneId: string; zoneName: string; count: number; energyKwh: number }[] {
  return zones.map((z) => {
    const inZone = machines.filter((m) => m.zoneId === z.id)
    return {
      zoneId: z.id,
      zoneName: z.name,
      count: inZone.length,
      energyKwh: totalEnergyKwh(inZone),
    }
  })
}

export function connectionCountForMachine(machineId: string, connections: Connection[]): number {
  return connections.filter((c) => c.fromMachineId === machineId || c.toMachineId === machineId).length
}
