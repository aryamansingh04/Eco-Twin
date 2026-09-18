import { useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { mockReports } from '../data/mockReports'
import { Download, FileText, Loader2, Clock } from 'lucide-react'

const STATUS_TONE = { ready: 'brand', generating: 'info', scheduled: 'neutral' } as const

export function ReportsPage() {
  const [toast, setToast] = useState<string | null>(null)

  const handleDownload = (name: string) => {
    // Prototype: real version hits GET /api/reports/:id/download and
    // streams the file Django generates. For now just acknowledge the click.
    setToast(`${name} — download started (mock)`)
    setTimeout(() => setToast(null), 2200)
  }

  return (
    <PageShell title="ESG Reports" subtitle="Generated environmental and efficiency reports">
      <div className="grid grid-cols-2 gap-4">
        {mockReports.map((r) => (
          <Card key={r.id} className="p-5 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-md bg-surface flex items-center justify-center text-ink-muted shrink-0">
                <FileText size={16} />
              </div>
              <div>
                <div className="text-[13px] font-medium text-ink">{r.name}</div>
                <div className="text-[11.5px] text-ink-muted mt-0.5">{r.period} · {r.fileType}</div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                  {r.generatedAt && <span className="text-[10.5px] font-data text-ink-muted">Generated {r.generatedAt}</span>}
                </div>
              </div>
            </div>

            {r.status === 'ready' && (
              <button onClick={() => handleDownload(r.name)} className="w-8 h-8 flex items-center justify-center rounded-md border border-line text-ink-muted hover:text-ink hover:bg-surface transition-colors shrink-0">
                <Download size={14} />
              </button>
            )}
            {r.status === 'generating' && <Loader2 size={16} className="text-info animate-spin shrink-0 mt-1" />}
            {r.status === 'scheduled' && <Clock size={16} className="text-ink-muted shrink-0 mt-1" />}
          </Card>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-panel text-panel-ink text-[12.5px] px-4 py-2.5 rounded-md shadow-lg">
          {toast}
        </div>
      )}
    </PageShell>
  )
}
