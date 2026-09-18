import { Html, Line } from '@react-three/drei'
import type { Machine } from '../../types'
import { distance3D } from '../../utils/calculations'

// Renders the in-progress measurement between two selected machines while
// the Measure tool is active. Purely visual — the distance is also shown
// in the status bar and used for the material-flow metrics elsewhere.
export function MeasureOverlay({ fromId, toId, machines }: { fromId: string | null; toId: string | null; machines: Machine[] }) {
  const from = machines.find((m) => m.id === fromId)
  const to = machines.find((m) => m.id === toId)
  if (!from || !to) return null

  const start: [number, number, number] = [from.position.x, from.position.y + 1.0, from.position.z]
  const end: [number, number, number] = [to.position.x, to.position.y + 1.0, to.position.z]
  const mid: [number, number, number] = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2 + 0.3, (start[2] + end[2]) / 2]
  const dist = distance3D(from.position, to.position)

  return (
    <group>
      <Line points={[start, end]} color="#C97A3D" lineWidth={2} dashed dashSize={0.3} gapSize={0.2} />
      <Html position={mid} center distanceFactor={16} occlude={false}>
        <div className="pointer-events-none px-2 py-1 rounded bg-warn text-white text-[11px] font-data font-semibold whitespace-nowrap shadow-md">
          {dist} m
        </div>
      </Html>
    </group>
  )
}
