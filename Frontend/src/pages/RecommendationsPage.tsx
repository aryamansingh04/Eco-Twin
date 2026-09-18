import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { mockRecommendations } from '../data/mockRecommendations'
import { AlertOctagon, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { RecommendationSeverity } from '../types'
import { useFactoryStore } from '../store/useFactoryStore'
import { useFactoryData } from '../hooks/useFactoryData'

const SEVERITY_META: Record<RecommendationSeverity, { icon: typeof AlertOctagon; tone: 'danger' | 'warn' | 'brand'; label: string; iconClass: string }> = {
  critical: { icon: AlertOctagon, tone: 'danger', label: 'Critical', iconClass: 'text-danger' },
  warning: { icon: AlertTriangle, tone: 'warn', label: 'Warning', iconClass: 'text-warn' },
  opportunity: { icon: CheckCircle2, tone: 'brand', label: 'Opportunity', iconClass: 'text-brand' },
}

export function RecommendationsPage() {
  const navigate = useNavigate()
  const selectMachine = useFactoryStore((s) => s.selectMachine)
  const { machines } = useFactoryData()
  const machineIds = new Set(machines.map((m) => m.id))

  const openInEditor = (machineId: string) => {
    selectMachine(machineId)
    navigate('/factory/editor')
  }

  return (
    <PageShell title="Recommendations" subtitle="Engineering insights generated from the analytics engine">
      <div className="space-y-4">
        {mockRecommendations.map((r) => {
          const meta = SEVERITY_META[r.severity]
          const Icon = meta.icon
          return (
            <Card key={r.id} className="p-5">
              <div className="flex items-start gap-3">
                <Icon size={18} className={`shrink-0 mt-0.5 ${meta.iconClass}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <h3 className="text-[13.5px] font-semibold text-ink">{r.title}</h3>
                  </div>
                  <p className="text-[12.5px] text-ink-muted leading-relaxed mb-3">{r.explanation}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {r.affectedMachines.map((m) => (
                      <span
                        key={m}
                        title={machineIds.has(m) ? undefined : 'This machine no longer exists in the current factory layout'}
                        className={`font-data text-[11px] px-2 py-0.5 border rounded ${
                          machineIds.has(m) ? 'bg-surface border-line text-ink-muted' : 'bg-surface border-line text-ink-muted/50 line-through'
                        }`}
                      >
                        {m}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <Metric label="Est. Energy Savings" value={`${r.estEnergySavingsPct}%`} />
                    <Metric label="Est. Carbon Savings" value={`${r.estCarbonSavingsPct}%`} />
                    <Metric label="Est. Annual Cost Savings" value={r.estAnnualCostSavingsInr > 0 ? `₹${(r.estAnnualCostSavingsInr / 1000).toFixed(0)}K` : '—'} />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-line">
                    <span className="text-[12px] text-ink"><span className="text-ink-muted">Recommended action: </span>{r.action}</span>
                    <button
                      onClick={() => {
                        const target = r.affectedMachines.find((m) => machineIds.has(m))
                        if (target) openInEditor(target)
                      }}
                      disabled={!r.affectedMachines.some((m) => machineIds.has(m))}
                      className="px-3 py-1.5 text-[11.5px] font-medium text-ink border border-line rounded-md hover:bg-surface transition-colors disabled:opacity-40"
                    >
                      Open in Editor
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </PageShell>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface rounded-md px-3 py-2">
      <div className="text-[10.5px] text-ink-muted">{label}</div>
      <div className="font-data text-[13px] font-semibold text-ink mt-0.5">{value}</div>
    </div>
  )
}
