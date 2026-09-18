import clsx from 'clsx'
import type { MachineStatus } from '../../types'

const COLOR: Record<MachineStatus, string> = {
  running: 'bg-brand',
  idle: 'bg-info',
  offline: 'bg-ink-muted',
}

export function StatusDot({ status }: { status: MachineStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={clsx('w-1.5 h-1.5 rounded-full', COLOR[status])} />
      <span className="text-[11px] capitalize text-ink-muted">{status}</span>
    </span>
  )
}
