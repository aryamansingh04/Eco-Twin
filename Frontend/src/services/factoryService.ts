// Service layer: the ONLY place that "knows" where factory data comes
// from. Today it reads/writes localStorage (via storageService) seeded
// from mock data; later, every function body here becomes a fetch() call
// against Django REST Framework — nothing in components/pages changes.
//
//   getFactory()       -> GET /api/factories/:id
//   getMachines()       -> GET /api/factories/:id/machines
//   getConnections()   -> GET /api/factories/:id/connections
//   getZones()          -> GET /api/factories/:id/zones
//   saveLayout()        -> PUT /api/factories/:id/layout
//   createFactory()     -> POST /api/factories

import type { Factory, Machine, Connection, Zone } from '../types'
import { mockFactory, mockZones } from '../data/mockFactory'
import { mockMachines, mockConnections } from '../data/mockMachines'
import { loadJSON, saveJSON } from './storageService'

const NETWORK_DELAY_MS = 120

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export async function getFactory(): Promise<Factory> {
  return delay(loadJSON('factory', mockFactory))
}

export async function getMachines(): Promise<Machine[]> {
  return delay(loadJSON('machines', mockMachines))
}

export async function getConnections(): Promise<Connection[]> {
  return delay(loadJSON('connections', mockConnections))
}

export async function getZones(): Promise<Zone[]> {
  return delay(loadJSON('zones', mockZones))
}

export async function saveLayout(payload: {
  machines: Machine[]
  connections: Connection[]
  zones: Zone[]
}): Promise<{ ok: true; savedAt: string }> {
  saveJSON('machines', payload.machines)
  saveJSON('connections', payload.connections)
  saveJSON('zones', payload.zones)
  return delay({ ok: true, savedAt: new Date().toISOString() })
}

export async function createFactory(input: { name: string; site: string; areaSqm: number; description?: string }): Promise<Factory> {
  const factory: Factory = {
    id: `FAC-${Date.now()}`,
    name: input.name,
    site: input.site,
    areaSqm: input.areaSqm,
    description: input.description,
    createdAt: new Date().toISOString(),
  }
  saveJSON('factory', factory)
  // a brand-new factory starts empty — no inherited mock machines
  saveJSON('machines', [])
  saveJSON('connections', [])
  saveJSON('zones', [])
  return delay(factory)
}

export async function saveFactory(factory: Factory): Promise<{ ok: true }> {
  saveJSON('factory', factory)
  return delay({ ok: true })
}

export function hasExistingFactory(): boolean {
  return loadJSON<Factory | null>('factory', null) !== null
}
