import { MAT, STATUS_ACCENT } from './materials'
import type { MachineStatus } from '../../../types'

// Hydraulic press: heavy base, two vertical frame columns, upper beam,
// hydraulic cylinder, press head/platen, small control box.
export function PressModel({ status }: { status: MachineStatus }) {
  const accent = STATUS_ACCENT[status]
  return (
    <group>
      {/* heavy base */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.4, 1.8]} />
        <meshStandardMaterial color={MAT.frameDark} roughness={0.8} />
      </mesh>

      {/* platen (moves toward base — shown mid-stroke) */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.2, 1.3]} />
        <meshStandardMaterial color={MAT.steel} metalness={0.6} roughness={0.35} />
      </mesh>

      {/* two vertical frame columns */}
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, 1.9, 0]} castShadow>
          <boxGeometry args={[0.22, 3.0, 0.5]} />
          <meshStandardMaterial color={MAT.housing} roughness={0.5} metalness={0.2} />
        </mesh>
      ))}

      {/* upper beam */}
      <mesh position={[0, 3.35, 0]} castShadow>
        <boxGeometry args={[2.0, 0.5, 0.9]} />
        <meshStandardMaterial color={MAT.housing} roughness={0.5} metalness={0.2} />
      </mesh>

      {/* hydraulic cylinder, hanging from the beam */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 1.3, 16]} />
        <meshStandardMaterial color={MAT.steelDark} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.6, 12]} />
        <meshStandardMaterial color={MAT.chrome} metalness={0.9} roughness={0.15} />
      </mesh>

      {/* control box on one column */}
      <mesh position={[1.05, 1.4, 0.3]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.3]} />
        <meshStandardMaterial color={MAT.frameDark} />
      </mesh>
      <mesh position={[1.23, 1.4, 0.3]}>
        <boxGeometry args={[0.02, 0.22, 0.18]} />
        <meshStandardMaterial color={MAT.screen} emissive={accent} emissiveIntensity={status === 'running' ? 0.6 : 0.1} />
      </mesh>

      {/* status beacon on top */}
      <mesh position={[0, 3.68, 0]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}
