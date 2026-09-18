import type { ReactNode } from 'react'
import clsx from 'clsx'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-surface-raised border border-line rounded-lg', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-line">
      <div>
        <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
        {subtitle && <p className="text-[11px] text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {actions}
    </div>
  )
}
