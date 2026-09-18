// Canonical factory/editor state. One Zustand store — no Redux — because
// the shape is flat and a student should be able to read this file start
// to finish and understand the whole app's mutable state.
//
// Persistence: every mutating action calls `persist()`, which writes the
// current machines/connections/zones to localStorage via factoryService
// (see services/factoryService.ts). That's also the seam that becomes a
// real PUT /api/factories/:id/layout call later.
//
// Undo/redo: a simple snapshot-based history. Not the most memory-efficient
// approach, but transparent and easy to reason about for a prototype of
// this size (dozens, not thousands, of objects).

import { create } from 'zustand'
import type { Machine, Connection, Zone, EditorMode, Factory } from '../types'
import * as factoryService from '../services/factoryService'

interface Snapshot {
  machines: Machine[]
  connections: Connection[]
  zones: Zone[]
}

interface FactoryState {
  hydrated: boolean
  factory: Factory | null
  machines: Machine[]
  connections: Connection[]
  zones: Zone[]

  selectedId: string | null
  selectedConnectionId: string | null
  selectedZoneId: string | null
  editorMode: EditorMode
  connectFromId: string | null
  measureFromId: string | null
  measureToId: string | null

  isSaving: boolean
  lastSavedAt: string | null

  past: Snapshot[]
  future: Snapshot[]

  hydrate: () => Promise<void>

  selectMachine: (id: string | null) => void
  selectConnection: (id: string | null) => void
  selectZone: (id: string | null) => void
  setEditorMode: (mode: EditorMode) => void

  addMachine: (machine: Machine) => void
  updateMachine: (id: string, patch: Partial<Machine>) => void
  moveMachine: (id: string, position: Machine['position']) => void
  rotateMachine: (id: string, rotation: Partial<Machine['rotation']>) => void
  deleteMachine: (id: string) => void
  duplicateMachine: (id: string) => void

  beginConnection: (fromId: string) => void
  completeConnection: (toId: string) => void
  cancelConnection: () => void
  deleteConnection: (id: string) => void

  addZone: (zone: Zone) => void
  updateZone: (id: string, patch: Partial<Zone>) => void
  deleteZone: (id: string) => void

  setMeasurePoint: (id: string) => void
  clearMeasure: () => void

  undo: () => void
  redo: () => void

  saveLayout: () => Promise<void>
  resetFactory: (factory: Factory) => void
  updateFactory: (patch: Partial<Factory>) => void
}

const MAX_HISTORY = 40

function snapshotOf(s: FactoryState): Snapshot {
  return { machines: s.machines, connections: s.connections, zones: s.zones }
}

// Wraps a mutation so it (a) pushes the pre-mutation state onto the undo
// stack and (b) persists the post-mutation state to localStorage.
function withHistory(
  set: (fn: (s: FactoryState) => Partial<FactoryState>) => void,
  get: () => FactoryState,
  mutate: (s: FactoryState) => Partial<Snapshot>
) {
  const prev = snapshotOf(get())
  set((s) => ({
    ...mutate(s),
    past: [...s.past, prev].slice(-MAX_HISTORY),
    future: [],
  }))
  void persistCurrent(get)
}

let persistTimer: ReturnType<typeof setTimeout> | null = null
function persistCurrent(get: () => FactoryState) {
  // Debounce writes slightly so rapid drag updates don't spam localStorage.
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    const { machines, connections, zones } = get()
    factoryService.saveLayout({ machines, connections, zones })
  }, 150)
}

export const useFactoryStore = create<FactoryState>((set, get) => ({
  hydrated: false,
  factory: null,
  machines: [],
  connections: [],
  zones: [],

  selectedId: null,
  selectedConnectionId: null,
  selectedZoneId: null,
  editorMode: 'select',
  connectFromId: null,
  measureFromId: null,
  measureToId: null,

  isSaving: false,
  lastSavedAt: null,

  past: [],
  future: [],

  hydrate: async () => {
    const [factory, machines, connections, zones] = await Promise.all([
      factoryService.getFactory(),
      factoryService.getMachines(),
      factoryService.getConnections(),
      factoryService.getZones(),
    ])
    set({ factory, machines, connections, zones, hydrated: true })
  },

  selectMachine: (id) => set({ selectedId: id, selectedConnectionId: null, selectedZoneId: null }),
  selectConnection: (id) => set({ selectedConnectionId: id, selectedId: null }),
  selectZone: (id) => set({ selectedZoneId: id, selectedId: null }),
  setEditorMode: (mode) => set({ editorMode: mode, connectFromId: null, measureFromId: null, measureToId: null }),

  addMachine: (machine) => {
    withHistory(set, get, (s) => ({ machines: [...s.machines, machine] }))
    set({ selectedId: machine.id })
  },

  updateMachine: (id, patch) =>
    withHistory(set, get, (s) => ({
      machines: s.machines.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),

  moveMachine: (id, position) =>
    withHistory(set, get, (s) => ({
      machines: s.machines.map((m) => (m.id === id ? { ...m, position } : m)),
    })),

  rotateMachine: (id, rotation) =>
    withHistory(set, get, (s) => ({
      machines: s.machines.map((m) => (m.id === id ? { ...m, rotation: { ...m.rotation, ...rotation } } : m)),
    })),

  deleteMachine: (id) => {
    withHistory(set, get, (s) => ({
      machines: s.machines.filter((m) => m.id !== id),
      connections: s.connections.filter((c) => c.fromMachineId !== id && c.toMachineId !== id),
    }))
    set((s) => ({ selectedId: s.selectedId === id ? null : s.selectedId }))
  },

  duplicateMachine: (id) => {
    const original = get().machines.find((m) => m.id === id)
    if (!original) return
    const copy: Machine = {
      ...original,
      id: `${original.type.slice(0, 4).toUpperCase().replace(/\s/g, '')}-${Date.now().toString().slice(-5)}`,
      name: `${original.name} (Copy)`,
      position: { ...original.position, x: original.position.x + 2, z: original.position.z + 2 },
    }
    withHistory(set, get, (s) => ({ machines: [...s.machines, copy] }))
    set({ selectedId: copy.id })
  },

  beginConnection: (fromId) => set({ connectFromId: fromId }),

  completeConnection: (toId) => {
    const fromId = get().connectFromId
    if (!fromId || fromId === toId) return set({ connectFromId: null })
    const alreadyExists = get().connections.some(
      (c) => (c.fromMachineId === fromId && c.toMachineId === toId) || (c.fromMachineId === toId && c.toMachineId === fromId)
    )
    if (alreadyExists) return set({ connectFromId: null })
    const newConnection: Connection = {
      id: `C-${Date.now()}`,
      fromMachineId: fromId,
      toMachineId: toId,
      kind: 'material-flow',
    }
    withHistory(set, get, (s) => ({ connections: [...s.connections, newConnection] }))
    set({ connectFromId: null, selectedConnectionId: newConnection.id, selectedId: null, selectedZoneId: null })
  },

  cancelConnection: () => set({ connectFromId: null }),

  deleteConnection: (id) => {
    withHistory(set, get, (s) => ({ connections: s.connections.filter((c) => c.id !== id) }))
    set({ selectedConnectionId: null })
  },

  addZone: (zone) => {
    withHistory(set, get, (s) => ({ zones: [...s.zones, zone] }))
    set({ selectedZoneId: zone.id })
  },

  updateZone: (id, patch) =>
    withHistory(set, get, (s) => ({
      zones: s.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)),
    })),

  deleteZone: (id) => {
    withHistory(set, get, (s) => ({
      zones: s.zones.filter((z) => z.id !== id),
      machines: s.machines.map((m) => (m.zoneId === id ? { ...m, zoneId: undefined } : m)),
    }))
    set({ selectedZoneId: null })
  },

  setMeasurePoint: (id) => {
    const { measureFromId } = get()
    if (!measureFromId) set({ measureFromId: id, measureToId: null })
    else if (measureFromId === id) set({ measureFromId: null })
    else set({ measureToId: id })
  },
  clearMeasure: () => set({ measureFromId: null, measureToId: null }),

  undo: () => {
    const { past, future } = get()
    if (past.length === 0) return
    const prev = past[past.length - 1]
    const current = snapshotOf(get())
    set({ ...prev, past: past.slice(0, -1), future: [current, ...future].slice(0, MAX_HISTORY) })
    persistCurrent(get)
  },

  redo: () => {
    const { past, future } = get()
    if (future.length === 0) return
    const next = future[0]
    const current = snapshotOf(get())
    set({ ...next, future: future.slice(1), past: [...past, current].slice(-MAX_HISTORY) })
    persistCurrent(get)
  },

  saveLayout: async () => {
    set({ isSaving: true })
    const { machines, connections, zones } = get()
    const result = await factoryService.saveLayout({ machines, connections, zones })
    set({ isSaving: false, lastSavedAt: result.savedAt })
  },

  resetFactory: (factory) => set({ factory, machines: [], connections: [], zones: [], past: [], future: [] }),

  updateFactory: (patch) => {
    set((s) => (s.factory ? { factory: { ...s.factory, ...patch } } : {}))
    const updated = get().factory
    if (updated) factoryService.saveFactory(updated)
  },
}))
