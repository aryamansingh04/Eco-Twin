// Persistent left navigation. Factory/site context comes from the live
// store (not hardcoded) so it reflects whatever factory the user created.
import { NavLink } from 'react-router-dom'
import {
  LayoutGrid, Factory as FactoryIcon, Cpu, Zap, Cloud,
  TrendingUp, FileText, Lightbulb, Settings, ClipboardList,
} from 'lucide-react'
import { useFactoryStore } from '../../store/useFactoryStore'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/factory', label: 'Factory', icon: FactoryIcon },
  { to: '/machines', label: 'Machines', icon: Cpu },
  { to: '/energy', label: 'Energy', icon: Zap },
  { to: '/carbon', label: 'Carbon', icon: Cloud },
  { to: '/predictions', label: 'Predictions', icon: TrendingUp },
  { to: '/reports', label: 'ESG Reports', icon: FileText },
  { to: '/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/production-planner', label: 'Production Planner', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const factory = useFactoryStore((s) => s.factory)

  return (
    <aside className="w-60 shrink-0 h-full bg-panel text-panel-ink flex flex-col border-r border-panel-line">
      <div className="px-5 py-5 border-b border-panel-line">
        <div className="text-[15px] font-semibold tracking-tight">EcoTwin</div>
        <div className="mt-2 text-xs text-panel-ink-muted leading-relaxed">
          Factory: <span className="text-panel-ink">{factory?.name ?? '—'}</span>
          <br />
          Site: <span className="text-panel-ink">{factory?.site ?? '—'}</span>
        </div>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto dark-scroll">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-2 mb-0.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
                isActive
                  ? 'bg-panel-raised text-panel-ink border-l-2 border-brand pl-[10px]'
                  : 'text-panel-ink-muted hover:bg-panel-raised hover:text-panel-ink'
              }`
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-panel-line text-[11px] text-panel-ink-muted">
        Prototype build · local persistence
      </div>
    </aside>
  )
}
