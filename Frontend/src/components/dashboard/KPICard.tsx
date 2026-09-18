import type { ReactNode } from 'react'
import { Card } from '../ui/Card'
import clsx from 'clsx'

interface KPICardProps {
  label: string
  value: string
  unit?: string
  delta?: { value: string; positive: boolean }
  icon: ReactNode
}

export function KPICard({ label, value, unit, delta, icon }: KPICardProps) {
  return (
    <Card className="px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-muted">{label}</span>
        <div className="text-ink-muted">{icon}</div>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-data text-[22px] font-semibold text-ink">{value}</span>
        {unit && <span className="font-data text-xs text-ink-muted">{unit}</span>}
      </div>
      {delta && (
        <div className={clsx('mt-1.5 text-[11px] font-data', delta.positive ? 'text-brand' : 'text-danger')}>
          {delta.positive ? '▲' : '▼'} {delta.value}
        </div>
      )}
    </Card>
  )
}
