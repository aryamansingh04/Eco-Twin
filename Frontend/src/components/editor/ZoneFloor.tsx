import { Html } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'
import type { Zone } from '../../types'

export function ZoneFloor({ zone, selected, onSelect }: { zone: Zone; selected?: boolean; onSelect?: (id: string) => void }) {
  const { x, z, width, depth } = zone.bounds
  const cx = x + width / 2
  const cz = z + depth / 2
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(width, depth)), [width, depth])

  return (
    <group>
      <mesh
        position={[cx, 0.01, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          if (!onSelect) return
          e.stopPropagation()
          onSelect(zone.id)
        }}
      >
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={zone.color} transparent opacity={selected ? 0.18 : 0.09} />
      </mesh>

      {/* zone border */}
      <lineSegments position={[cx, 0.02, cz]} rotation={[-Math.PI / 2, 0, 0]} geometry={edges}>
        <lineBasicMaterial color={zone.color} linewidth={selected ? 2 : 1} />
      </lineSegments>

      <Html position={[x + 0.3, 0.05, z + 0.3]} distanceFactor={22} occlude={false}>
        <div className="pointer-events-none text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-white/90 border border-line" style={{ color: zone.color }}>
          {zone.name}
        </div>
      </Html>
    </group>
  )
}
