import { useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { useSettingsStore } from '../store/useSettingsStore'
import { useFactoryStore } from '../store/useFactoryStore'

const INPUT = 'w-full px-3 py-1.5 text-[12.5px] bg-surface border border-line rounded-md focus:outline-none focus:ring-1 focus:ring-brand max-w-xs'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-9 h-5 rounded-full transition-colors relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${checked ? 'bg-brand' : 'bg-line'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

// A single settings row: label (+ optional description) on the left,
// control on the right. Every section is one continuous list of these
// rows rather than a grid of separate boxed cards.
function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-3.5">
      <div className="min-w-0">
        <div className="text-[12.5px] text-ink font-medium">{label}</div>
        {description && <div className="text-[11px] text-ink-muted mt-0.5">{description}</div>}
      </div>
      {children}
    </div>
  )
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-2">
        <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
        {subtitle && <p className="text-[11.5px] text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="bg-surface-raised border border-line rounded-lg divide-y divide-line">{children}</div>
    </div>
  )
}

export function SettingsPage() {
  const account = useSettingsStore((s) => s.account)
  const updateAccount = useSettingsStore((s) => s.updateAccount)
  const editor = useSettingsStore((s) => s.editor)
  const updateEditor = useSettingsStore((s) => s.updateEditor)
  const analytics = useSettingsStore((s) => s.analytics)
  const updateAnalytics = useSettingsStore((s) => s.updateAnalytics)
  const notifications = useSettingsStore((s) => s.notifications)
  const updateNotifications = useSettingsStore((s) => s.updateNotifications)
  const appearance = useSettingsStore((s) => s.appearance)
  const updateAppearance = useSettingsStore((s) => s.updateAppearance)
  const dashboard = useSettingsStore((s) => s.dashboard)
  const updateDashboard = useSettingsStore((s) => s.updateDashboard)
  const factory = useFactoryStore((s) => s.factory)
  const updateFactory = useFactoryStore((s) => s.updateFactory)
  const machines = useFactoryStore((s) => s.machines)

  const [savedFlash, setSavedFlash] = useState<string | null>(null)
  const flash = (label: string) => {
    setSavedFlash(label)
    setTimeout(() => setSavedFlash(null), 1400)
  }

  const density = factory && factory.areaSqm > 0 ? (machines.length / (factory.areaSqm / 1000)).toFixed(2) : '0'

  return (
    <PageShell title="Settings" subtitle="Account, factory, editor, analytics, notifications, appearance, and security">
      <div className="max-w-2xl">
        <Section title="Account">
          <Row label="Name"><input className={INPUT} value={account.name} onChange={(e) => updateAccount({ name: e.target.value })} /></Row>
          <Row label="Email"><input className={INPUT} value={account.email} onChange={(e) => updateAccount({ email: e.target.value })} /></Row>
          <Row label="Company"><input className={INPUT} value={account.company} onChange={(e) => updateAccount({ company: e.target.value })} /></Row>
          <Row label="Role"><input className={INPUT} value={account.role} onChange={(e) => updateAccount({ role: e.target.value })} /></Row>
        </Section>

        <Section title="Factory" subtitle="Editing here updates the factory used across the whole app">
          <Row label="Factory Name"><input className={INPUT} value={factory?.name ?? ''} onChange={(e) => updateFactory({ name: e.target.value })} /></Row>
          <Row label="Site"><input className={INPUT} value={factory?.site ?? ''} onChange={(e) => updateFactory({ site: e.target.value })} /></Row>
          <Row label="Area (m²)"><input type="number" min={0} className={INPUT} value={factory?.areaSqm ?? 0} onChange={(e) => updateFactory({ areaSqm: Number(e.target.value) })} /></Row>
          <Row label="Unit System">
            <select className={INPUT} value="metric" onChange={() => {}}>
              <option value="metric">Metric</option>
            </select>
          </Row>
          <Row label="Machines placed" description="Live count from the current factory layout">
            <span className="font-data text-[12.5px] text-ink">{machines.length}</span>
          </Row>
          <Row label="Machine density" description="Machines per 1,000 m² of factory area">
            <span className="font-data text-[12.5px] text-ink">{density}</span>
          </Row>
        </Section>

        <Section title="Editor" subtitle="Affects the Factory Editor immediately">
          <Row label="Grid Enabled"><Toggle checked={editor.gridEnabled} onChange={(v) => updateEditor({ gridEnabled: v })} /></Row>
          <Row label="Snap to Grid"><Toggle checked={editor.snapToGrid} onChange={(v) => updateEditor({ snapToGrid: v })} /></Row>
          <Row label="Grid Size">
            <select className={INPUT} value={editor.gridSize} onChange={(e) => updateEditor({ gridSize: Number(e.target.value) })}>
              {[0.5, 1, 2, 5].map((g) => <option key={g} value={g}>{g} m</option>)}
            </select>
          </Row>
          <Row label="Show Coordinates"><Toggle checked={editor.showCoordinates} onChange={(v) => updateEditor({ showCoordinates: v })} /></Row>
          <Row label="Show Connection Labels"><Toggle checked={editor.showConnectionLabels} onChange={(v) => updateEditor({ showConnectionLabels: v })} /></Row>
          <Row label="Show Machine Labels"><Toggle checked={editor.showMachineLabels} onChange={(v) => updateEditor({ showMachineLabels: v })} /></Row>
        </Section>

        <Section title="Analytics" subtitle="Emission factor changes recalculate every carbon figure immediately">
          <Row label="Emission Factor (kg CO₂e/kWh)">
            <input type="number" step={0.01} min={0} className={INPUT} value={analytics.emissionFactor} onChange={(e) => updateAnalytics({ emissionFactor: Number(e.target.value) })} />
          </Row>
          <Row label="Carbon Unit">
            <select className={INPUT} value={analytics.carbonUnit} onChange={(e) => updateAnalytics({ carbonUnit: e.target.value as 'kg' | 't' })}>
              <option value="kg">kg CO₂e</option>
              <option value="t">t CO₂e</option>
            </select>
          </Row>
          <Row label="Currency">
            <select className={INPUT} value={analytics.currency} onChange={(e) => updateAnalytics({ currency: e.target.value as 'INR' | 'USD' | 'EUR' })}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </Row>
          <Row label="Reporting Period">
            <select className={INPUT} value={analytics.reportingPeriod} onChange={(e) => updateAnalytics({ reportingPeriod: e.target.value as '7d' | '30d' | '12m' })}>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="12m">12 Months</option>
            </select>
          </Row>
        </Section>

        <Section title="Units">
          <Row label="Energy Unit">
            <select className={INPUT} value={analytics.energyUnit} onChange={(e) => updateAnalytics({ energyUnit: e.target.value as 'kWh' | 'MWh' })}>
              <option value="kWh">kWh</option>
              <option value="MWh">MWh</option>
            </select>
          </Row>
          <Row label="Distance Unit">
            <select className={INPUT} value={analytics.distanceUnit} onChange={(e) => updateAnalytics({ distanceUnit: e.target.value as 'm' | 'ft' })}>
              <option value="m">Meters</option>
              <option value="ft">Feet</option>
            </select>
          </Row>
          <Row label="Temperature Unit">
            <select className={INPUT} value={analytics.temperatureUnit} onChange={(e) => updateAnalytics({ temperatureUnit: e.target.value as 'C' | 'F' })}>
              <option value="C">Celsius (°C)</option>
              <option value="F">Fahrenheit (°F)</option>
            </select>
          </Row>
        </Section>

        <Section title="Dashboard">
          <Row label="Refresh Interval" description="How often live machine status is re-polled">
            <select className={INPUT} value={dashboard.refreshIntervalSec} onChange={(e) => updateDashboard({ refreshIntervalSec: Number(e.target.value) })}>
              {[5, 15, 30, 60].map((s) => <option key={s} value={s}>{s}s</option>)}
            </select>
          </Row>
          <Row label="Default View">
            <select className={INPUT} value={dashboard.defaultView} onChange={(e) => updateDashboard({ defaultView: e.target.value as typeof dashboard.defaultView })}>
              <option value="overview">Overview</option>
              <option value="energy">Energy</option>
              <option value="carbon">Carbon</option>
              <option value="machines">Machines</option>
            </select>
          </Row>
        </Section>

        <Section title="Notifications">
          <Row label="Energy Alerts"><Toggle checked={notifications.energyAlerts} onChange={(v) => updateNotifications({ energyAlerts: v })} /></Row>
          <Row label="Carbon Alerts"><Toggle checked={notifications.carbonAlerts} onChange={(v) => updateNotifications({ carbonAlerts: v })} /></Row>
          <Row label="Machine Alerts"><Toggle checked={notifications.machineAlerts} onChange={(v) => updateNotifications({ machineAlerts: v })} /></Row>
          <Row label="Prediction Alerts"><Toggle checked={notifications.predictionAlerts} onChange={(v) => updateNotifications({ predictionAlerts: v })} /></Row>
          <Row label="Weekly Sustainability Summary"><Toggle checked={notifications.weeklySummary} onChange={(v) => updateNotifications({ weeklySummary: v })} /></Row>
        </Section>

        <Section title="Appearance">
          <Row label="Theme">
            <select className={INPUT} value={appearance.theme} onChange={(e) => updateAppearance({ theme: e.target.value as 'light' | 'dark' })}>
              <option value="light">Light</option>
              <option value="dark">Dark (not yet implemented)</option>
            </select>
          </Row>
          <Row label="Density">
            <select className={INPUT} value={appearance.density} onChange={(e) => updateAppearance({ density: e.target.value as 'comfortable' | 'compact' })}>
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </Row>
          <Row label="Animations"><Toggle checked={appearance.animations} onChange={(v) => updateAppearance({ animations: v })} /></Row>
        </Section>

        <Section title="Security" subtitle="Prototype placeholders — no real backend yet">
          <Row label="Change Password">
            <button onClick={() => flash('Password')} className="px-3 py-1.5 text-[11.5px] border border-line rounded-md text-ink-muted hover:bg-surface transition-colors">Change</button>
          </Row>
          <Row label="Active Sessions">
            <button onClick={() => flash('Sessions')} className="px-3 py-1.5 text-[11.5px] border border-line rounded-md text-ink-muted hover:bg-surface transition-colors">View</button>
          </Row>
          <Row label="Two-Factor Authentication">
            <button onClick={() => flash('2FA')} className="px-3 py-1.5 text-[11.5px] border border-line rounded-md text-ink-muted hover:bg-surface transition-colors">Set Up</button>
          </Row>
        </Section>
      </div>

      {savedFlash && (
        <div className="fixed bottom-6 right-6 bg-panel text-panel-ink text-[12.5px] px-4 py-2.5 rounded-md shadow-lg">
          {savedFlash} — not available in this prototype
        </div>
      )}
    </PageShell>
  )
}
