import { MAT, STATUS_ACCENT } from './materials'
import type { MachineStatus } from '../../../types'

// Conveyor belt: long belt surface on rollers, side rails, support legs,
// a drive/motor assembly at one end, and a small control box.
export function ConveyorModel({ status }: { status: MachineStatus }) {
  const accent = STATUS_ACCENT[status]
  const length = 3.6
  const rollerCount = 6

  return (
    <group>
      {/* belt surface */}
      <mesh position={[0, 0.55, 0]} receiveShadow>
        <boxGeometry args={[length, 0.08, 0.9]} />
        <meshStandardMaterial color={MAT.rubber} roughness={0.9} />
      </mesh>

      {/* rollers along the length */}
      {Array.from({ length: rollerCount }, (_, i) => {
        const x = -length / 2 + 0.3 + (i * (length - 0.6)) / (rollerCount - 1)
        return (
          <mesh key={i} position={[x, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 1.0, 10]} />
            <meshStandardMaterial color={MAT.chrome} metalness={0.7} roughness={0.3} />
          </mesh>
        )
      })}

      {/* side rails */}
      {[-0.47, 0.47].map((z) => (
        <mesh key={z} position={[0, 0.68, z]} castShadow>
          <boxGeometry args={[length, 0.15, 0.05]} />
          <meshStandardMaterial color={MAT.housing} roughness={0.5} metalness={0.2} />
        </mesh>
      ))}

      {/* support legs */}
      {[-length / 2 + 0.35, 0, length / 2 - 0.35].map((x) => (
        <group key={x}>
          {[-0.35, 0.35].map((z) => (
            <mesh key={z} position={[x, 0.22, z]} castShadow>
              <boxGeometry args={[0.12, 0.45, 0.12]} />
              <meshStandardMaterial color={MAT.frameDark} />
            </mesh>
          ))}
        </group>
      ))}

      {/* drive/motor assembly at one end */}
      <mesh position={[-length / 2 - 0.15, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.6, 14]} />
        <meshStandardMaterial color={MAT.steelDark} metalness={0.6} roughness={0.35} />
      </mesh>

      {/* small control box */}
      <mesh position={[-length / 2 - 0.15, 0.95, 0.25]} castShadow>
        <boxGeometry args={[0.25, 0.3, 0.2]} />
        <meshStandardMaterial color={MAT.frameDark} />
      </mesh>
      <mesh position={[-length / 2 - 0.02, 0.95, 0.25]}>
        <boxGeometry args={[0.02, 0.15, 0.1]} />
        <meshStandardMaterial color={MAT.screen} emissive={accent} emissiveIntensity={status === 'running' ? 0.6 : 0.1} />
      </mesh>
    </group>
  )
}
