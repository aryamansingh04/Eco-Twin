import { PageShell } from '../components/layout/PageShell'
import { Card, CardHeader } from '../components/ui/Card'
import { getEnergyForecast, modelMetrics } from '../data/mockPredictions'
import { useFactoryData } from '../hooks/useFactoryData'
import { totalEnergyKwh } from '../utils/calculations'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { ArrowRight } from 'lucide-react'

export function PredictionsPage() {
  const { machines } = useFactoryData()
  const energyForecast = getEnergyForecast(totalEnergyKwh(machines))
  const actual = energyForecast.filter((p) => p.kind === 'actual')
  const forecast = energyForecast.filter((p) => p.kind === 'forecast')
  const splitLabel = actual[actual.length - 1]?.label

  // Recharts needs one merged series with separate keys so historical vs
  // forecast render as visually distinct line segments.
  const chartData = energyForecast.map((p, i) => ({
    label: p.label,
    actual: p.kind === 'actual' ? p.kwh : i === actual.length ? p.kwh : undefined,
    forecast: p.kind === 'forecast' ? p.kwh : i === actual.length - 1 ? p.kwh : undefined,
  }))

  return (
    <PageShell title="Predictions" subtitle="ML-based energy forecast">
      <div className="grid grid-cols-3 gap-5 mb-5">
        <Card className="col-span-2">
          <CardHeader title="Energy Forecast" subtitle="Today's actual value is live; the forecast is illustrative (real model runs in Django)" />
          <div className="h-72 px-2 pt-4 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E1" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#5B6870' }} axisLine={{ stroke: '#E1E4E1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#5B6870' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <ReferenceLine x={splitLabel} stroke="#E1E4E1" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="actual" stroke="#14191C" strokeWidth={2} dot={{ r: 2.5 }} connectNulls />
                <Line type="monotone" dataKey="forecast" stroke="#3E7C59" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 2.5 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 px-5 pb-4 text-[11px] text-ink-muted">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-ink inline-block" /> Actual</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-brand inline-block" style={{ borderTop: '2px dashed' }} /> Forecast</span>
          </div>
        </Card>

        <Card>
          <CardHeader title="Model" subtitle="Prototype model evaluation" />
          <div className="p-5 space-y-3 text-[12.5px]">
            <Row label="Model" value={modelMetrics.modelName} />
            <Row label="Target" value={modelMetrics.target} />
            <Row label="Horizon" value={`${modelMetrics.horizonDays} days`} />
            <Row label="MAE" value={`${modelMetrics.mae} kWh`} />
            <Row label="RMSE" value={`${modelMetrics.rmse} kWh`} />
            <Row label="R²" value={modelMetrics.r2.toString()} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <CardHeader title="Next 7 Days" />
          <div className="divide-y divide-line">
            {forecast.map((p) => (
              <div key={p.label} className="flex items-center justify-between px-5 py-2.5 text-[12.5px]">
                <span className="text-ink">{p.label}</span>
                <span className="font-data text-ink-muted">{p.kwh.toLocaleString()} kWh</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="How the prediction works" />
          <div className="p-5 flex flex-col gap-2 text-[11.5px] text-ink-muted">
            {['Historical machine data', 'Feature engineering', 'ML model', 'Energy forecast', 'Carbon estimation'].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-surface rounded-md text-ink">{step}</span>
                {i < arr.length - 1 && <ArrowRight size={13} className="text-ink-muted shrink-0" />}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-muted">{label}</span>
      <span className="font-data text-ink text-right">{value}</span>
    </div>
  )
}
