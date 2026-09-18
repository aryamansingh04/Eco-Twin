import type { PredictionPoint, ModelMetrics } from '../types'

const BASE_FORECAST: PredictionPoint[] = [
  { label: 'Mon', kwh: 1790, kind: 'actual' },
  { label: 'Tue', kwh: 1840, kind: 'actual' },
  { label: 'Wed', kwh: 1760, kind: 'actual' },
  { label: 'Thu', kwh: 1910, kind: 'actual' },
  { label: 'Fri', kwh: 1880, kind: 'actual' },
  { label: 'Sat', kwh: 1620, kind: 'actual' },
  { label: 'Sun', kwh: 1490, kind: 'actual' },
  { label: 'Tomorrow', kwh: 1850, kind: 'forecast' },
  { label: 'Day 2', kwh: 1920, kind: 'forecast' },
  { label: 'Day 3', kwh: 1870, kind: 'forecast' },
  { label: 'Day 4', kwh: 2010, kind: 'forecast' },
  { label: 'Day 5', kwh: 1980, kind: 'forecast' },
  { label: 'Day 6', kwh: 2050, kind: 'forecast' },
  { label: 'Day 7', kwh: 2020, kind: 'forecast' },
]

/**
 * The ML model itself is out of scope for the frontend (see the "How the
 * prediction works" panel) — but the mock forecast it stands in for should
 * still agree with today's real canonical total, rather than floating
 * off on its own fixed numbers. When `todayKwh` is provided (the live
 * total from utils/calculations.ts), the whole 14-point series is rescaled
 * around it and the most recent "actual" point (Sun — today) is forced to
 * equal it exactly.
 */
export function getEnergyForecast(todayKwh?: number): PredictionPoint[] {
  if (todayKwh === undefined) return BASE_FORECAST
  const mean = BASE_FORECAST.reduce((s, p) => s + p.kwh, 0) / BASE_FORECAST.length
  if (mean <= 0) return BASE_FORECAST
  const scale = todayKwh / mean
  const scaled = BASE_FORECAST.map((p) => ({ ...p, kwh: Math.round(p.kwh * scale) }))
  const lastActualIdx = scaled.map((p) => p.kind).lastIndexOf('actual')
  if (lastActualIdx >= 0) scaled[lastActualIdx] = { ...scaled[lastActualIdx], kwh: Math.round(todayKwh) }
  return scaled
}

export const modelMetrics: ModelMetrics = {
  modelName: 'Random Forest Regressor',
  target: 'Energy Consumption (kWh)',
  horizonDays: 7,
  mae: 64.2,
  rmse: 89.7,
  r2: 0.91,
}
