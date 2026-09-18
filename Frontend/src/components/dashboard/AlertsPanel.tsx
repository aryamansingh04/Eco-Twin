import { Card, CardHeader } from '../ui/Card'
import { AlertTriangle, AlertOctagon } from 'lucide-react'
import { useTelemetryStore } from '../../store/useTelemetryStore'
import { useFactoryData } from '../../hooks/useFactoryData'

interface Alert {
  id: string
  machineId: string
  machineName: string
  severity: 'critical' | 'warning'
  message: string
}

// Simple rule-based alerts derived live from telemetry + machine config —
// not a prediction model. Rules: offline (critical), high utilization
// (warning), and live power noticeably above the machine's configured
// baseline power (warning) — a cheap proxy for "consuming above baseline".
function buildAlerts(entries: { machineId: string; machineName: string; operatingState: boolean; utilization: number; powerKw: number }[], machines: { id: string; powerKw: number }[]): Alert[] {
  const alerts: Alert[] = []
  for (const e of entries) {
    if (!e.operatingState) {
      alerts.push({ id: `${e.machineId}-offline`, machineId: e.machineId, machineName: e.machineName, severity: 'critical', message: 'Machine offline' })
      continue
    }
    if (e.utilization > 0.9) {
      alerts.push({ id: `${e.machineId}-util`, machineId: e.machineId, machineName: e.machineName, severity: 'warning', message: 'High utilization' })
    }
    const config = machines.find((m) => m.id === e.machineId)
    if (config && e.powerKw > config.powerKw * 1.15) {
      alerts.push({ id: `${e.machineId}-power`, machineId: e.machineId, machineName: e.machineName, severity: 'warning', message: 'Energy consumption above baseline' })
    }
  }
  return alerts.slice(0, 6)
}

export function AlertsPanel() {
  const summary = useTelemetryStore((s) => s.summary)
  const { machines } = useFactoryData()
  const alerts = summary ? buildAlerts(summary.entries, machines) : []

  return (
    <Card>
      <CardHeader title="Recent Alerts" subtitle="Rule-based, derived from live telemetry" />
      <div className="divide-y divide-line">
        {alerts.map((a) => {
          const Icon = a.severity === 'critical' ? AlertOctagon : AlertTriangle
          return (
            <div key={a.id} className="px-5 py-3 flex items-start gap-3">
              <Icon size={15} className={`mt-0.5 shrink-0 ${a.severity === 'critical' ? 'text-danger' : 'text-warn'}`} />
              <div className="text-[12.5px] text-ink">
                <span className="font-medium">{a.machineName}</span>
                <span className="text-ink-muted"> — {a.message}</span>
              </div>
            </div>
          )
        })}
        {alerts.length === 0 && <p className="px-5 py-6 text-center text-[12px] text-ink-muted">No active alerts.</p>}
      </div>
    </Card>
  )
}
