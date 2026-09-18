import { useState } from 'react'
import { Loader2, Zap, Cloud } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { Card, CardHeader } from '../components/ui/Card'
import { useFactoryData } from '../hooks/useFactoryData'
import * as productionApi from '../services/productionApi'
import type { ProductionPlanResult } from '../types/production'

const INPUT = 'w-full px-3 py-2 text-[12.5px] bg-surface border border-line rounded-md focus:outline-none focus:ring-1 focus:ring-brand'
const LABEL = 'block text-[11.5px] font-medium text-ink-muted mb-1.5'

// UI-only Production Planner. generatePlan() is a mock heuristic, clearly
// documented as such (services/productionApi.ts) — this page exists so
// the interaction model and data shape are ready for a real optimizer.
export function ProductionPlannerPage() {
  const { machines, emissionFactor } = useFactoryData()
  const [productName, setProductName] = useState('Product X')
  const [quantity, setQuantity] = useState(1000)
  const [deadline, setDeadline] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProductionPlanResult | null>(null)

  const toggleMachine = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleGenerate = async () => {
    if (selectedIds.length === 0) return
    setLoading(true)
    const plan = await productionApi.generatePlan(
      { productName, requiredQuantity: quantity, deadlineIso: deadline || new Date().toISOString(), machineIds: selectedIds },
      machines,
      emissionFactor
    )
    setResult(plan)
    setLoading(false)
  }

  return (
    <PageShell title="Production Planner" subtitle="Plan a production run across available machines — mock allocation, not a real optimizer yet">
      <div className="grid grid-cols-3 gap-5">
        <Card className="col-span-1">
          <CardHeader title="Plan Request" />
          <div className="p-5 space-y-4">
            <div>
              <label className={LABEL}>Product</label>
              <input className={INPUT} value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Required Quantity</label>
              <input type="number" min={1} className={INPUT} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </div>
            <div>
              <label className={LABEL}>Deadline</label>
              <input type="datetime-local" className={INPUT} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Available Machines</label>
              <div className="border border-line rounded-md divide-y divide-line max-h-64 overflow-y-auto">
                {machines.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 px-3 py-2 text-[12px] text-ink cursor-pointer hover:bg-surface">
                    <input type="checkbox" className="accent-brand" checked={selectedIds.includes(m.id)} onChange={() => toggleMachine(m.id)} />
                    {m.name}
                    <span className="text-ink-muted font-data text-[10.5px] ml-auto">
                      {m.productionRate > 0 ? `${m.productionRate} ${m.productionUnit}` : 'no production rate'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={selectedIds.length === 0 || loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-[13px] font-medium text-white bg-brand hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />} Generate Plan
            </button>
          </div>
        </Card>

        <Card className="col-span-2">
          <CardHeader title="Recommended Allocation" subtitle={result ? result.objective : 'Fill in the request and generate a plan'} />
          {!result ? (
            <div className="p-10 text-center text-[12.5px] text-ink-muted">No plan generated yet.</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 px-5 pt-5">
                <div className="bg-surface rounded-md px-4 py-3">
                  <div className="flex items-center gap-1.5 text-ink-muted text-[10.5px] uppercase tracking-wide"><Zap size={12} /> Estimated Energy</div>
                  <div className="font-data text-[18px] font-semibold text-ink mt-1">{result.estimatedTotalEnergyKwh.toLocaleString()} kWh</div>
                </div>
                <div className="bg-surface rounded-md px-4 py-3">
                  <div className="flex items-center gap-1.5 text-ink-muted text-[10.5px] uppercase tracking-wide"><Cloud size={12} /> Estimated Carbon</div>
                  <div className="font-data text-[18px] font-semibold text-ink mt-1">{result.estimatedTotalCarbonKg.toLocaleString()} kg CO₂e</div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {result.allocations.map((a) => (
                  <div key={a.machineId} className="border border-line rounded-md p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12.5px] font-medium text-ink">{a.machineName}</span>
                      <span className="font-data text-[11px] text-ink-muted">{a.utilizationPct}% util · {a.estimatedHours}h</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${a.utilizationPct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </PageShell>
  )
}
