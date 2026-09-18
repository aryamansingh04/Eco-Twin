import { MAT, STATUS_ACCENT } from './materials'
import type { MachineStatus } from '../../../types'

// Rooftop-style HVAC unit: rectangular housing, a fan grille on top,
// louvered vents on the sides, a service panel, and duct stubs.
export function HVACModel({ status }: { status: MachineStatus }) {
  const accent = STATUS_ACCENT[status]
  return (
    <group>
      {/* base/support */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.2, 1.6]} />
        <meshStandardMaterial color={MAT.frameDark} />
      </mesh>

      {/* main housing */}
      <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 1.3, 1.5]} />
        <meshStandardMaterial color={MAT.housingLight} roughness={0.6} metalness={0.1} />
      </mesh>

      {/* fan grille on top */}
      <mesh position={[0, 1.52, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 20]} />
        <meshStandardMaterial color={MAT.steelDark} roughness={0.6} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, 1.56, 0]} rotation={[0, (i * Math.PI) / 6, 0]}>
          <boxGeometry args={[1.0, 0.02, 0.04]} />
          <meshStandardMaterial color={MAT.frameDark} />
        </mesh>
      ))}

      {/* louvered side vents */}
      {[0.6, 0.3, 0].map((y, i) => (
        <mesh key={i} position={[0.96, 0.6 + y, 0]}>
          <boxGeometry args={[0.02, 0.12, 1.2]} />
          <meshStandardMaterial color={MAT.frameDark} />
        </mesh>
      ))}

      {/* service panel */}
      <mesh position={[0, 0.85, 0.76]}>
        <boxGeometry args={[0.7, 0.8, 0.02]} />
        <meshStandardMaterial color={MAT.housing} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.1, 0.78]}>
        <boxGeometry args={[0.16, 0.1, 0.02]} />
        <meshStandardMaterial color={MAT.screen} emissive={accent} emissiveIntensity={status === 'running' ? 0.6 : 0.1} />
      </mesh>

      {/* duct stubs */}
      {[-0.6, 0.6].map((x) => (
        <mesh key={x} position={[x, 1.52, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.3, 12]} />
          <meshStandardMaterial color={MAT.steel} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}
