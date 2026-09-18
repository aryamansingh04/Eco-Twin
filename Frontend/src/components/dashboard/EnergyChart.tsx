import { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader } from '../ui/Card'
import { getEnergySeries } from '../../data/mockEnergy'
import { useFactoryData } from '../../hooks/useFactoryData'
import { totalEnergyKwh } from '../../utils/calculations'
import clsx from 'clsx'

type Range = '24h' | '7d' | '30d' | '12m'
const RANGES: { key: Range; label: string }[] = [
  { key: '24h', label: '24 Hours' },
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: '12m', label: '12 Months' },
]

export function EnergyChart() {
  const [range, setRange] = useState<Range>('7d')
  const { machines } = useFactoryData()
  // The trend shape is illustrative, but the most recent point always
  // equals the real canonical total so this never contradicts the KPI
  // cards above it.
  const todayKwh = totalEnergyKwh(machines)
  const data = useMemo(() => getEnergySeries(range, todayKwh), [range, todayKwh])

  return (
    <Card>
      <CardHeader
        title="Energy Consumption"
        subtitle="Today's value is live; the trend shape is illustrative"
        actions={
          <div className="flex gap-1 bg-surface rounded-md p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={clsx(
                  'px-2.5 py-1 text-[11px] rounded transition-colors',
                  range === r.key ? 'bg-surface-raised text-ink shadow-sm border border-line' : 'text-ink-muted hover:text-ink'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />
      <div className="px-2 pt-4 pb-2 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3E7C59" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#3E7C59" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E1" vertical={false} />
            <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: '#5B6870' }} axisLine={{ stroke: '#E1E4E1' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#5B6870' }} axisLine={false} tickLine={false} width={44} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #E1E4E1' }}
              formatter={(value: any) => [`${Number(value).toLocaleString()} kWh`, 'Consumption']}
            />
            <Area type="monotone" dataKey="consumptionKwh" stroke="#3E7C59" strokeWidth={2} fill="url(#energyFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
