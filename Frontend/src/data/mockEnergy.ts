import type { EnergyReading, CarbonSource } from '../types'

// Deterministic pseudo-random so charts look the same across renders/reloads
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function genSeries(points: number, base: number, amplitude: number, seed: number): number[] {
  const rand = seeded(seed)
  return Array.from({ length: points }, (_, i) => {
    const wave = Math.sin(i / (points / 6)) * amplitude
    const noise = (rand() - 0.5) * amplitude * 0.6
    return Math.max(0, Math.round((base + wave + noise) * 10) / 10)
  })
}

// `anchorKwh`, when provided, is the CURRENT canonical daily total (from
// utils/calculations.ts, i.e. real machine config) for the '24h'/'7d'/'30d'
// ranges. The synthetic shape (wave + noise) is kept for a believable
// trend line, but rescaled so its average matches the anchor, and the
// most recent point is forced to equal it exactly — so this chart can
// never show a "today" figure that disagrees with the KPI cards next to
// it. '12m' has no meaningful anchor (a single day's config doesn't imply
// a year of history) and stays purely illustrative.
export function getEnergySeries(range: '24h' | '7d' | '30d' | '12m', anchorKwh?: number): EnergyReading[] {
  const config = {
    '24h': { points: 24, base: 76, amp: 22, seed: 11, labelFn: (i: number) => `${i}:00` },
    '7d': { points: 7, base: 1820, amp: 260, seed: 22, labelFn: (i: number) => ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i] },
    '30d': { points: 30, base: 1780, amp: 300, seed: 33, labelFn: (i: number) => `${i + 1}` },
    '12m': { points: 12, base: 52000, amp: 8000, seed: 44, labelFn: (i: number) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i] },
  }[range]

  let values = genSeries(config.points, config.base, config.amp, config.seed)

  if (anchorKwh !== undefined && range !== '12m' && values.length > 0) {
    if (range === '24h') {
      // Hourly granularity: rescale so the 24 values SUM to the daily
      // anchor (forcing one hour to equal the whole day's total would be
      // a nonsensical spike).
      const currentSum = values.reduce((s, v) => s + v, 0)
      if (currentSum > 0) {
        const scale = anchorKwh / currentSum
        values = values.map((v) => Math.round(v * scale * 10) / 10)
      }
    } else {
      // Daily granularity ('7d' / '30d'): rescale around the anchor and
      // force the most recent day to equal it exactly, so "today" here
      // never disagrees with the KPI cards.
      const currentMean = values.reduce((s, v) => s + v, 0) / values.length
      if (currentMean > 0) {
        const scale = anchorKwh / currentMean
        values = values.map((v) => Math.round(v * scale * 10) / 10)
      }
      values[values.length - 1] = Math.round(anchorKwh * 10) / 10
    }
  }

  return values.map((v, i) => ({
    timestamp: config.labelFn(i),
    consumptionKwh: v,
    costInr: Math.round(v * 8.2),
  }))
}

export const mockCarbonBreakdown: CarbonSource[] = [
  { source: 'Machinery', tCO2e: 742 },
  { source: 'HVAC', tCO2e: 318 },
  { source: 'Material Handling', tCO2e: 156 },
  { source: 'Other', tCO2e: 96 },
]

export const EMISSION_FACTOR_KG_PER_KWH = 0.716 // grid emission factor, India CEA baseline (prototype constant)
