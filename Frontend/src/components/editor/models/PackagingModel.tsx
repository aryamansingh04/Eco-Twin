import { MAT, STATUS_ACCENT } from './materials'
import type { MachineStatus } from '../../../types'

// Packaging machine: an infeed conveyor section, a boxy processing/
// packaging enclosure with a control panel, and rollers on the outfeed.
export function PackagingModel({ status }: { status: MachineStatus }) {
  const accent = STATUS_ACCENT[status]
  return (
    <group>
      {/* infeed conveyor section */}
      <mesh position={[-0.9, 0.5, 0]} receiveShadow>
        <boxGeometry args={[1.2, 0.06, 0.7]} />
        <meshStandardMaterial color={MAT.rubber} roughness={0.9} />
      </mesh>
      {[-1.35, -0.9, -0.45].map((x) => (
        <mesh key={x} position={[x, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.78, 10]} />
          <meshStandardMaterial color={MAT.chrome} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {[-1.35, -0.45].map((x) => (
        <group key={x}>
          {[-0.32, 0.32].map((z) => (
            <mesh key={z} position={[x, 0.22, z]}>
              <boxGeometry args={[0.08, 0.42, 0.08]} />
              <meshStandardMaterial color={MAT.frameDark} />
            </mesh>
          ))}
        </group>
      ))}

      {/* processing/packaging enclosure */}
      <mesh position={[0.3, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 1.3, 1.1]} />
        <meshStandardMaterial color={MAT.housing} roughness={0.55} metalness={0.15} />
      </mesh>
      {/* wrap film roll indicator */}
      <mesh position={[0.3, 1.5, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.1, 16]} />
        <meshStandardMaterial color={MAT.yellow} roughness={0.6} />
      </mesh>

      {/* control panel */}
      <mesh position={[0.95, 1.0, 0.4]} rotation={[0, -0.4, 0]} castShadow>
        <boxGeometry args={[0.1, 0.6, 0.4]} />
        <meshStandardMaterial color={MAT.frameDark} />
      </mesh>
      <mesh position={[1.0, 1.1, 0.4]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[0.02, 0.25, 0.28]} />
        <meshStandardMaterial color={MAT.screen} emissive={accent} emissiveIntensity={status === 'running' ? 0.6 : 0.1} />
      </mesh>

      {/* outfeed rollers */}
      {[1.15, 1.55].map((x) => (
        <mesh key={x} position={[x, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.78, 10]} />
          <meshStandardMaterial color={MAT.chrome} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[1.35, 0.5, 0]} receiveShadow>
        <boxGeometry args={[0.6, 0.06, 0.7]} />
        <meshStandardMaterial color={MAT.rubber} roughness={0.9} />
      </mesh>

      {/* support legs under enclosure */}
      {[-0.2, 0.8].map((x) => (
        <group key={x}>
          {[-0.4, 0.4].map((z) => (
            <mesh key={z} position={[x, 0.2, z]}>
              <boxGeometry args={[0.1, 0.42, 0.1]} />
              <meshStandardMaterial color={MAT.frameDark} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
