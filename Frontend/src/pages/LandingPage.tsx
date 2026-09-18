import { Link } from 'react-router-dom'
import { Factory, Zap, Cloud, GitBranch, TrendingUp, FileCheck, Lightbulb, ArrowRight } from 'lucide-react'

const SECTIONS = [
  { icon: Factory, title: 'Digital Factory Modeling', copy: 'Build a 3D representation of your factory floor — place machines, wire up material flow, and define zones that mirror the real plant.' },
  { icon: Zap, title: 'Energy Intelligence', copy: 'See consumption by machine, zone, and type, calculated transparently from power rating, operating hours, and utilization.' },
  { icon: Cloud, title: 'Carbon Intelligence', copy: 'Emissions estimated directly from metered energy and a configurable emission factor — not a black box.' },
  { icon: TrendingUp, title: 'Predictive Analytics', copy: 'A forecasting layer built to plug into a real ML pipeline for next-week energy demand.' },
  { icon: FileCheck, title: 'ESG Reporting', copy: 'Generate structured environmental and efficiency reports ready for internal or external review.' },
  { icon: Lightbulb, title: 'Recommendations', copy: 'Engineering-grade insights on layout, utilization, and maintenance — not generic AI platitudes.' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-surface-raised">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-[16px] font-semibold text-ink tracking-tight">EcoTwin</div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-[13px] text-ink-muted hover:text-ink transition-colors px-3 py-1.5">Sign In</Link>
            <Link to="/signup" className="text-[13px] font-medium text-white bg-panel rounded-md px-4 py-1.5 hover:bg-panel-raised transition-colors">Get Started</Link>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-brand bg-brand-soft px-3 py-1 rounded-full mb-6">
          <GitBranch size={12} /> Digital Twin Platform for Industry
        </div>
        <h1 className="text-[40px] leading-[1.1] font-semibold text-ink tracking-tight mb-5">
          Digital Twin Intelligence<br />for Sustainable Industry
        </h1>
        <p className="text-[15px] text-ink-muted max-w-2xl mx-auto leading-relaxed mb-8">
          EcoTwin helps industrial organizations understand factory energy consumption, carbon emissions,
          material flow, and factory layouts — and surfaces concrete sustainability opportunities backed by
          future energy consumption forecasts.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/signup" className="flex items-center gap-2 text-[13.5px] font-medium text-white bg-brand rounded-md px-5 py-2.5 hover:bg-brand/90 transition-colors">
            Get Started <ArrowRight size={15} />
          </Link>
          <Link to="/login" className="text-[13.5px] font-medium text-ink border border-line rounded-md px-5 py-2.5 hover:bg-surface-raised transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="border border-line rounded-lg bg-surface-raised p-2">
          <div className="h-80 rounded-md bg-panel flex items-center justify-center text-panel-ink-muted text-[12px]">
            Factory Editor preview — 3D layout, live in the app
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-muted text-center mb-10">How EcoTwin Works</h2>
        <div className="grid grid-cols-3 gap-6">
          {SECTIONS.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="p-5 border border-line rounded-lg bg-surface-raised">
              <div className="w-9 h-9 rounded-md bg-brand-soft text-brand flex items-center justify-center mb-3">
                <Icon size={17} />
              </div>
              <h3 className="text-[13.5px] font-semibold text-ink mb-1.5">{title}</h3>
              <p className="text-[12.5px] text-ink-muted leading-relaxed">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-line py-8">
        <div className="max-w-6xl mx-auto px-6 text-[11.5px] text-ink-muted flex items-center justify-between">
          <span>EcoTwin — Prototype build</span>
          <span>© 2026 EcoTwin. All figures illustrative.</span>
        </div>
      </footer>
    </div>
  )
}
