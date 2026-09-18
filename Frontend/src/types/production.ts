// Production Planner types. The UI here is a placeholder for a future
// optimizer service — these types describe the request/response shape
// that service is expected to have; the mock implementation in
// services/productionApi.ts just returns a plausible-looking static
// allocation, NOT a real optimization result.
import type { MachineType } from './index'

export interface ProductionPlanRequest {
  productName: string
  requiredQuantity: number
  deadlineIso: string
  machineIds: string[]
}

export interface MachineAllocation {
  machineId: string
  machineName: string
  machineType: MachineType
  utilizationPct: number
  estimatedHours: number
  estimatedEnergyKwh: number
}

export interface ProductionPlanResult {
  productName: string
  requiredQuantity: number
  deadlineIso: string
  allocations: MachineAllocation[]
  estimatedTotalEnergyKwh: number
  estimatedTotalCarbonKg: number
  objective: string
}
