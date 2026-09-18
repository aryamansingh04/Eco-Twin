import { useMemo, useState } from 'react'
import {
  Search, MousePointer2, Cable, Ruler, LandPlot, Trash2,
  Box, ArrowDownToLine, MoveHorizontal, Wind, Bot, Gauge, Zap, Package,
} from 'lucide-react'
import { PALETTE_ITEMS, PALETTE_CATEGORIES, type PaletteItem } from '../../data/paletteItems'
import { useFactoryStore } from '../../store/useFactoryStore'
import type { EditorMode, Machine } from '../../types'
import clsx from 'clsx'

const ICON_BY_TYPE: Record<PaletteItem['type'], typeof Box> = {
  CNC: Box,
  Press: ArrowDownToLine,
  Conveyor: MoveHorizontal,
  HVAC: Wind,
  'Robot Arm': Bot,
  Compressor: Gauge,
  Welding: Zap,
  Packaging: Package,
}

const TOOLS: { mode: EditorMode; label: string; icon: typeof MousePointer2 }[] = [
  { mode: 'select', label: 'Select', icon: MousePointer2 },
  { mode: 'connect', label: 'Connect', icon: Cable },
  { mode: 'measure', label: 'Measure', icon: Ruler },
  { mode: 'add-zone', label: 'Add Zone', icon: LandPlot },
]

function nextId(prefix: string, machines: Machine[]) {
  const shortMap: Record<string, string> = { CNC: 'CNC', Press: 'Press', Conveyor: 'Conveyor', HVAC: 'HVAC', 'Robot Arm': 'Robot', Compressor: 'Compressor', Welding: 'Weld', Packaging: 'Pack' }
  const short = shortMap[prefix] ?? prefix
  const nums = machines.filter((m) => m.id.startsWith(`${short}-`)).map((m) => parseInt(m.id.split('-')[1] ?? '0', 10))
  const n = (nums.length ? Math.max(...nums) : 0) + 1
  return `${short}-${String(n).padStart(3, '0')}`
}

// Left-edge palette: searchable component list (drag-and-drop source) plus
// the tool-mode buttons. Click-to-add is the fallback for drag/drop — it
// places the machine at a small random offset near the origin.
export function ComponentPalette() {
  const [query, setQuery] = useState('')
  const machines = useFactoryStore((s) => s.machines)
  const editorMode = useFactoryStore((s) => s.editorMode)
  const setEditorMode = useFactoryStore((s) => s.setEditorMode)
  const addMachine = useFactoryStore((s) => s.addMachine)
  const selectedId = useFactoryStore((s) => s.selectedId)
  const deleteMachine = useFactoryStore((s) => s.deleteMachine)

  const filtered = useMemo(
    () => PALETTE_ITEMS.filter((i) => i.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  )

  const handleClickAdd = (item: PaletteItem) => {
    const id = nextId(item.type, machines)
    const jitter = () => Math.round((Math.random() - 0.5) * 6)
    const machine: Machine = {
      id,
      name: item.name + ' ' + id.split('-')[1],
      type: item.type,
      powerKw: item.defaults.powerKw,
      operatingHours: item.defaults.operatingHours,
      utilization: item.defaults.utilization,
      heatOutput: item.defaults.heatOutput,
      productionRate: item.defaults.productionRate,
      productionUnit: item.defaults.productionUnit,
      emissionFactor: 0.72,
      position: { x: jitter(), y: 0, z: jitter() },
      rotation: { x: 0, y: 0, z: 0 },
    }
    addMachine(machine)
  }

  return (
    <div className="w-64 shrink-0 h-full bg-white border-r border-line flex flex-col">
      <div className="px-3 pt-3 pb-2 border-b border-line">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-7 pr-2 py-1.5 text-[12px] bg-surface border border-line rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      <div className="px-3 pt-3 pb-2">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted mb-1.5">Tools</div>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {TOOLS.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              title={label}
              onClick={() => setEditorMode(mode)}
              className={clsx(
                'flex flex-col items-center gap-1 py-2 rounded-md border text-[9.5px] transition-colors',
                editorMode === mode ? 'bg-brand text-white border-brand' : 'border-line text-ink-muted hover:bg-surface'
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
        <button
          disabled={!selectedId}
          onClick={() => selectedId && deleteMachine(selectedId)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-line text-[11px] text-danger disabled:opacity-30 disabled:cursor-not-allowed hover:bg-danger-soft transition-colors"
        >
          <Trash2 size={12} /> Delete Selected
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {PALETTE_CATEGORIES.map((category) => {
          const items = filtered.filter((i) => i.category === category)
          if (items.length === 0) return null
          return (
            <div key={category} className="mb-4">
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted mb-1.5">{category}</div>
              <div className="space-y-1.5">
                {items.map((item) => {
                  const Icon = ICON_BY_TYPE[item.type]
                  return (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/ecotwin-machine-type', item.type)
                        e.dataTransfer.effectAllowed = 'copy'
                      }}
                      onClick={() => handleClickAdd(item)}
                      title="Drag into the workspace, or click to add"
                      className="flex items-start gap-2.5 p-2 rounded-md border border-line hover:border-brand hover:bg-brand-soft/40 cursor-grab active:cursor-grabbing transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-md bg-surface flex items-center justify-center text-ink-muted group-hover:text-brand shrink-0">
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-medium text-ink leading-tight">{item.name}</div>
                        <div className="text-[10.5px] text-ink-muted leading-snug mt-0.5">{item.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && <p className="text-[11px] text-ink-muted text-center mt-6">No components match "{query}"</p>}
      </div>
    </div>
  )
}
