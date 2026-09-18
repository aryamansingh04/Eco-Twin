import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardHeader } from '../ui/Card'
import { useFactoryData } from '../../hooks/useFactoryData'
import { machineDailyCarbonKg } from '../../utils/calculations'
import type { Machine } from '../../types'

const COLORS = ['#3E7C59', '#5B7A8C', '#C97A3D', '#8B979C']

// Machine type -> carbon-source bucket, derived (not hardcoded) so the
// breakdown always reflects the current fleet.
function sourceFor(type: Machine['type']): 'Machinery' | 'HVAC' | 'Material Handling' {
  if (type === 'HVAC') return 'HVAC'
  if (type === 'Conveyor') return 'Material Handling'
  return 'Machinery'
}

export function CarbonBreakdown() {
  const { machines, emissionFactor } = useFactoryData()

  const buckets = new Map<string, number>([['Machinery', 0], ['HVAC', 0], ['Material Handling', 0]])
  for (const m of machines) {
    const key = sourceFor(m.type)
    buckets.set(key, (buckets.get(key) ?? 0) + machineDailyCarbonKg(m, emissionFactor))
  }
  const data = Array.from(buckets.entries())
    .map(([source, kg]) => ({ source, kg: Math.round(kg) }))
    .filter((d) => d.kg > 0)
  const total = data.reduce((s, d) => s + d.kg, 0) || 1

  return (
    <Card>
      <CardHeader title="Carbon Breakdown" subtitle="Estimated daily emissions by source, derived from current machines" />
      <div className="p-5 flex items-center gap-6">
        <div className="w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="kg" nameKey="source" innerRadius={38} outerRadius={58} paddingAngle={2}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip formatter={(v: any) => [`${Number(v)} kg CO₂e`, '']} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2.5">
          {data.map((s, i) => (
            <div key={s.source} className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-ink">{s.source}</span>
              </div>
              <div className="font-data text-ink-muted">
                {s.kg} kg <span className="text-ink-muted">({Math.round((s.kg / total) * 100)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
