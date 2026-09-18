import { Canvas } from '@react-three/fiber'
import { Grid, OrbitControls } from '@react-three/drei'
import { useEffect, useState } from 'react'
import type { Machine, Connection, Zone } from '../../types'
import * as factoryService from '../../services/factoryService'
import { MachineMesh } from '../editor/MachineMesh'
import { ConnectionLine } from '../editor/ConnectionLine'
import { ZoneFloor } from '../editor/ZoneFloor'
import { useTelemetryStore } from '../../store/useTelemetryStore'
import { statusFromEntry } from '../../utils/liveStatus'

// Read-only 3D snapshot used on the Factory overview page. Loads the same
// canonical data the editor uses (via factoryService), and matches the
// editor's light industrial look — white background, visible grid — so the
// preview and the editor feel like the same tool rather than two products.
export function MiniPreview3D() {
  const [data, setData] = useState<{ machines: Machine[]; connections: Connection[]; zones: Zone[] } | null>(null)
  const telemetrySummary = useTelemetryStore((s) => s.summary)

  useEffect(() => {
    Promise.all([factoryService.getMachines(), factoryService.getConnections(), factoryService.getZones()]).then(
      ([machines, connections, zones]) => setData({ machines, connections, zones })
    )
  }, [])

  if (!data) return <div className="w-full h-full flex items-center justify-center text-ink-muted text-xs">Loading preview…</div>

  return (
    <Canvas shadows camera={{ position: [26, 22, 26], fov: 45 }}>
      <color attach="background" args={['#F4F5F3']} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[20, 30, 12]} intensity={1.0} castShadow />
      <hemisphereLight args={['#FFFFFF', '#D8DCD8', 0.5]} />

      <Grid
        args={[200, 200]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#D8DBD8"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#B7BDB8"
        fadeDistance={70}
        fadeStrength={1}
        infiniteGrid
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#FAFBFA" roughness={1} />
      </mesh>

      {data.zones.map((z) => <ZoneFloor key={z.id} zone={z} />)}
      {data.connections.map((c) => <ConnectionLine key={c.id} connection={c} machines={data.machines} />)}
      {data.machines.map((m) => (
        <MachineMesh
          key={m.id}
          machine={m}
          liveStatus={statusFromEntry(telemetrySummary?.entries.find((e) => e.machineId === m.id))}
          selected={false}
          connecting={false}
          measuring={false}
          interactive={false}
        />
      ))}
      <OrbitControls autoRotate autoRotateSpeed={0.6} enablePan={false} minDistance={15} maxDistance={60} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  )
}
