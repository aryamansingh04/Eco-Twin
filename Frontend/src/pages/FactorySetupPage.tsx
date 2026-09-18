import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import * as factoryService from '../services/factoryService'
import { useFactoryStore } from '../store/useFactoryStore'
import { useAuthStore } from '../store/useAuthStore'

const INPUT = 'w-full px-3 py-2 text-[12.5px] bg-white border border-line rounded-md focus:outline-none focus:ring-1 focus:ring-brand'
const LABEL = 'block text-[11.5px] font-medium text-ink-muted mb-1.5'

// Shown once, right after signup. Creating a factory here seeds an EMPTY
// canonical factory (see factoryService.createFactory) — the user builds
// it up from scratch in the editor, which is where we route them next.
export function FactorySetupPage() {
  const navigate = useNavigate()
  const resetFactory = useFactoryStore((s) => s.resetFactory)
  const markFactorySetupComplete = useAuthStore((s) => s.markFactorySetupComplete)

  const [name, setName] = useState('')
  const [site, setSite] = useState('')
  const [area, setArea] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const factory = await factoryService.createFactory({
      name,
      site,
      areaSqm: Number(area) || 0,
      description,
    })
    resetFactory(factory)
    await markFactorySetupComplete()
    setLoading(false)
    navigate('/factory/editor')
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-[16px] font-semibold text-ink tracking-tight">EcoTwin</div>
          <h1 className="text-[19px] font-semibold text-ink mt-4">Set up your first factory</h1>
          <p className="text-[12.5px] text-ink-muted mt-1.5">You'll land in the Factory Editor next to start placing machines.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-raised border border-line rounded-lg p-6 space-y-4">
          <div>
            <label className={LABEL}>Factory Name</label>
            <input required className={INPUT} value={name} onChange={(e) => setName(e.target.value)} placeholder="VIT Manufacturing Plant" />
          </div>
          <div>
            <label className={LABEL}>Site / Location</label>
            <input required className={INPUT} value={site} onChange={(e) => setSite(e.target.value)} placeholder="Chennai Plant 01" />
          </div>
          <div>
            <label className={LABEL}>Factory Area (m²)</label>
            <input required type="number" min={0} className={INPUT} value={area} onChange={(e) => setArea(e.target.value)} placeholder="8400" />
          </div>
          <div>
            <label className={LABEL}>Description (optional)</label>
            <textarea rows={3} className={INPUT} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Automotive components manufacturing" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-[13px] font-medium text-white bg-brand hover:bg-brand/90 transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />} Create Factory
          </button>
        </form>
      </div>
    </div>
  )
}
