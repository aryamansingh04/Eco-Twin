// Mock Production Planner service. This is explicitly NOT an optimizer —
// it distributes the requested quantity across the selected machines
// using each machine's OWN configured productionRate (never a type-level
// constant), so two machines of the same type with different rates split
// the work correctly. The real optimization algorithm (minimizing
// energy/carbon subject to the deadline) will be a separate backend
// service; this file is the seam it plugs into later.
import type { Machine } from '../types'
import type { ProductionPlanRequest, ProductionPlanResult, MachineAllocation } from '../types/production'

function delay<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function generatePlan(request: ProductionPlanRequest, machines: Machine[], emissionFactor: number): Promise<ProductionPlanResult> {
  const selected = machines.filter((m) => request.machineIds.includes(m.id))
  // Machines with no configured production capability (productionRate 0)
  // can't be assigned a production share — they're excluded from the
  // rate-weighted split rather than crashing on a divide-by-zero.
  const capable = selected.filter((m) => m.productionRate > 0)
  const totalRate = capable.reduce((s, m) => s + m.productionRate, 0)

  const allocations: MachineAllocation[] = selected.map((m) => {
    if (m.productionRate <= 0 || totalRate === 0) {
      return { machineId: m.id, machineName: m.name, machineType: m.type, utilizationPct: 0, estimatedHours: 0, estimatedEnergyKwh: 0 }
    }
    const share = m.productionRate / totalRate
    const unitsAssigned = request.requiredQuantity * share
    const estimatedHours = Math.round((unitsAssigned / m.productionRate) * 10) / 10
    const utilizationPct = Math.min(95, Math.round(50 + share * 45))
    const estimatedEnergyKwh = Math.round(m.powerKw * estimatedHours * (utilizationPct / 100) * 10) / 10
    return {
      machineId: m.id,
      machineName: m.name,
      machineType: m.type,
      utilizationPct,
      estimatedHours,
      estimatedEnergyKwh,
    }
  })

  const estimatedTotalEnergyKwh = Math.round(allocations.reduce((s, a) => s + a.estimatedEnergyKwh, 0) * 10) / 10
  const estimatedTotalCarbonKg = Math.round(estimatedTotalEnergyKwh * emissionFactor * 10) / 10
  const uncapable = selected.length - capable.length

  return delay({
    productName: request.productName,
    requiredQuantity: request.requiredQuantity,
    deadlineIso: request.deadlineIso,
    allocations,
    estimatedTotalEnergyKwh,
    estimatedTotalCarbonKg,
    objective:
      uncapable > 0
        ? `Minimize energy and carbon while meeting the required quantity (${uncapable} selected machine(s) have no configured production rate and were excluded from the split — mock allocation, not a real optimizer)`
        : 'Minimize energy and carbon while meeting the required quantity by the deadline (mock allocation — not a real optimizer)',
  })
}
