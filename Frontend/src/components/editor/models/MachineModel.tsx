import type { MachineType, MachineStatus } from '../../../types'
import { CNCModel } from './CNCModel'
import { PressModel } from './PressModel'
import { ConveyorModel } from './ConveyorModel'
import { HVACModel } from './HVACModel'
import { RobotArmModel } from './RobotArmModel'
import { CompressorModel } from './CompressorModel'
import { WeldingModel } from './WeldingModel'
import { PackagingModel } from './PackagingModel'

// Registry mapping each canonical MachineType to its detailed model
// component. This is the ONLY switch statement on machine type for
// rendering purposes — everything else (palette, table, analytics) just
// reads the type as a label/category.
const MODEL_BY_TYPE: Record<MachineType, React.ComponentType<{ status: MachineStatus }>> = {
  CNC: CNCModel,
  Press: PressModel,
  Conveyor: ConveyorModel,
  HVAC: HVACModel,
  'Robot Arm': RobotArmModel,
  Compressor: CompressorModel,
  Welding: WeldingModel,
  Packaging: PackagingModel,
}

// Approximate footprint (world units) used for palette icon framing and
// ground snapping — not physically simulated, just enough to keep models
// from overlapping too badly when placed close together.
export const MODEL_FOOTPRINT: Record<MachineType, { width: number; depth: number; height: number }> = {
  CNC: { width: 2.2, depth: 2.2, height: 2.1 },
  Press: { width: 2.0, depth: 1.8, height: 3.7 },
  Conveyor: { width: 3.9, depth: 1.0, height: 1.0 },
  HVAC: { width: 2.0, depth: 1.6, height: 1.6 },
  'Robot Arm': { width: 1.1, depth: 1.1, height: 2.1 },
  Compressor: { width: 2.0, depth: 0.9, height: 1.5 },
  Welding: { width: 1.9, depth: 1.4, height: 1.9 },
  Packaging: { width: 3.1, depth: 1.3, height: 1.7 },
}

export function MachineModel({ type, status }: { type: MachineType; status: MachineStatus }) {
  const Model = MODEL_BY_TYPE[type]
  return <Model status={status} />
}
