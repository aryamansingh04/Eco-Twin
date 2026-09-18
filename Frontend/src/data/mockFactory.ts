import type { Factory, Zone } from '../types'

export const mockFactory: Factory = {
  id: 'FAC-001',
  name: 'VIT Manufacturing Plant',
  site: 'Chennai Plant 01',
  areaSqm: 8400,
  createdAt: '2025-11-02T09:00:00Z',
}

export const mockZones: Zone[] = [
  { id: 'Z-1', name: 'Machining Bay', color: '#5B7A8C', bounds: { x: -20, z: -15, width: 22, depth: 18 } },
  { id: 'Z-2', name: 'Assembly Line', color: '#3E7C59', bounds: { x: 5, z: -15, width: 20, depth: 18 } },
  { id: 'Z-3', name: 'Utilities / HVAC', color: '#C97A3D', bounds: { x: -20, z: 8, width: 42, depth: 14 } },
]
