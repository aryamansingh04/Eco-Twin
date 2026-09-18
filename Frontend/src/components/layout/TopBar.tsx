import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

interface TopBarProps {
  title: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="h-16 shrink-0 border-b border-line bg-surface-raised flex items-center justify-between px-6 relative">
      <div>
        <h1 className="text-[15px] font-semibold text-ink">{title}</h1>
        {subtitle && <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>}
      </div>

      <div className="relative">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface transition-colors">
          <div className="w-7 h-7 rounded-full bg-info-soft text-info flex items-center justify-center">
            <User size={14} />
          </div>
          <div className="text-left leading-tight">
            <div className="text-xs font-medium text-ink">{user?.name ?? 'Admin'}</div>
            <div className="text-[11px] text-ink-muted">{user?.company ?? 'Plant Manager'}</div>
          </div>
          <ChevronDown size={14} className="text-ink-muted" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-surface-raised border border-line rounded-md shadow-lg py-1 z-20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12.5px] text-ink hover:bg-surface transition-colors"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
