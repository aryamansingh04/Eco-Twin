import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, AlertTriangle } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { Card, CardHeader } from '../components/ui/Card'
import { StatusDot } from '../components/machines/StatusDot'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getEnergySeries } from '../data/mockEnergy'
import { useFactoryData } from '../hooks/useFactoryData'
import { machineDailyEnergyKwh, machineDailyCarbonKg, machineHealthScore, connectionCountForMachine } from '../utils/calculations'
import { useFactoryStore } from '../store/useFactoryStore'
import { useLiveStatusFor } from '../hooks/useLiveStatus'
import { useTelemetryStore } from '../store/useTelemetryStore'

export function MachineDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { machines, connections, zones, emissionFactor } = useFactoryData()
  const selectMachine = useFactoryStore((s) => s.selectMachine)
  const machine = machines.find((m) => m.id === id)
  const liveStatus = useLiveStatusFor(id ?? '')
  const liveEntry = useTelemetryStore((s) => s.summary?.entries.find((e) => e.machineId === id))

  if (!machine) {
    return (
      <PageShell title="Machine not found">
        <button onClick={() => navigate('/machines')} className="text-sm text-brand hover:underline">← Back to Machines</button>
      </PageShell>
    )
  }

  // Anchored to THIS machine's own calculated daily energy (not the
  // factory total) — the trend shape is illustrative, but the most recent
  // day always equals what the inspector/table show for this machine.
  const trend = getEnergySeries('7d', machineDailyEnergyKwh(machine))

  const energy = machineDailyEnergyKwh(machine)
  const carbon = machineDailyCarbonKg(machine, emissionFactor)
  const health = machineHealthScore(machine)
  const zone = zones.find((z) => z.id === machine.zoneId)
  const connCount = connectionCountForMachine(machine.id, connections)

  const goLocate = () => {
    selectMachine(machine.id)
    navigate('/factory/editor')
  }

  return (
    <PageShell title={machine.name} subtitle={`${machine.id} · ${machine.type}`}>
      <Link to="/machines" className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-ink mb-4">
        <ArrowLeft size={13} /> Back to Machines
      </Link>

      <div className="grid grid-cols-3 gap-5">
        <Card className="col-span-2">
          <CardHeader title="Energy Trend" subtitle="Today's value is calculated live; the 7-day shape is illustrative (real history requires metering)" />
          <div className="h-56 px-2 pt-4 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E1" vertical={false} />
                <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: '#5B6870' }} axisLine={{ stroke: '#E1E4E1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#5B6870' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Line type="monotone" dataKey="consumptionKwh" stroke="#3E7C59" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Machine Information" />
          <div className="p-5 space-y-3 text-[12.5px]">
            <Row label="Status"><StatusDot status={liveStatus} /></Row>
            <Row label="Live Power" value={liveEntry ? `${liveEntry.powerKw} kW` : '—'} />
            <Row label="Temperature" value={liveEntry ? `${liveEntry.temperatureC}°C` : '—'} />
            <Row label="Zone" value={zone?.name ?? 'Unassigned'} />
            <Row label="Power Rating" value={`${machine.powerKw} kW`} />
            <Row label="Operating Hours" value={`${machine.operatingHours} h/day`} />
            <Row label="Utilization" value={`${Math.round(machine.utilization * 100)}%`} />
            <Row label="Heat Output" value={`${machine.heatOutput} kW`} />
            <Row label="Production Rate" value={machine.productionRate > 0 ? `${machine.productionRate} ${machine.productionUnit}` : 'Not configured'} />
            <Row label="Daily Energy (calc.)" value={`${energy} kWh`} />
            <Row label="Daily Carbon (calc.)" value={`${carbon} kg CO₂e`} />
            <Row label="Connections" value={`${connCount}`} />
            <Row label="Health Score" value={`${health} / 100`} />
          </div>
          <button
            onClick={goLocate}
            className="mx-5 mb-5 w-[calc(100%-2.5rem)] flex items-center justify-center gap-2 py-2 text-[12.5px] font-medium text-ink border border-line rounded-md hover:bg-surface transition-colors"
          >
            <MapPin size={14} /> Locate in Factory
          </button>
        </Card>
      </div>

      {liveStatus === 'offline' && (
        <div className="mt-5 flex items-start gap-3 p-4 bg-danger-soft border border-danger/20 rounded-lg">
          <AlertTriangle size={16} className="text-danger mt-0.5 shrink-0" />
          <div className="text-[12.5px] text-ink">
            <span className="font-medium">Machine offline.</span> The latest telemetry reading shows no operating state for this machine. Downstream machines connected to it may be affected.
          </div>
        </div>
      )}
      {liveEntry && liveEntry.utilization > 0.9 && (
        <div className="mt-3 flex items-start gap-3 p-4 bg-warn-soft border border-warn/20 rounded-lg">
          <AlertTriangle size={16} className="text-warn mt-0.5 shrink-0" />
          <div className="text-[12.5px] text-ink">
            <span className="font-medium">High utilization.</span> This machine is currently reporting {Math.round(liveEntry.utilization * 100)}% utilization, above its typical sustained range.
          </div>
        </div>
      )}

      <p className="mt-4 text-[11px] text-ink-muted">
        Energy = Power × Operating Hours × Utilization. Carbon = Energy × Emission Factor ({emissionFactor} kg CO₂e/kWh, configurable in Settings). Simulated calculations, not certified measurements.
      </p>
    </PageShell>
  )
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      {children ?? <span className="font-data text-ink">{value}</span>}
    </div>
  )
}
