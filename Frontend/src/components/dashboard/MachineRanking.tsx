import { Card, CardHeader } from '../ui/Card'
import { Link } from 'react-router-dom'
import { useFactoryData } from '../../hooks/useFactoryData'
import { machineDailyEnergyKwh } from '../../utils/calculations'

export function MachineRanking() {
  const { machines } = useFactoryData()
  const ranked = [...machines]
    .map((m) => ({ machine: m, energy: machineDailyEnergyKwh(m) }))
    .sort((a, b) => b.energy - a.energy)
    .slice(0, 5)
  const max = ranked[0]?.energy ?? 1

  return (
    <Card>
      <CardHeader title="Machine Energy Ranking" subtitle="Highest daily consumers, calculated live" />
      <div className="p-5 space-y-3">
        {ranked.map(({ machine: m, energy }) => (
          <Link key={m.id} to={`/machines/${m.id}`} className="block group">
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="text-ink group-hover:text-brand transition-colors">{m.name}</span>
              <span className="font-data text-ink-muted">{energy} kWh/day</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface overflow-hidden">
              <div className="h-full rounded-full bg-info group-hover:bg-brand transition-colors" style={{ width: `${(energy / max) * 100}%` }} />
            </div>
          </Link>
        ))}
        {ranked.length === 0 && <p className="text-[12px] text-ink-muted text-center py-4">No machines yet — add some in the Factory Editor.</p>}
      </div>
    </Card>
  )
}
