import { useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber'
import { Grid, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useFactoryStore } from '../../store/useFactoryStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useTelemetryStore } from '../../store/useTelemetryStore'
import { statusFromEntry } from '../../utils/liveStatus'
import { MachineMesh } from './MachineMesh'
import { ConnectionLine } from './ConnectionLine'
import { ZoneFloor } from './ZoneFloor'
import { MeasureOverlay } from './MeasureOverlay'
import type { Zone } from '../../types'

function snap(value: number, gridSize: number, enabled: boolean) {
  if (!enabled) return Math.round(value * 10) / 10
  return Math.round(value / gridSize) * gridSize
}

// Ground plane used purely for raycasting: placing zones, deselecting,
// dragging. Invisible — the actual visible floor comes from <Grid>.
function GroundPlane({ onGroundClick }: { onGroundClick: (point: THREE.Vector3) => void }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        onGroundClick(e.point.clone())
      }}
    >
      <planeGeometry args={[500, 500]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

function DragHandler({ draggingId, onDrag }: { draggingId: string | null; onDrag: (p: THREE.Vector3) => void }) {
  const { gl, camera } = useThree()
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const raycaster = useRef(new THREE.Raycaster())

  const handleMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingId) return
      const rect = gl.domElement.getBoundingClientRect()
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.current.setFromCamera(ndc, camera)
      const point = new THREE.Vector3()
      raycaster.current.ray.intersectPlane(plane.current, point)
      if (point) onDrag(point)
    },
    [draggingId, gl, camera, onDrag]
  )

  useEffect(() => {
    const el = gl.domElement
    if (draggingId) el.addEventListener('pointermove', handleMove)
    return () => el.removeEventListener('pointermove', handleMove)
  }, [draggingId, gl, handleMove])

  return null
}

// Exposes camera/gl/scene to the parent (FactoryEditorPage) via a ref so
// native HTML5 drag-and-drop drops from the palette can be raycast onto
// the ground plane — R3F's own event system only sees pointer events
// inside the canvas, not browser dragend/drop events on the wrapping div.
function SceneBridge({ bridgeRef }: { bridgeRef: React.MutableRefObject<{ camera: THREE.Camera; gl: THREE.WebGLRenderer } | null> }) {
  const { camera, gl } = useThree()
  useEffect(() => {
    bridgeRef.current = { camera, gl }
  }, [camera, gl, bridgeRef])
  return null
}

export interface Scene3DHandle {
  bridgeRef: React.MutableRefObject<{ camera: THREE.Camera; gl: THREE.WebGLRenderer } | null>
}

// Live rectangle preview while the user is drawing a zone (first corner
// placed, second corner following the cursor before the second click).
function ZoneDrawPreview({ start }: { start: THREE.Vector3 }) {
  const { gl, camera } = useThree()
  const [current, setCurrent] = useState(start)
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const raycaster = useRef(new THREE.Raycaster())

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.current.setFromCamera(ndc, camera)
      const point = new THREE.Vector3()
      raycaster.current.ray.intersectPlane(plane.current, point)
      if (point) setCurrent(point.clone())
    }
    gl.domElement.addEventListener('pointermove', handleMove)
    return () => gl.domElement.removeEventListener('pointermove', handleMove)
  }, [gl, camera])

  const x1 = Math.min(start.x, current.x), x2 = Math.max(start.x, current.x)
  const z1 = Math.min(start.z, current.z), z2 = Math.max(start.z, current.z)
  const width = Math.max(0.5, x2 - x1), depth = Math.max(0.5, z2 - z1)

  return (
    <group>
      <mesh position={[x1 + width / 2, 0.03, z1 + depth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color="#3E7C59" transparent opacity={0.15} />
      </mesh>
      <mesh position={[start.x, 0.1, start.z]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshBasicMaterial color="#3E7C59" />
      </mesh>
    </group>
  )
}

export function Scene3D({ bridgeRef, controlsRef }: {
  bridgeRef: React.MutableRefObject<{ camera: THREE.Camera; gl: THREE.WebGLRenderer } | null>
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>
}) {
  const { machines, connections, zones, selectedId, selectedZoneId, selectedConnectionId, editorMode, connectFromId, measureFromId, measureToId } = useFactoryStore()
  const selectMachine = useFactoryStore((s) => s.selectMachine)
  const selectZone = useFactoryStore((s) => s.selectZone)
  const selectConnection = useFactoryStore((s) => s.selectConnection)
  const moveMachine = useFactoryStore((s) => s.moveMachine)
  const beginConnection = useFactoryStore((s) => s.beginConnection)
  const completeConnection = useFactoryStore((s) => s.completeConnection)
  const setMeasurePoint = useFactoryStore((s) => s.setMeasurePoint)
  const addZone = useFactoryStore((s) => s.addZone)
  const setEditorMode = useFactoryStore((s) => s.setEditorMode)

  const editorSettings = useSettingsStore((s) => s.editor)
  const telemetrySummary = useTelemetryStore((s) => s.summary)

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [zoneStart, setZoneStart] = useState<THREE.Vector3 | null>(null)

  const handleGroundClick = (point: THREE.Vector3) => {
    if (editorMode === 'add-zone') {
      if (!zoneStart) {
        setZoneStart(point.clone())
      } else {
        const x1 = Math.min(zoneStart.x, point.x)
        const x2 = Math.max(zoneStart.x, point.x)
        const z1 = Math.min(zoneStart.z, point.z)
        const z2 = Math.max(zoneStart.z, point.z)
        const width = Math.max(2, Math.round(x2 - x1))
        const depth = Math.max(2, Math.round(z2 - z1))
        const zoneCount = zones.length + 1
        const palette = ['#5B7A8C', '#3E7C59', '#C97A3D', '#B4483C', '#8B7AC9']
        const zone: Zone = {
          id: `Z-${Date.now()}`,
          name: `Zone ${zoneCount}`,
          color: palette[zoneCount % palette.length],
          bounds: { x: Math.round(x1), z: Math.round(z1), width, depth },
        }
        addZone(zone)
        setZoneStart(null)
        setEditorMode('select')
      }
    } else {
      selectMachine(null)
      selectZone(null)
      selectConnection(null)
    }
  }

  const handleMachinePointerDown = (id: string) => {
    if (editorMode === 'select') {
      selectMachine(id)
      setDraggingId(id)
      if (controlsRef.current) controlsRef.current.enabled = false
    } else if (editorMode === 'connect') {
      if (!connectFromId) beginConnection(id)
      else completeConnection(id)
    } else if (editorMode === 'measure') {
      setMeasurePoint(id)
    } else {
      selectMachine(id)
    }
  }

  const handleDrag = (point: THREE.Vector3) => {
    if (!draggingId) return
    const x = snap(point.x, editorSettings.gridSize, editorSettings.snapToGrid)
    const z = snap(point.z, editorSettings.gridSize, editorSettings.snapToGrid)
    moveMachine(draggingId, { x, y: 0, z })
  }

  const stopDragging = () => {
    setDraggingId(null)
    if (controlsRef.current) controlsRef.current.enabled = true
  }

  return (
    <Canvas shadows camera={{ position: [26, 22, 26], fov: 45 }} onPointerUp={stopDragging} onPointerLeave={stopDragging}>
      <color attach="background" args={['#F4F5F3']} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[20, 30, 12]} intensity={1.0} castShadow shadow-mapSize={[1024, 1024]} />
      <hemisphereLight args={['#FFFFFF', '#D8DCD8', 0.5]} />

      <SceneBridge bridgeRef={bridgeRef} />

      {editorSettings.gridEnabled && (
        <Grid
          args={[400, 400]}
          cellSize={editorSettings.gridSize}
          cellThickness={0.5}
          cellColor="#D8DBD8"
          sectionSize={editorSettings.gridSize * 10}
          sectionThickness={1}
          sectionColor="#B7BDB8"
          fadeDistance={90}
          fadeStrength={1}
          infiniteGrid
        />
      )}
      {/* subtle floor so the scene doesn't look like it's floating when grid is off */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#FAFBFA" roughness={1} />
      </mesh>

      <GroundPlane onGroundClick={handleGroundClick} />
      <DragHandler draggingId={draggingId} onDrag={handleDrag} />

      {zones.map((z) => (
        <ZoneFloor key={z.id} zone={z} selected={z.id === selectedZoneId} onSelect={selectZone} />
      ))}

      {zoneStart && <ZoneDrawPreview start={zoneStart} />}

      {connections.map((c) => (
        <ConnectionLine key={c.id} connection={c} machines={machines} selected={c.id === selectedConnectionId} onSelect={selectConnection} />
      ))}

      {machines.map((m) => (
        <MachineMesh
          key={m.id}
          machine={m}
          liveStatus={statusFromEntry(telemetrySummary?.entries.find((e) => e.machineId === m.id))}
          selected={m.id === selectedId}
          connecting={m.id === connectFromId}
          measuring={m.id === measureFromId || m.id === measureToId}
          interactive
          onSelect={selectMachine}
          onPointerDown={handleMachinePointerDown}
        />
      ))}

      <MeasureOverlay fromId={measureFromId} toId={measureToId} machines={machines} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={110}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  )
}
