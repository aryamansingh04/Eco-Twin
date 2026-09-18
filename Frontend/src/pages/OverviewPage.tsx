import { Zap, Cloud, IndianRupee, Cpu, TrendingUp, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { KPICard } from '../components/dashboard/KPICard'
import { EnergyChart } from '../components/dashboard/EnergyChart'
import { CarbonBreakdown } from '../components/dashboard/CarbonBreakdown'
import { MachineRanking } from '../components/dashboard/MachineRanking'
import { RecommendationFeed } from '../components/dashboard/RecommendationFeed'
import { FactoryHealth } from '../components/dashboard/FactoryHealth'
import { MachineStatusPanel } from '../components/dashboard/MachineStatusPanel'
import { AlertsPanel } from '../components/dashboard/AlertsPanel'
import { useFactoryData } from '../hooks/useFactoryData'
import { totalEnergyKwh, totalCarbonKg, totalDailyProductionUnits } from '../utils/calculations'
import { getEnergyForecast } from '../data/mockPredictions'
import { useTelemetryStore } from '../store/useTelemetryStore'

export function OverviewPage() {
  const { machines, emissionFactor } = useFactoryData()
  const summary = useTelemetryStore((s) => s.summary)

  const dailyEnergy = totalEnergyKwh(machines)
  const dailyCarbon = totalCarbonKg(machines, emissionFactor)
  const dailyCostInr = Math.round(dailyEnergy * 8.2)
  const dailyProduction = totalDailyProductionUnits(machines)
  const next7dKwh = getEnergyForecast(dailyEnergy).filter((p) => p.kind === 'forecast').reduce((s, p) => s + p.kwh, 0)

  return (
    <PageShell title="Overview" subtitle="Plant-wide sustainability summary — derived live from the current factory layout and telemetry">
      <div className="grid grid-cols-6 gap-4 mb-6">
        <KPICard
          label="Machines"
          value={summary ? `${summary.running} / ${summary.total}` : `— / ${machines.length}`}
          unit="running"
          icon={<Cpu size={16} />}
        />
        <KPICard
          label="Current Power Draw"
          value={summary ? summary.currentPowerKw.toLocaleString() : '—'}
          unit="kW (live)"
          icon={<Zap size={16} />}
        />
        <KPICard label="Today's Energy" value={dailyEnergy.toLocaleString()} unit="kWh/day" icon={<Zap size={16} />} />
        <KPICard label="Today's Carbon" value={dailyCarbon.toLocaleString()} unit="kg CO₂e/day" icon={<Cloud size={16} />} />
        <KPICard label="Production Output" value={dailyProduction.toLocaleString()} unit="units/day" icon={<Package size={16} />} />
        <KPICard label="Energy Cost" value={`₹${(dailyCostInr / 1000).toFixed(1)}K`} unit="/day" icon={<IndianRupee size={16} />} />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <div className="col-span-2"><EnergyChart /></div>
        <CarbonBreakdown />
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <MachineStatusPanel />
        <AlertsPanel />
        <FactoryHealth />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <MachineRanking />
        <RecommendationFeed />
        <Card_ForecastTeaser next7dKwh={next7dKwh} />
      </div>
    </PageShell>
  )
}

function Card_ForecastTeaser({ next7dKwh }: { next7dKwh: number }) {
  return (
    <Link to="/predictions" className="block bg-surface-raised border border-line rounded-lg p-5 hover:border-brand transition-colors">
      <div className="flex items-center gap-2 text-ink-muted mb-2">
        <TrendingUp size={15} />
        <span className="text-[13px] font-semibold text-ink">Energy Forecast</span>
      </div>
      <p className="text-[12px] text-ink-muted mb-3">Predicted consumption over the next 7 days.</p>
      <div className="font-data text-[22px] font-semibold text-ink">{(next7dKwh / 1000).toFixed(1)} <span className="text-[13px] text-ink-muted font-normal">MWh</span></div>
      <span className="text-[11.5px] text-brand mt-2 inline-block">View forecast →</span>
    </Link>
  )
}
