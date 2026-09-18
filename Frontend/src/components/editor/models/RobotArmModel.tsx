import { MAT, STATUS_ACCENT } from './materials'
import type { MachineStatus } from '../../../types'

// Articulated robot arm: circular base, rotating base collar, two arm
// segments with visible joints, a wrist, and a two-finger gripper.
// Posed statically at a natural mid-reach angle (no runtime animation).
export function RobotArmModel({ status }: { status: MachineStatus }) {
  const accent = STATUS_ACCENT[status]
  return (
    <group>
      {/* base */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.55, 0.24, 20]} />
        <meshStandardMaterial color={MAT.frameDark} />
      </mesh>

      {/* rotating base collar */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.3, 18]} />
        <meshStandardMaterial color={MAT.housing} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* shoulder joint */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial color={MAT.steel} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* lower arm segment, angled up */}
      <group position={[0, 0.55, 0]} rotation={[0, 0, 0.5]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.22, 1.1, 0.22]} />
          <meshStandardMaterial color={MAT.accentAmber} roughness={0.45} />
        </mesh>

        {/* elbow joint */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <sphereGeometry args={[0.17, 12, 12]} />
          <meshStandardMaterial color={MAT.steel} metalness={0.6} roughness={0.3} />
        </mesh>

        {/* upper arm segment, angled back down slightly */}
        <group position={[0, 1.1, 0]} rotation={[0, 0, -0.9]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.18, 0.95, 0.18]} />
            <meshStandardMaterial color={MAT.accentAmber} roughness={0.45} />
          </mesh>

          {/* wrist */}
          <mesh position={[0, 1.0, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.18, 12]} />
            <meshStandardMaterial color={MAT.steelDark} metalness={0.6} roughness={0.3} />
          </mesh>

          {/* gripper */}
          <group position={[0, 1.15, 0]}>
            <mesh position={[-0.07, 0, 0]} castShadow>
              <boxGeometry args={[0.05, 0.22, 0.08]} />
              <meshStandardMaterial color={MAT.chrome} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.07, 0, 0]} castShadow>
              <boxGeometry args={[0.05, 0.22, 0.08]} />
              <meshStandardMaterial color={MAT.chrome} metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </group>
      </group>

      {/* status beacon on base */}
      <mesh position={[0.4, 0.4, 0]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}
