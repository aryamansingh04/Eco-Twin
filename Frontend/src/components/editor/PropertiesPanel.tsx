import { useEffect, useState } from 'react'
import { Trash2, Copy, Check, RotateCcw } from 'lucide-react'
import { useFactoryStore } from '../../store/useFactoryStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { MACHINE_TYPES, type Machine } from '../../types'
import { machineDailyEnergyKwh, machineDailyCarbonKg, connectionCountForMachine, distance3D } from '../../utils/calculations'
import { useLiveStatusFor } from '../../hooks/useLiveStatus'
import { useTelemetryStore } from '../../store/useTelemetryStore'
import { StatusDot } from '../machines/StatusDot'

const FIELD = 'w-full px-2.5 py-1.5 text-[12.5px] font-data bg-white border border-line rounded-md text-ink focus:outline-none focus:ring-1 focus:ring-brand'
const LABEL = 'block text-[10.5px] uppercase tracking-wide text-ink-muted mb-1'

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

export function PropertiesPanel() {
  const selectedId = useFactoryStore((s) => s.selectedId)
  const selectedZoneId = useFactoryStore((s) => s.selectedZoneId)
  const selectedConnectionId = useFactoryStore((s) => s.selectedConnectionId)

  if (selectedId) return <MachineInspector id={selectedId} />
  if (selectedZoneId) return <ZoneInspector id={selectedZoneId} />
  if (selectedConnectionId) return <ConnectionInspector id={selectedConnectionId} />

  return (
    <div className="absolute right-4 top-4 bottom-20 w-72 bg-white border border-line rounded-lg z-10 flex items-center justify-center px-5 shadow-sm">
      <p className="text-[12px] text-ink-muted text-center leading-relaxed">
        Select a machine, zone, or connection to inspect and edit its properties.
      </p>
    </div>
  )
}

function MachineInspector({ id }: { id: string }) {
  const machine = useFactoryStore((s) => s.machines.find((m) => m.id === id))
  const connections = useFactoryStore((s) => s.connections)
  const zones = useFactoryStore((s) => s.zones)
  const updateMachine = useFactoryStore((s) => s.updateMachine)
  const rotateMachine = useFactoryStore((s) => s.rotateMachine)
  const moveMachine = useFactoryStore((s) => s.moveMachine)
  const deleteMachine = useFactoryStore((s) => s.deleteMachine)
  const duplicateMachine = useFactoryStore((s) => s.duplicateMachine)
  const analyticsSettings = useSettingsStore((s) => s.analytics)
  const showCoordinates = useSettingsStore((s) => s.editor.showCoordinates)
  const liveStatus = useLiveStatusFor(id)
  const liveEntry = useTelemetryStore((s) => s.summary?.entries.find((e) => e.machineId === id))

  const [draft, setDraft] = useState<Machine | null>(machine ?? null)
  const [dirty, setDirty] = useState(false)
  const [justApplied, setJustApplied] = useState(false)

  useEffect(() => {
    setDraft(machine ?? null)
    setDirty(false)
  }, [id, machine?.id])

  if (!machine || !draft) return null

  const patch = (p: Partial<Machine>) => {
    setDraft((d) => (d ? { ...d, ...p } : d))
    setDirty(true)
  }

  const apply = () => {
    updateMachine(machine.id, {
      name: draft.name,
      type: draft.type,
      zoneId: draft.zoneId,
      powerKw: clamp(draft.powerKw, 0.1, 500),
      operatingHours: clamp(draft.operatingHours, 0, 24),
      utilization: clamp(draft.utilization, 0, 1),
      heatOutput: draft.heatOutput,
      emissionFactor: clamp(draft.emissionFactor, 0, 5),
      productionRate: Math.max(0, draft.productionRate || 0),
      productionUnit: draft.productionUnit,
    })
    // spatial changes apply live already via moveMachine/rotateMachine, but
    // catch any inspector-only edits that bypassed those handlers
    moveMachine(machine.id, draft.position)
    rotateMachine(machine.id, draft.rotation)
    setDirty(false)
    setJustApplied(true)
    setTimeout(() => setJustApplied(false), 1200)
  }

  const reset = () => {
    setDraft(machine)
    setDirty(false)
  }

  const energy = machineDailyEnergyKwh(draft)
  const carbon = machineDailyCarbonKg(draft, analyticsSettings.emissionFactor)
  const connectionCount = connectionCountForMachine(machine.id, connections)

  return (
    <div className="absolute right-4 top-4 bottom-20 w-72 bg-white border border-line rounded-lg z-10 overflow-y-auto shadow-sm">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between sticky top-0 bg-white">
        <span className="font-data text-[12px] font-semibold text-ink">{machine.id}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => duplicateMachine(machine.id)} title="Duplicate" className="text-ink-muted hover:text-ink transition-colors p-1">
            <Copy size={13} />
          </button>
          <button onClick={() => deleteMachine(machine.id)} title="Delete" className="text-ink-muted hover:text-danger transition-colors p-1">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Section title="Identity">
          <Field label="Machine Name"><input className={FIELD} value={draft.name} onChange={(e) => patch({ name: e.target.value })} /></Field>
          <Field label="Machine Type">
            <select className={FIELD} value={draft.type} onChange={(e) => patch({ type: e.target.value as Machine['type'] })}>
              {MACHINE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Zone">
            <select className={FIELD} value={draft.zoneId ?? ''} onChange={(e) => patch({ zoneId: e.target.value || undefined })}>
              <option value="">Unassigned</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </Field>
        </Section>

        <Section title="Live Status" >
          <div className="flex items-center justify-between">
            <span className="text-ink-muted text-[11px] uppercase tracking-wide">Operating State</span>
            <StatusDot status={liveStatus} />
          </div>
          <Row label="Live Power" value={liveEntry ? `${liveEntry.powerKw} kW` : '—'} />
          <Row label="Live Utilization" value={liveEntry ? `${Math.round(liveEntry.utilization * 100)}%` : '—'} />
          <Row label="Temperature" value={liveEntry ? `${liveEntry.temperatureC}°C` : '—'} />
          <p className="text-[10px] text-ink-muted pt-1">From the latest telemetry reading — not part of this machine's saved configuration.</p>
        </Section>

        <Section title="Operational">
          <Field label="Power Rating (kW)">
            <input type="number" min={0.1} step={0.5} className={FIELD} value={draft.powerKw} onChange={(e) => patch({ powerKw: Number(e.target.value) })} />
          </Field>
          <Field label="Operating Hours / day">
            <input type="number" min={0} max={24} step={0.5} className={FIELD} value={draft.operatingHours} onChange={(e) => patch({ operatingHours: clamp(Number(e.target.value), 0, 24) })} />
          </Field>
          <Field label={`Utilization (${Math.round(draft.utilization * 100)}%)`}>
            <input type="range" min={0} max={1} step={0.01} className="w-full accent-brand" value={draft.utilization} onChange={(e) => patch({ utilization: Number(e.target.value) })} />
          </Field>
        </Section>

        <Section title="Environmental">
          <Field label="Heat Output (kW)">
            <input type="number" step={0.5} className={FIELD} value={draft.heatOutput} onChange={(e) => patch({ heatOutput: Number(e.target.value) })} />
          </Field>
          <Field label="Emission Factor (kg CO₂e/kWh)">
            <input type="number" min={0} max={5} step={0.01} className={FIELD} value={draft.emissionFactor} onChange={(e) => patch({ emissionFactor: clamp(Number(e.target.value), 0, 5) })} />
          </Field>
        </Section>

        <Section title="Production">
          <Field label="Production Rate">
            <input
              type="number"
              min={0}
              step={1}
              className={FIELD}
              value={draft.productionRate}
              onChange={(e) => patch({ productionRate: Math.max(0, Number(e.target.value) || 0) })}
            />
          </Field>
          <Field label="Production Unit">
            <input className={FIELD} value={draft.productionUnit} onChange={(e) => patch({ productionUnit: e.target.value })} />
          </Field>
          {draft.productionRate === 0 && (
            <p className="text-[10px] text-ink-muted">No configured production capability for this machine.</p>
          )}
        </Section>

        <Section title="Spatial">
          <div className="grid grid-cols-3 gap-2">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <Field key={axis} label={axis.toUpperCase()}>
                <input type="number" step={0.5} className={FIELD} value={draft.position[axis]} onChange={(e) => patch({ position: { ...draft.position, [axis]: Number(e.target.value) } })} />
              </Field>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <Field key={axis} label={`Rot ${axis.toUpperCase()}`}>
                <input type="number" step={0.1} className={FIELD} value={Number(draft.rotation[axis].toFixed(2))} onChange={(e) => patch({ rotation: { ...draft.rotation, [axis]: Number(e.target.value) } })} />
              </Field>
            ))}
          </div>
          {showCoordinates && (
            <p className="text-[10px] font-data text-ink-muted mt-1.5">
              World: ({draft.position.x}, {draft.position.y}, {draft.position.z})
            </p>
          )}
        </Section>

        <Section title="Calculated (read-only)">
          <div className="text-[11.5px] space-y-1.5 font-data">
            <Row label="Daily Energy" value={`${energy} kWh`} />
            <Row label="Daily Carbon" value={`${carbon} kg CO₂e`} />
            <Row label="Connections" value={`${connectionCount}`} />
          </div>
        </Section>

        <div className="flex gap-2 pt-1">
          <button
            onClick={apply}
            disabled={!dirty}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[12px] font-medium text-white bg-brand disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand/90 transition-colors"
          >
            {justApplied ? <Check size={13} /> : null} {justApplied ? 'Applied' : 'Apply'}
          </button>
          <button
            onClick={reset}
            disabled={!dirty}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] text-ink-muted border border-line disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface transition-colors"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>
    </div>
  )
}

function ZoneInspector({ id }: { id: string }) {
  const zone = useFactoryStore((s) => s.zones.find((z) => z.id === id))
  const machines = useFactoryStore((s) => s.machines)
  const updateZone = useFactoryStore((s) => s.updateZone)
  const deleteZone = useFactoryStore((s) => s.deleteZone)
  if (!zone) return null

  const machineCount = machines.filter((m) => m.zoneId === zone.id).length

  return (
    <div className="absolute right-4 top-4 bottom-20 w-72 bg-white border border-line rounded-lg z-10 overflow-y-auto shadow-sm">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
        <span className="font-data text-[12px] font-semibold text-ink">{zone.id}</span>
        <button onClick={() => deleteZone(zone.id)} className="text-ink-muted hover:text-danger transition-colors p-1">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="p-4 space-y-4">
        <Section title="Zone">
          <Field label="Name"><input className={FIELD} value={zone.name} onChange={(e) => updateZone(zone.id, { name: e.target.value })} /></Field>
          <Field label="Color">
            <input type="color" className="w-full h-8 rounded-md border border-line" value={zone.color} onChange={(e) => updateZone(zone.id, { color: e.target.value })} />
          </Field>
        </Section>
        <Section title="Bounds">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Width"><input type="number" className={FIELD} value={zone.bounds.width} onChange={(e) => updateZone(zone.id, { bounds: { ...zone.bounds, width: Math.max(2, Number(e.target.value)) } })} /></Field>
            <Field label="Depth"><input type="number" className={FIELD} value={zone.bounds.depth} onChange={(e) => updateZone(zone.id, { bounds: { ...zone.bounds, depth: Math.max(2, Number(e.target.value)) } })} /></Field>
          </div>
        </Section>
        <Row label="Machines in zone" value={`${machineCount}`} />
      </div>
    </div>
  )
}

function ConnectionInspector({ id }: { id: string }) {
  const connection = useFactoryStore((s) => s.connections.find((c) => c.id === id))
  const machines = useFactoryStore((s) => s.machines)
  const deleteConnection = useFactoryStore((s) => s.deleteConnection)
  if (!connection) return null
  const from = machines.find((m) => m.id === connection.fromMachineId)
  const to = machines.find((m) => m.id === connection.toMachineId)

  return (
    <div className="absolute right-4 top-4 bottom-20 w-72 bg-white border border-line rounded-lg z-10 overflow-y-auto shadow-sm">
      <div className="px-4 py-3 border-b border-line flex items-center justify-between">
        <span className="font-data text-[12px] font-semibold text-ink">{connection.id}</span>
        <button onClick={() => deleteConnection(connection.id)} className="text-ink-muted hover:text-danger transition-colors p-1">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="p-4 space-y-3 text-[12.5px]">
        <Row label="Type" value="Material Flow" />
        <Row label="Source" value={from?.name ?? connection.fromMachineId} />
        <Row label="Destination" value={to?.name ?? connection.toMachineId} />
        <Row label="Length" value={from && to ? `${distance3D(from.position, to.position)} m` : '—'} />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted mb-2 pb-1 border-b border-line">{title}</div>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="font-data text-ink">{value}</span>
    </div>
  )
}
