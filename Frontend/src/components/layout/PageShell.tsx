import type { ReactNode } from 'react'
import { TopBar } from './TopBar'

interface PageShellProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

// Every non-editor page is wrapped in this: consistent top bar + padded
// content area with a max width so charts/tables don't stretch absurdly
// wide on large monitors.
export function PageShell({ title, subtitle, actions, children }: PageShellProps) {
  return (
    <div className="flex-1 h-full overflow-y-auto">
      <TopBar title={title} subtitle={subtitle} />
      <div className="px-6 py-6 max-w-[1400px]">
        {actions && <div className="mb-5 flex justify-end gap-2">{actions}</div>}
        {children}
      </div>
    </div>
  )
}
