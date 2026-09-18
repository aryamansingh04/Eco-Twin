import { useMemo } from 'react'
import { QuadraticBezierLine, Html } from '@react-three/drei'
import type { Machine, Connection } from '../../types'
import { distance3D } from '../../utils/calculations'
import { useSettingsStore } from '../../store/useSettingsStore'

interface ConnectionLineProps {
  connection: Connection
  machines: Machine[]
  selected?: boolean
  onSelect?: (id: string) => void
}

// Draws a gently-arced line + arrowhead between two machine centers,
// evoking "Machine A ──▶ Machine B" material-flow. Distance label is
// derived live from current machine positions, so moving a machine
// immediately updates every label — there is no cached connection distance.
export function ConnectionLine({ connection, machines, selected, onSelect }: ConnectionLineProps) {
  const showLabels = useSettingsStore((s) => s.editor.showConnectionLabels)
  const from = machines.find((m) => m.id === connection.fromMachineId)
  const to = machines.find((m) => m.id === connection.toMachineId)

  const geo = useMemo(() => {
    if (!from || !to) return null
    const start: [number, number, number] = [from.position.x, from.position.y + 0.6, from.position.z]
    const end: [number, number, number] = [to.position.x, to.position.y + 0.6, to.position.z]
    const mid: [number, number, number] = [(start[0] + end[0]) / 2, Math.max(start[1], end[1]) + 1.0, (start[2] + end[2]) / 2]
    const labelPos: [number, number, number] = [(start[0] + end[0]) / 2, Math.max(start[1], end[1]) + 1.3, (start[2] + end[2]) / 2]
    const dist = distance3D(from.position, to.position)
    return { start, mid, end, labelPos, dist }
  }, [from, to])

  if (!geo) return null

  return (
    <group
      onClick={(e) => {
        if (!onSelect) return
        e.stopPropagation()
        onSelect(connection.id)
      }}
    >
      <QuadraticBezierLine
        start={geo.start}
        mid={geo.mid}
        end={geo.end}
        color={selected ? '#3E7C59' : '#5B7A8C'}
        lineWidth={selected ? 2.4 : 1.5}
      />
      {/* arrowhead at destination */}
      <mesh position={geo.end}>
        <coneGeometry args={[0.09, 0.22, 8]} />
        <meshBasicMaterial color={selected ? '#3E7C59' : '#5B7A8C'} />
      </mesh>

      {(showLabels || selected) && (
        <Html position={geo.labelPos} center distanceFactor={18} occlude={false}>
          <div className="pointer-events-none px-1.5 py-0.5 rounded bg-white/95 text-ink-muted text-[9px] font-data whitespace-nowrap border border-line shadow-sm">
            {geo.dist} m
          </div>
        </Html>
      )}
    </group>
  )
}
