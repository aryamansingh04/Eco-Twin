import { MAT, STATUS_ACCENT } from './materials'
import type { MachineStatus } from '../../../types'

// Air compressor: horizontal cylindrical receiver tank on a support frame,
// a motor unit, pipework, pressure gauges, and a small control component.
export function CompressorModel({ status }: { status: MachineStatus }) {
  const accent = STATUS_ACCENT[status]
  return (
    <group>
      {/* support frame/base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.3, 0.9]} />
        <meshStandardMaterial color={MAT.frameDark} />
      </mesh>

      {/* receiver/storage tank — horizontal cylinder */}
      <mesh position={[0, 0.75, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 1.7, 18]} />
        <meshStandardMaterial color={MAT.accentBlue} roughness={0.45} metalness={0.3} />
      </mesh>
      {/* tank end caps */}
      {[-0.86, 0.86].map((x) => (
        <mesh key={x} position={[x, 0.75, 0]} rotation={[0, 0, Math.PI / 2]}>
          <sphereGeometry args={[0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={MAT.accentBlue} roughness={0.45} metalness={0.3} />
        </mesh>
      ))}

      {/* compressor/motor body sitting on the tank */}
      <mesh position={[0.3, 1.28, 0]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.5]} />
        <meshStandardMaterial color={MAT.steelDark} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[-0.35, 1.22, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.35, 14]} />
        <meshStandardMaterial color={MAT.steel} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* pipes */}
      <mesh position={[0, 1.05, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        <meshStandardMaterial color={MAT.chrome} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* pressure gauge */}
      <mesh position={[0.7, 1.0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 14]} />
        <meshStandardMaterial color={MAT.screen} emissive={accent} emissiveIntensity={status === 'running' ? 0.5 : 0.1} />
      </mesh>

      {/* control component */}
      <mesh position={[-0.7, 0.55, 0.5]} castShadow>
        <boxGeometry args={[0.22, 0.3, 0.15]} />
        <meshStandardMaterial color={MAT.frameDark} />
      </mesh>
    </group>
  )
}
