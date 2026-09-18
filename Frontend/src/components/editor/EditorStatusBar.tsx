import { useFactoryStore } from '../../store/useFactoryStore'
import { materialFlowStats } from '../../utils/calculations'

export function EditorStatusBar() {
  const machines = useFactoryStore((s) => s.machines)
  const connections = useFactoryStore((s) => s.connections)
  const zones = useFactoryStore((s) => s.zones)
  const selectedId = useFactoryStore((s) => s.selectedId)
  const editorMode = useFactoryStore((s) => s.editorMode)
  const measureFromId = useFactoryStore((s) => s.measureFromId)
  const measureToId = useFactoryStore((s) => s.measureToId)

  const flow = materialFlowStats(connections, machines)

  const modeHint: Record<string, string> = {
    select: 'Click a machine to select · drag to move',
    'add-zone': 'Click two corners on the grid to draw a zone',
    connect: 'Click a source machine, then a target machine',
    measure: 'Click two machines to measure distance',
  }

  return (
    <div className="absolute left-4 right-4 bottom-4 h-10 bg-white border border-line rounded-lg z-10 flex items-center justify-between px-4 text-[11.5px] font-data text-ink-muted shadow-sm">
      <div className="flex items-center gap-5">
        <span>Machines: <span className="text-ink">{machines.length}</span></span>
        <span>Connections: <span className="text-ink">{connections.length}</span></span>
        <span>Zones: <span className="text-ink">{zones.length}</span></span>
        <span>Selected: <span className="text-ink">{selectedId ?? '—'}</span></span>
        <span className="text-line">|</span>
        <span>Total Flow Distance: <span className="text-ink">{flow.totalDistance} m</span></span>
        <span>Avg: <span className="text-ink">{flow.averageDistance} m</span></span>
        {editorMode === 'measure' && measureFromId && measureToId && (
          <span className="text-warn font-semibold">Measuring {measureFromId} → {measureToId}</span>
        )}
      </div>
      <span className="text-ink-muted italic">{modeHint[editorMode]}</span>
    </div>
  )
}
