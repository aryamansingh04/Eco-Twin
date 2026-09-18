import { MAT, STATUS_ACCENT } from './materials'
import type { MachineStatus } from '../../../types'

// Welding station: a work-surface fixture, an articulated welding torch
// arm poised over it, the welding power unit with cable, and a control box.
export function WeldingModel({ status }: { status: MachineStatus }) {
  const accent = STATUS_ACCENT[status]
  return (
    <group>
      {/* base / fixture table */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.1, 1.4]} />
        <meshStandardMaterial color={MAT.steelDark} metalness={0.5} roughness={0.5} />
      </mesh>
      {[[-0.65, -0.55], [0.65, -0.55], [-0.65, 0.55], [0.65, 0.55]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.2, z]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color={MAT.frameDark} />
        </mesh>
      ))}

      {/* welding power unit, box beside the table */}
      <mesh position={[-1.1, 0.5, -0.4]} castShadow>
        <boxGeometry args={[0.6, 0.9, 0.5]} />
        <meshStandardMaterial color={MAT.housing} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[-0.8, 0.55, -0.4]}>
        <boxGeometry args={[0.02, 0.2, 0.15]} />
        <meshStandardMaterial color={MAT.screen} emissive={accent} emissiveIntensity={status === 'running' ? 0.6 : 0.1} />
      </mesh>
      {/* wheels */}
      {[-0.15, 0.15].map((z) => (
        <mesh key={z} position={[-1.1, 0.08, -0.4 + z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 10]} />
          <meshStandardMaterial color={MAT.rubber} />
        </mesh>
      ))}

      {/* articulated arm mount */}
      <mesh position={[0.2, 0.9, -0.55]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 0.6, 12]} />
        <meshStandardMaterial color={MAT.frameDark} />
      </mesh>
      <group position={[0.2, 1.2, -0.55]} rotation={[0.3, 0, 0]}>
        <mesh position={[0, 0.35, 0.1]} castShadow>
          <boxGeometry args={[0.12, 0.7, 0.12]} />
          <meshStandardMaterial color={MAT.accentAmber} />
        </mesh>
        {/* torch, angled down toward the fixture */}
        <group position={[0, 0.7, 0.2]} rotation={[0.9, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.05, 0.4, 10]} />
            <meshStandardMaterial color={MAT.steel} metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <coneGeometry args={[0.03, 0.08, 8]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={status === 'running' ? 1.2 : 0.1} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
