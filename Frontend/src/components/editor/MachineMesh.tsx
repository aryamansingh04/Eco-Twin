import { Html } from '@react-three/drei'
import type { Machine, MachineStatus } from '../../types'
import { MachineModel, MODEL_FOOTPRINT } from './models/MachineModel'
import { STATUS_ACCENT } from './models/materials'
import { useSettingsStore } from '../../store/useSettingsStore'

interface MachineMeshProps {
  machine: Machine
  liveStatus: MachineStatus // derived from telemetry by the parent scene, not stored on Machine
  selected: boolean
  connecting: boolean
  measuring: boolean
  interactive: boolean
  onSelect?: (id: string) => void
  onPointerDown?: (id: string, e: any) => void
}

// Renders one machine as its detailed procedural model, wrapped in a group
// positioned/rotated straight from canonical store data — there is no
// separate "visual" position, this group's transform IS the machine's
// position/rotation. `liveStatus` (running/idle/offline) comes from
// telemetry, passed down rather than read from the Machine record, since
// Machine config never stores operating status.
export function MachineMesh({ machine, liveStatus, selected, connecting, measuring, interactive, onSelect, onPointerDown }: MachineMeshProps) {
  const showLabels = useSettingsStore((s) => s.editor.showMachineLabels)
  const footprint = MODEL_FOOTPRINT[machine.type]
  const { x, y, z } = machine.position
  const highlightColor = selected ? '#3E7C59' : connecting ? '#C97A3D' : measuring ? '#5B7A8C' : null

  return (
    <group
      position={[x, y, z]}
      rotation={[machine.rotation.x, machine.rotation.y, machine.rotation.z]}
      onClick={(e) => {
        if (!interactive) return
        e.stopPropagation()
        onSelect?.(machine.id)
      }}
      onPointerDown={(e) => {
        if (!interactive) return
        e.stopPropagation()
        onPointerDown?.(machine.id, e)
      }}
    >
      <MachineModel type={machine.type} status={liveStatus} />

      {/* selection / connect / measure highlight ring on the ground */}
      {highlightColor && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(footprint.width, footprint.depth) / 2 + 0.05, Math.max(footprint.width, footprint.depth) / 2 + 0.18, 32]} />
          <meshBasicMaterial color={highlightColor} transparent opacity={0.8} />
        </mesh>
      )}

      {/* live status dot above the model */}
      <mesh position={[0, footprint.height + 0.3, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color={STATUS_ACCENT[liveStatus]} />
      </mesh>

      {(showLabels || selected) && (
        <Html position={[0, footprint.height + 0.55, 0]} center distanceFactor={16} occlude={false}>
          <div className="pointer-events-none px-1.5 py-0.5 rounded bg-white/95 text-ink text-[9px] font-medium whitespace-nowrap border border-line shadow-sm">
            {machine.id}
          </div>
        </Html>
      )}
    </group>
  )
}
