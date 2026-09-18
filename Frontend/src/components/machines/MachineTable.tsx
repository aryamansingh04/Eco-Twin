import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { StatusDot } from './StatusDot'
import { useFactoryData } from '../../hooks/useFactoryData'
import { useLiveStatusMap } from '../../hooks/useLiveStatus'
import { machineDailyEnergyKwh, machineDailyCarbonKg, machineHealthScore } from '../../utils/calculations'
import { MACHINE_TYPES, type MachineStatus, type MachineType } from '../../types'

export function MachineTable() {
  const navigate = useNavigate()
  const { machines, emissionFactor } = useFactoryData()
  const statusMap = useLiveStatusMap()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<MachineStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<MachineType | 'all'>('all')

  const filtered = useMemo(() => {
    return machines.filter((m) => {
      const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase()) || m.id.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = statusFilter === 'all' || statusMap.get(m.id) === statusFilter
      const matchesType = typeFilter === 'all' || m.type === typeFilter
      return matchesQuery && matchesStatus && matchesType
    })
  }, [machines, query, statusFilter, typeFilter])

  return (
    <div className="bg-surface-raised border border-line rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search machines..."
            className="w-full pl-8 pr-3 py-1.5 text-[12.5px] bg-surface border border-line rounded-md focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as MachineStatus | 'all')} className="text-[12px] border border-line rounded-md px-2 py-1.5 bg-surface">
          <option value="all">All statuses</option>
          <option value="running">Running</option>
          <option value="idle">Idle</option>
          <option value="offline">Offline</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as MachineType | 'all')} className="text-[12px] border border-line rounded-md px-2 py-1.5 bg-surface">
          <option value="all">All types</option>
          {MACHINE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="ml-auto text-[11px] text-ink-muted">{filtered.length} machines</span>
      </div>

      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="text-left text-ink-muted border-b border-line">
            {['Machine', 'Type', 'Status', 'Power', 'Utilization', 'Daily Energy', 'Carbon', 'Health'].map((h) => (
              <th key={h} className="px-4 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((m) => (
            <tr
              key={m.id}
              onClick={() => navigate(`/machines/${m.id}`)}
              className="border-b border-line last:border-0 hover:bg-surface cursor-pointer transition-colors"
            >
              <td className="px-4 py-2.5">
                <div className="text-ink font-medium">{m.name}</div>
                <div className="font-data text-[10.5px] text-ink-muted">{m.id}</div>
              </td>
              <td className="px-4 py-2.5 text-ink-muted">{m.type}</td>
              <td className="px-4 py-2.5"><StatusDot status={statusMap.get(m.id) ?? 'offline'} /></td>
              <td className="px-4 py-2.5 font-data text-ink-muted">{m.powerKw} kW</td>
              <td className="px-4 py-2.5 font-data text-ink-muted">{Math.round(m.utilization * 100)}%</td>
              <td className="px-4 py-2.5 font-data text-ink-muted">{machineDailyEnergyKwh(m)} kWh</td>
              <td className="px-4 py-2.5 font-data text-ink-muted">{machineDailyCarbonKg(m, emissionFactor)} kg</td>
              <td className="px-4 py-2.5 font-data text-ink-muted">{machineHealthScore(m)}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={8} className="px-4 py-8 text-center text-ink-muted">No machines match your filters.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
