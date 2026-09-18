import { useMemo, useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { Card, CardHeader } from '../components/ui/Card'
import { KPICard } from '../components/dashboard/KPICard'
import { getEnergySeries } from '../data/mockEnergy'
import { useFactoryData } from '../hooks/useFactoryData'
import { machineDailyEnergyKwh, totalEnergyKwh, machinesByZone } from '../utils/calculations'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Zap, TrendingUp, IndianRupee, Activity } from 'lucide-react'
import { MACHINE_TYPES, type MachineType } from '../types'

export function EnergyPage() {
  const { machines, zones } = useFactoryData()
  const [machineFilter, setMachineFilter] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState<MachineType | 'all'>('all')
  const dailyTotal = totalEnergyKwh(machines)
  const series = useMemo(() => getEnergySeries('30d', dailyTotal), [dailyTotal])
  const byZone = machinesByZone(machines, zones).map((z) => ({ name: z.zoneName, kwh: z.energyKwh }))

  const filteredMachines = machines.filter(
    (m) =>
      (machineFilter === 'all' || m.id === machineFilter) &&
      (zoneFilter === 'all' || m.zoneId === zoneFilter) &&
      (typeFilter === 'all' || m.type === typeFilter)
  )

  return (
    <PageShell title="Energy" subtitle="Consumption analytics — daily figures derived from current machine properties">
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <input type="date" className="text-[12px] border border-line rounded-md px-2.5 py-1.5 bg-surface-raised" />
        <span className="text-ink-muted text-xs">to</span>
        <input type="date" className="text-[12px] border border-line rounded-md px-2.5 py-1.5 bg-surface-raised" />
        <select value={machineFilter} onChange={(e) => setMachineFilter(e.target.value)} className="text-[12px] border border-line rounded-md px-2.5 py-1.5 bg-surface-raised">
          <option value="all">All machines</option>
          {machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} className="text-[12px] border border-line rounded-md px-2.5 py-1.5 bg-surface-raised">
          <option value="all">All zones</option>
          {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as MachineType | 'all')} className="text-[12px] border border-line rounded-md px-2.5 py-1.5 bg-surface-raised">
          <option value="all">All types</option>
          {MACHINE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <KPICard label="Total Consumption" value={dailyTotal.toLocaleString()} unit="kWh/day" icon={<Zap size={16} />} />
        <KPICard label="Average per Machine" value={machines.length ? Math.round(dailyTotal / machines.length).toString() : '0'} unit="kWh/day" icon={<Activity size={16} />} />
        <KPICard label="Peak (30d, illustrative)" value="2,340" unit="kWh" icon={<TrendingUp size={16} />} />
        <KPICard label="Energy Cost" value={`₹${((dailyTotal * 8.2) / 1000).toFixed(1)}K`} unit="/day" icon={<IndianRupee size={16} />} />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card className="col-span-2">
          <CardHeader title="Consumption Over Time" subtitle="Today's value is live; the 30-day trend shape is illustrative" />
          <div className="h-64 px-2 pt-4 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="ef" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5B7A8C" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#5B7A8C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E1" vertical={false} />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#5B6870' }} axisLine={{ stroke: '#E1E4E1' }} tickLine={false} interval={2} />
                <YAxis tick={{ fontSize: 11, fill: '#5B6870' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Area type="monotone" dataKey="consumptionKwh" stroke="#5B7A8C" strokeWidth={2} fill="url(#ef)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Consumption by Zone" subtitle="Derived from current machines" />
          <div className="h-64 px-2 pt-4 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byZone} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#5B6870' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#5B6870' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Bar dataKey="kwh" fill="#3E7C59" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Consumption by Machine" subtitle={`${filteredMachines.length} machines`} />
        <div className="divide-y divide-line">
          {filteredMachines.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-5 py-2.5 text-[12.5px]">
              <span className="text-ink">{m.name} <span className="text-ink-muted font-data text-[10.5px]">{m.type}</span></span>
              <span className="font-data text-ink-muted">{machineDailyEnergyKwh(m)} kWh/day</span>
            </div>
          ))}
          {filteredMachines.length === 0 && <p className="px-5 py-6 text-center text-ink-muted text-[12px]">No machines match your filters.</p>}
        </div>
      </Card>
    </PageShell>
  )
}
