import { useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Card, CardHeader } from '../components/ui/Card'
import { MiniPreview3D } from '../components/factory/MiniPreview3D'
import { useFactoryData } from '../hooks/useFactoryData'
import { totalEnergyKwh, totalCarbonKg, machinesByZone } from '../utils/calculations'

export function FactoryPage() {
  const navigate = useNavigate()
  const { factory, machines, zones, emissionFactor } = useFactoryData()
  const totalEnergy = totalEnergyKwh(machines)
  const totalCarbon = totalCarbonKg(machines, emissionFactor)
  const zoneStats = machinesByZone(machines, zones)

  return (
    <PageShell title="Factory" subtitle={factory?.name ?? 'Loading…'}>
      <div className="grid grid-cols-3 gap-5">
        <Card className="col-span-2">
          <CardHeader
            title="Layout Preview"
            subtitle="Read-only 3D preview — open the editor to make changes"
            actions={
              <button
                onClick={() => navigate('/factory/editor')}
                className="px-3 py-1.5 text-[12px] font-medium text-white bg-panel rounded-md hover:bg-panel-raised transition-colors"
              >
                Open Factory Editor
              </button>
            }
          />
          <div className="h-96">
            <MiniPreview3D />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Factory Details" />
            <div className="p-5 space-y-3 text-[12.5px]">
              <Row label="Name" value={factory?.name ?? '—'} />
              <Row label="Site" value={factory?.site ?? '—'} />
              <Row label="Area" value={factory ? `${factory.areaSqm.toLocaleString()} m²` : '—'} />
              <Row label="Machines" value={`${machines.length}`} />
              <Row label="Zones" value={`${zones.length}`} />
              <Row label="Total Energy" value={`${totalEnergy.toLocaleString()} kWh/day`} />
              <Row label="Total Emissions" value={`${totalCarbon.toLocaleString()} kg CO₂e/day`} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Zones" />
            <div className="p-5 space-y-2.5">
              {zoneStats.map((z) => {
                const zone = zones.find((zz) => zz.id === z.zoneId)
                return (
                  <div key={z.zoneId} className="flex items-center gap-2 text-[12.5px]">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: zone?.color }} />
                    <span className="text-ink">{z.zoneName}</span>
                    <span className="ml-auto font-data text-ink-muted">{z.count} machines</span>
                  </div>
                )
              })}
              {zones.length === 0 && <p className="text-[12px] text-ink-muted">No zones yet — create one in the editor.</p>}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="font-data text-ink">{value}</span>
    </div>
  )
}
