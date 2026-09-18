import { PageShell } from '../components/layout/PageShell'
import { Card, CardHeader } from '../components/ui/Card'
import { KPICard } from '../components/dashboard/KPICard'
import { getEnergySeries } from '../data/mockEnergy'
import { useFactoryData } from '../hooks/useFactoryData'
import { machineDailyCarbonKg, totalCarbonKg, machinesByZone } from '../utils/calculations'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Cloud, TrendingDown } from 'lucide-react'

export function CarbonPage() {
  const { machines, zones, emissionFactor } = useFactoryData()
  const totalT = totalCarbonKg(machines, emissionFactor)
  const energySeries = getEnergySeries('12m')
  const carbonTrend = energySeries.map((e) => ({ timestamp: e.timestamp, tCO2e: Math.round((e.consumptionKwh * emissionFactor) / 1000 * 10) / 10 }))

  const topMachines = [...machines].sort((a, b) => machineDailyCarbonKg(b, emissionFactor) - machineDailyCarbonKg(a, emissionFactor)).slice(0, 6)
  const byZone = machinesByZone(machines, zones).map((z) => ({
    name: z.zoneName,
    kg: Math.round(machines.filter((m) => m.zoneId === z.zoneId).reduce((s, m) => s + machineDailyCarbonKg(m, emissionFactor), 0)),
  }))

  return (
    <PageShell title="Carbon" subtitle="Estimated emissions, derived from metered energy × emission factor">
      <div className="grid grid-cols-3 gap-4 mb-5">
        <KPICard label="Total CO₂e (per day)" value={totalT.toLocaleString()} unit="kg CO₂e" icon={<Cloud size={16} />} />
        <KPICard label="vs Last Month (illustrative)" value="1.8%" unit="lower" delta={{ value: 'Improving', positive: true }} icon={<TrendingDown size={16} />} />
        <KPICard label="Emission Factor" value={emissionFactor.toString()} unit="kg CO₂e/kWh" icon={<Cloud size={16} />} />
      </div>

      <Card className="mb-5">
        <CardHeader title="How this is calculated" subtitle="Prototype/simulated calculation, not a certified measurement" />
        <div className="px-5 py-4 flex items-center justify-center gap-4 text-[13px] font-data text-ink flex-wrap">
          <span className="px-3 py-1.5 bg-surface rounded-md">Energy Consumption (kWh)</span>
          <span className="text-ink-muted">×</span>
          <span className="px-3 py-1.5 bg-surface rounded-md">Emission Factor ({emissionFactor})</span>
          <span className="text-ink-muted">=</span>
          <span className="px-3 py-1.5 bg-brand-soft text-brand rounded-md">Estimated Carbon Emissions</span>
        </div>
        <p className="px-5 pb-4 text-[11px] text-ink-muted">Change the emission factor in Settings → Analytics; every number on this page updates immediately.</p>
      </Card>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card className="col-span-2">
          <CardHeader title="Emissions Trend" subtitle="12 months, illustrative pattern" />
          <div className="h-64 px-2 pt-4 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={carbonTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E1" vertical={false} />
                <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: '#5B6870' }} axisLine={{ stroke: '#E1E4E1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#5B6870' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} formatter={(v: any) => [`${Number(v)} tCO₂e`, '']} />
                <Line type="monotone" dataKey="tCO2e" stroke="#B4483C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Emissions by Zone" subtitle="Derived from current machines" />
          <div className="h-64 px-2 pt-4 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byZone} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#5B6870' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#5B6870' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Bar dataKey="kg" fill="#B4483C" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Emissions by Machine" subtitle="Top contributors" />
        <div className="divide-y divide-line">
          {topMachines.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-5 py-2.5 text-[12.5px]">
              <span className="text-ink">{m.name} <span className="text-ink-muted font-data text-[10.5px]">{m.type}</span></span>
              <span className="font-data text-ink-muted">{machineDailyCarbonKg(m, emissionFactor)} kg CO₂e/day</span>
            </div>
          ))}
          {topMachines.length === 0 && <p className="px-5 py-6 text-center text-ink-muted text-[12px]">No machines yet.</p>}
        </div>
      </Card>
    </PageShell>
  )
}
