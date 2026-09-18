import * as THREE from 'three'
import type { MachineType, Machine } from '../../types'
import { PALETTE_ITEMS } from '../../data/paletteItems'

// Converts a browser drop event's client coordinates into a world-space
// ground position by raycasting through the R3F camera exposed via the
// scene bridge ref. Used by FactoryEditorPage's onDrop handler.
export function screenPointToGround(
  clientX: number,
  clientY: number,
  gl: THREE.WebGLRenderer,
  camera: THREE.Camera
): THREE.Vector3 | null {
  const rect = gl.domElement.getBoundingClientRect()
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return null
  const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(ndc, camera)
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const point = new THREE.Vector3()
  raycaster.ray.intersectPlane(plane, point)
  return point
}

function nextId(type: MachineType, machines: Machine[]) {
  const short: Record<MachineType, string> = {
    CNC: 'CNC', Press: 'Press', Conveyor: 'Conveyor', HVAC: 'HVAC',
    'Robot Arm': 'Robot', Compressor: 'Compressor', Welding: 'Weld', Packaging: 'Pack',
  }
  const prefix = short[type]
  const nums = machines.filter((m) => m.id.startsWith(`${prefix}-`)).map((m) => parseInt(m.id.split('-')[1] ?? '0', 10))
  const n = (nums.length ? Math.max(...nums) : 0) + 1
  return `${prefix}-${String(n).padStart(3, '0')}`
}

export function buildMachineAtPoint(type: MachineType, point: THREE.Vector3, existingMachines: Machine[], snapFn: (v: number) => number): Machine {
  const item = PALETTE_ITEMS.find((i) => i.type === type)!
  const id = nextId(type, existingMachines)
  return {
    id,
    name: `${item.name} ${id.split('-')[1]}`,
    type,
    powerKw: item.defaults.powerKw,
    operatingHours: item.defaults.operatingHours,
    utilization: item.defaults.utilization,
    heatOutput: item.defaults.heatOutput,
    productionRate: item.defaults.productionRate,
    productionUnit: item.defaults.productionUnit,
    emissionFactor: 0.72,
    position: { x: snapFn(point.x), y: 0, z: snapFn(point.z) },
    rotation: { x: 0, y: 0, z: 0 },
  }
}
