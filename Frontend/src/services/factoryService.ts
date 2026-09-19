import type { Factory, Machine, Connection, Zone, MachineType } from '../types'
import { apiRequest } from './api'

interface BackendFactory {
  id: number
  name: string
  site: string
  area: number
  description: string
  created_at: string
}

interface BackendZone {
  id: number
  factory: number
  name: string
  position_x: number
  position_y: number
  position_z: number
  width: number
  depth: number
  created_at: string
}

interface BackendMachine {
  id: number
  factory: number
  zone: number | null
  name: string
  machine_type: string
  power_kw: number
  operating_hours: number
  utilization: number
  production_rate: number
  production_unit: string
  heat_output: number
  emission_factor: number
  position_x: number
  position_y: number
  position_z: number
  rotation_x: number
  rotation_y: number
  rotation_z: number
  created_at: string
}

interface BackendConnection {
  id: number
  factory: number
  source_machine: number
  destination_machine: number
  flow_type: string
  created_at: string
}

const MACHINE_TYPE_TO_BACKEND: Record<MachineType, string> = {
  CNC: 'CNC',
  Press: 'PRESS',
  Conveyor: 'CONVEYOR',
  HVAC: 'HVAC',
  'Robot Arm': 'ROBOT_ARM',
  Compressor: 'COMPRESSOR',
  Welding: 'WELDING',
  Packaging: 'PACKAGING',
}

const BACKEND_TYPE_TO_MACHINE: Record<string, MachineType> = {
  CNC: 'CNC',
  PRESS: 'Press',
  CONVEYOR: 'Conveyor',
  HVAC: 'HVAC',
  ROBOT_ARM: 'Robot Arm',
  COMPRESSOR: 'Compressor',
  WELDING: 'Welding',
  PACKAGING: 'Packaging',
}

const ZONE_COLORS = ['#5B7A8C', '#3E7C59', '#C97A3D', '#B4483C', '#8B7AC9']

let currentFactoryId: number | null = null
let syncQueue: Promise<unknown> = Promise.resolve()

function isPersistedId(id: string) {
  return /^\d+$/.test(id)
}

function factoryFromApi(value: BackendFactory): Factory {
  return {
    id: String(value.id),
    name: value.name,
    site: value.site,
    areaSqm: value.area,
    description: value.description || undefined,
    createdAt: value.created_at,
  }
}

function machineFromApi(value: BackendMachine): Machine {
  return {
    id: String(value.id),
    name: value.name,
    type: BACKEND_TYPE_TO_MACHINE[value.machine_type] ?? 'CNC',
    powerKw: value.power_kw,
    operatingHours: value.operating_hours,
    utilization: value.utilization,
    productionRate: value.production_rate,
    productionUnit: value.production_unit,
    heatOutput: value.heat_output,
    emissionFactor: value.emission_factor,
    position: {
      x: value.position_x,
      y: value.position_y,
      z: value.position_z,
    },
    rotation: {
      x: value.rotation_x,
      y: value.rotation_y,
      z: value.rotation_z,
    },
    zoneId: value.zone ? String(value.zone) : undefined,
  }
}

function zoneFromApi(value: BackendZone, index: number): Zone {
  return {
    id: String(value.id),
    name: value.name,
    color: ZONE_COLORS[index % ZONE_COLORS.length],
    bounds: {
      x: value.position_x,
      z: value.position_z,
      width: value.width,
      depth: value.depth,
    },
  }
}

function connectionFromApi(value: BackendConnection): Connection {
  return {
    id: String(value.id),
    fromMachineId: String(value.source_machine),
    toMachineId: String(value.destination_machine),
    kind: 'material-flow',
  }
}

function machinePayload(machine: Machine, factoryId: number, zoneIdOverride?: number | null) {
  return {
    factory: factoryId,
    zone: zoneIdOverride !== undefined
      ? zoneIdOverride
      : machine.zoneId && isPersistedId(machine.zoneId)
        ? Number(machine.zoneId)
        : null,
    name: machine.name,
    machine_type: MACHINE_TYPE_TO_BACKEND[machine.type],
    power_kw: machine.powerKw,
    operating_hours: machine.operatingHours,
    utilization: machine.utilization,
    production_rate: machine.productionRate,
    production_unit: machine.productionUnit,
    heat_output: machine.heatOutput,
    emission_factor: machine.emissionFactor,
    position_x: machine.position.x,
    position_y: machine.position.y,
    position_z: machine.position.z,
    rotation_x: machine.rotation.x,
    rotation_y: machine.rotation.y,
    rotation_z: machine.rotation.z,
  }
}

function zonePayload(zone: Zone, factoryId: number) {
  return {
    factory: factoryId,
    name: zone.name,
    position_x: zone.bounds.x,
    position_y: 0,
    position_z: zone.bounds.z,
    width: zone.bounds.width,
    depth: zone.bounds.depth,
  }
}

async function getCurrentFactoryId() {
  if (currentFactoryId !== null) return currentFactoryId
  const factories = await apiRequest<BackendFactory[]>('/factories/')
  if (!factories.length) throw new Error('No factory exists. Create a factory first.')
  currentFactoryId = factories[0].id
  return currentFactoryId
}

export async function getFactory(): Promise<Factory> {
  const factories = await apiRequest<BackendFactory[]>('/factories/')
  if (!factories.length) throw new Error('No factory exists. Create a factory first.')
  currentFactoryId = factories[0].id
  return factoryFromApi(factories[0])
}

export async function getMachines(): Promise<Machine[]> {
  const factoryId = await getCurrentFactoryId()
  const values = await apiRequest<BackendMachine[]>('/machines/')
  return values.filter((value) => value.factory === factoryId).map(machineFromApi)
}

export async function getConnections(): Promise<Connection[]> {
  const factoryId = await getCurrentFactoryId()
  const values = await apiRequest<BackendConnection[]>('/connections/')
  return values.filter((value) => value.factory === factoryId).map(connectionFromApi)
}

export async function getZones(): Promise<Zone[]> {
  const factoryId = await getCurrentFactoryId()
  const values = await apiRequest<BackendZone[]>('/zones/')
  return values.filter((value) => value.factory === factoryId).map((value, index) => zoneFromApi(value, index))
}

async function reconcileLayout(payload: {
  machines: Machine[]
  connections: Connection[]
  zones: Zone[]
}): Promise<{
  machines: Machine[]
  connections: Connection[]
  zones: Zone[]
  savedAt: string
  machineIdMap: Record<string, string>
  zoneIdMap: Record<string, string>
  connectionIdMap: Record<string, string>
}> {
  const factoryId = await getCurrentFactoryId()

  const [serverMachines, serverZones, serverConnections] = await Promise.all([
    apiRequest<BackendMachine[]>('/machines/'),
    apiRequest<BackendZone[]>('/zones/'),
    apiRequest<BackendConnection[]>('/connections/'),
  ])

  const existingMachines = serverMachines.filter((m) => m.factory === factoryId)
  const existingZones = serverZones.filter((z) => z.factory === factoryId)
  const existingConnections = serverConnections.filter((c) => c.factory === factoryId)

  const zoneIdMap = new Map<string, string>()
  const savedZones: Zone[] = []

  for (const zone of payload.zones) {
    if (isPersistedId(zone.id)) {
      const saved = await apiRequest<BackendZone>(`/zones/${zone.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(zonePayload(zone, factoryId)),
      })
      zoneIdMap.set(zone.id, String(saved.id))
      savedZones.push(zoneFromApi(saved, savedZones.length))
    } else {
      const saved = await apiRequest<BackendZone>('/zones/', {
        method: 'POST',
        body: JSON.stringify(zonePayload(zone, factoryId)),
      })
      zoneIdMap.set(zone.id, String(saved.id))
      savedZones.push(zoneFromApi(saved, savedZones.length))
    }
  }

  const desiredZoneIds = new Set(savedZones.map((z) => Number(z.id)))

  for (const existing of existingZones) {
    if (!desiredZoneIds.has(existing.id)) {
      await apiRequest<void>(`/zones/${existing.id}/`, { method: 'DELETE' })
    }
  }

  const machineIdMap = new Map<string, string>()
  const savedMachines: Machine[] = []

  for (const machine of payload.machines) {
    const mappedZoneId = machine.zoneId
      ? zoneIdMap.get(machine.zoneId) ?? (isPersistedId(machine.zoneId) ? machine.zoneId : undefined)
      : undefined

    const body = machinePayload(
      machine,
      factoryId,
      mappedZoneId ? Number(mappedZoneId) : null
    )

    if (isPersistedId(machine.id)) {
      const saved = await apiRequest<BackendMachine>(`/machines/${machine.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      machineIdMap.set(machine.id, String(saved.id))
      savedMachines.push(machineFromApi(saved))
    } else {
      const saved = await apiRequest<BackendMachine>('/machines/', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      machineIdMap.set(machine.id, String(saved.id))
      savedMachines.push(machineFromApi(saved))
    }
  }

  const desiredMachineIds = new Set(savedMachines.map((m) => Number(m.id)))

  for (const existing of existingMachines) {
    if (!desiredMachineIds.has(existing.id)) {
      await apiRequest<void>(`/machines/${existing.id}/`, { method: 'DELETE' })
    }
  }

  const savedMachineByOldId = new Map(
    payload.machines.map((machine) => [machine.id, machineIdMap.get(machine.id)!])
  )

  const savedConnections: Connection[] = []
  const connectionIdMap = new Map<string, string>()

  for (const connection of payload.connections) {
    const sourceId = savedMachineByOldId.get(connection.fromMachineId) ?? connection.fromMachineId
    const destinationId = savedMachineByOldId.get(connection.toMachineId) ?? connection.toMachineId

    if (!isPersistedId(sourceId) || !isPersistedId(destinationId)) continue

    const body = {
      factory: factoryId,
      source_machine: Number(sourceId),
      destination_machine: Number(destinationId),
      flow_type: 'MATERIAL',
    }

    if (isPersistedId(connection.id)) {
      const saved = await apiRequest<BackendConnection>(`/connections/${connection.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      connectionIdMap.set(connection.id, String(saved.id))
      savedConnections.push(connectionFromApi(saved))
    } else {
      const saved = await apiRequest<BackendConnection>('/connections/', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      connectionIdMap.set(connection.id, String(saved.id))
      savedConnections.push(connectionFromApi(saved))
    }
  }

  const desiredConnectionIds = new Set(savedConnections.map((c) => Number(c.id)))

  for (const existing of existingConnections) {
    if (!desiredConnectionIds.has(existing.id)) {
      await apiRequest<void>(`/connections/${existing.id}/`, { method: 'DELETE' })
    }
  }

  return {
    machines: savedMachines,
    zones: savedZones,
    connections: savedConnections,
    savedAt: new Date().toISOString(),
    machineIdMap: Object.fromEntries(machineIdMap),
    zoneIdMap: Object.fromEntries(zoneIdMap),
    connectionIdMap: Object.fromEntries(connectionIdMap),
  }
}

export function saveLayout(payload: {
  machines: Machine[]
  connections: Connection[]
  zones: Zone[]
}): Promise<{
  machines: Machine[]
  connections: Connection[]
  zones: Zone[]
  savedAt: string
  machineIdMap: Record<string, string>
  zoneIdMap: Record<string, string>
  connectionIdMap: Record<string, string>
}> {
  syncQueue = syncQueue.then(() => reconcileLayout(payload))
  return syncQueue as Promise<{
    machines: Machine[]
    connections: Connection[]
    zones: Zone[]
    savedAt: string
    machineIdMap: Record<string, string>
    zoneIdMap: Record<string, string>
    connectionIdMap: Record<string, string>
  }>
}

export async function createFactory(input: {
  name: string
  site: string
  areaSqm: number
  description?: string
}): Promise<Factory> {
  const value = await apiRequest<BackendFactory>('/factories/', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      site: input.site,
      area: input.areaSqm,
      description: input.description ?? '',
    }),
  })

  currentFactoryId = value.id
  return factoryFromApi(value)
}

export async function saveFactory(factory: Factory): Promise<{ ok: true }> {
  const value = await apiRequest<BackendFactory>(`/factories/${factory.id}/`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: factory.name,
      site: factory.site,
      area: factory.areaSqm,
      description: factory.description ?? '',
    }),
  })

  currentFactoryId = value.id
  return { ok: true }
}

export function hasExistingFactory(): boolean {
  return currentFactoryId !== null
}
