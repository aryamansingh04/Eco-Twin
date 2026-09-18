import { MAT, STATUS_ACCENT } from './materials'
import type { MachineStatus } from '../../../types'

// A CNC mill: base, boxy enclosure, worktable, spindle head over the work
// area, front doors, a control panel with a small screen. ~14 meshes.
export function CNCModel({ status }: { status: MachineStatus }) {
  const accent = STATUS_ACCENT[status]
  return (
    <group>
      {/* base plinth */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.3, 2.2]} />
        <meshStandardMaterial color={MAT.frameDark} roughness={0.8} />
      </mesh>

      {/* main enclosure */}
      <mesh position={[0, 1.1, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.6, 1.7]} />
        <meshStandardMaterial color={MAT.housing} roughness={0.55} metalness={0.15} />
      </mesh>

      {/* front doors (slightly inset, darker) */}
      <mesh position={[-0.56, 1.05, 0.66]} castShadow>
        <boxGeometry args={[1.0, 1.3, 0.06]} />
        <meshStandardMaterial color={MAT.glass} roughness={0.2} metalness={0.1} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0.56, 1.05, 0.66]} castShadow>
        <boxGeometry args={[1.0, 1.3, 0.06]} />
        <meshStandardMaterial color={MAT.glass} roughness={0.2} metalness={0.1} transparent opacity={0.55} />
      </mesh>
      {/* door frame divider */}
      <mesh position={[0, 1.05, 0.68]}>
        <boxGeometry args={[0.06, 1.35, 0.08]} />
        <meshStandardMaterial color={MAT.frameDark} />
      </mesh>

      {/* worktable / work area visible through doors */}
      <mesh position={[0, 0.42, 0.3]} receiveShadow>
        <boxGeometry args={[1.7, 0.12, 1.1]} />
        <meshStandardMaterial color={MAT.steelDark} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* spindle head above worktable */}
      <mesh position={[0, 1.55, 0.3]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={MAT.steel} roughness={0.35} metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.15, 0.3]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
        <meshStandardMaterial color={MAT.chrome} roughness={0.2} metalness={0.9} />
      </mesh>

      {/* control panel, offset to the side */}
      <mesh position={[1.35, 1.15, 0.3]} rotation={[0, -0.25, 0]} castShadow>
        <boxGeometry args={[0.12, 1.0, 0.7]} />
        <meshStandardMaterial color={MAT.frameDark} roughness={0.6} />
      </mesh>
      <mesh position={[1.41, 1.35, 0.3]} rotation={[0, -0.25, 0]}>
        <boxGeometry args={[0.02, 0.4, 0.5]} />
        <meshStandardMaterial color={MAT.screen} emissive={accent} emissiveIntensity={status === 'running' ? 0.6 : 0.1} />
      </mesh>

      {/* handles */}
      <mesh position={[-0.15, 1.55, 0.7]}>
        <boxGeometry args={[0.25, 0.05, 0.05]} />
        <meshStandardMaterial color={MAT.chrome} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.85, 1.55, 0.7]}>
        <boxGeometry args={[0.25, 0.05, 0.05]} />
        <meshStandardMaterial color={MAT.chrome} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* status beacon */}
      <mesh position={[0, 2.02, -0.2]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}
