import { Card, CardHeader } from '../ui/Card'
import { useTelemetryStore } from '../../store/useTelemetryStore'
import { Circle } from 'lucide-react'

// Live machine status, sourced entirely from useTelemetryStore (which
// polls machineStatusApi — the mock stand-in for GET /api/machine-status/).
// Nothing here reads Machine config for status; that field doesn't exist.
export function MachineStatusPanel() {
  const summary = useTelemetryStore((s) => s.summary)
  const lastUpdated = useTelemetryStore((s) => s.lastUpdated)

  if (!summary) {
    return (
      <Card>
        <CardHeader title="Machine Status" subtitle="Connecting to live telemetry…" />
        <div className="p-5 text-[12px] text-ink-muted">Loading…</div>
      </Card>
    )
  }

  const offlineMachines = summary.entries.filter((e) => !e.operatingState)

  return (
    <Card>
      <CardHeader
        title="Machine Status"
        subtitle={lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : 'Live'}
      />
      <div className="p-5">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="font-data text-[20px] font-semibold text-ink">{summary.total}</div>
            <div className="text-[10.5px] text-ink-muted uppercase tracking-wide mt-0.5">Total</div>
          </div>
          <div className="text-center">
            <div className="font-data text-[20px] font-semibold text-brand">{summary.running}</div>
            <div className="text-[10.5px] text-ink-muted uppercase tracking-wide mt-0.5">Running</div>
          </div>
          <div className="text-center">
            <div className="font-data text-[20px] font-semibold text-danger">{summary.offline}</div>
            <div className="text-[10.5px] text-ink-muted uppercase tracking-wide mt-0.5">Offline</div>
          </div>
        </div>

        {offlineMachines.length > 0 ? (
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-muted mb-2">Offline Machines</div>
            <div className="space-y-1.5">
              {offlineMachines.map((m) => (
                <div key={m.machineId} className="flex items-center gap-2 text-[12px] text-ink">
                  <Circle size={7} className="fill-danger text-danger shrink-0" />
                  {m.machineName}
                  <span className="font-data text-[10.5px] text-ink-muted ml-auto">{m.machineId}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[12px] text-ink-muted">All machines are currently reporting as running.</p>
        )}
      </div>
    </Card>
  )
}
