import { Card, CardHeader } from '../ui/Card'
import { useFactoryData } from '../../hooks/useFactoryData'
import { machineHealthScore } from '../../utils/calculations'

export function FactoryHealth() {
  const { machines } = useFactoryData()
  const avg = machines.length ? Math.round(machines.reduce((s, m) => s + machineHealthScore(m), 0) / machines.length) : 100
  const circumference = 2 * Math.PI * 42

  return (
    <Card>
      <CardHeader title="Factory Health" subtitle="Prototype sustainability score — not an ESG certification" />
      <div className="p-5 flex items-center gap-6">
        <svg width="96" height="96" viewBox="0 0 96 96" className="shrink-0">
          <circle cx="48" cy="48" r="42" fill="none" stroke="#E1E4E1" strokeWidth="8" />
          <circle
            cx="48" cy="48" r="42" fill="none" stroke="#3E7C59" strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - avg / 100)}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
          />
          <text x="48" y="53" textAnchor="middle" className="font-data" fontSize="20" fontWeight={600} fill="#14191C">
            {avg}
          </text>
        </svg>
        <div className="text-[12px] text-ink-muted leading-relaxed">
          Calculated from status and utilization across all {machines.length} machines.
          This is a <span className="text-ink font-medium">prototype metric</span>, not a certified ESG score.
        </div>
      </div>
    </Card>
  )
}
