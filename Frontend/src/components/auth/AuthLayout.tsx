import { Link } from 'react-router-dom'

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="text-[16px] font-semibold text-ink tracking-tight">EcoTwin</Link>
          <h1 className="text-[19px] font-semibold text-ink mt-4">{title}</h1>
          <p className="text-[12.5px] text-ink-muted mt-1.5">{subtitle}</p>
        </div>
        <div className="bg-surface-raised border border-line rounded-lg p-6">{children}</div>
      </div>
    </div>
  )
}
