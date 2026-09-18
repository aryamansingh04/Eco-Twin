// Canonical domain types for EcoTwin.
// One Machine shape is used everywhere — editor, tables, analytics,
// recommendations — so there is a single source of truth. Written to
// mirror what Django REST Framework serializers would eventually return.

export type MachineType =
  | 'CNC'
  | 'Press'
  | 'Conveyor'
  | 'HVAC'
  | 'Robot Arm'
  | 'Compressor'
  | 'Welding'
  | 'Packaging'

export const MACHINE_TYPES: MachineType[] = [
  'CNC', 'Press', 'Conveyor', 'HVAC', 'Robot Arm', 'Compressor', 'Welding', 'Packaging',
]

export type MachineStatus = 'running' | 'idle' | 'offline'

export interface Vector3 {
  x: number
  y: number
  z: number
}

// The canonical machine record. Visual detail (which 3D model to render)
// is derived purely from `type` — nothing about energy/carbon is ever
// inferred from geometry (see machineModels.ts vs calculations.ts).
//
// NOTE: there is deliberately no `status` field here. Machine = what the
// machine IS (static config); operating status is telemetry (what the
// machine is DOING right now) and is only ever read from
// services/machineStatusApi.ts / store/useTelemetryStore.ts. See
// types/telemetry.ts for the live-status shape.
export interface Machine {
  id: string
  name: string
  type: MachineType

  // operational baseline (configured, not live)
  powerKw: number
  operatingHours: number // hours/day, 0-24
  utilization: number // 0-1 (stored as fraction; UI shows %)

  // environmental
  heatOutput: number // kW thermal
  emissionFactor: number // kg CO2e / kWh — per-machine override of factory default

  // spatial — single source of truth for both the 3D scene and the inspector
  position: Vector3
  rotation: Vector3 // radians

  zoneId?: string

  // production capability — belongs to this individual machine, never a
  // type-level constant (two CNCs can have different rates). Configured
  // capacity, distinct from telemetry's actual per-interval output
  // (MachineTelemetry.productionUnits) — never overwrite one with the other.
  productionRate: number // units per hour, nominal/maximum capability, >= 0
  productionUnit: string // e.g. "units/hour" — maps to Django's production_unit

  // optional: a real measured reading, kept distinct from the calculated
  // value so future IoT data doesn't silently overwrite the prototype calc
  measuredEnergyKwh?: number
}

export interface Connection {
  id: string
  fromMachineId: string
  toMachineId: string
  kind: 'material-flow'
  label?: string
}

export interface Zone {
  id: string
  name: string
  color: string
  bounds: { x: number; z: number; width: number; depth: number }
}

export interface Factory {
  id: string
  name: string
  site: string
  areaSqm: number
  description?: string
  createdAt: string
}

export interface EnergyReading {
  timestamp: string
  consumptionKwh: number
  costInr: number
}

export interface CarbonSource {
  source: 'Machinery' | 'HVAC' | 'Material Handling' | 'Other'
  tCO2e: number
}

export interface PredictionPoint {
  label: string
  kwh: number
  kind: 'actual' | 'forecast'
}

export interface ModelMetrics {
  modelName: string
  target: string
  horizonDays: number
  mae: number
  rmse: number
  r2: number
}

export type RecommendationSeverity = 'critical' | 'warning' | 'opportunity'

export interface Recommendation {
  id: string
  severity: RecommendationSeverity
  title: string
  explanation: string
  affectedMachines: string[]
  estEnergySavingsPct: number
  estCarbonSavingsPct: number
  estAnnualCostSavingsInr: number
  action: string
}

export type ReportStatus = 'ready' | 'generating' | 'scheduled'

export interface Report {
  id: string
  name: string
  period: string
  generatedAt: string
  status: ReportStatus
  fileType: 'PDF' | 'XLSX'
}

export type EditorMode = 'select' | 'add-zone' | 'connect' | 'measure'

export interface EditorSettings {
  gridEnabled: boolean
  snapToGrid: boolean
  gridSize: number
  showCoordinates: boolean
  showConnectionLabels: boolean
  showMachineLabels: boolean
}

export interface AnalyticsSettings {
  emissionFactor: number // default kg CO2e/kWh, used when a machine has no override
  energyUnit: 'kWh' | 'MWh'
  carbonUnit: 'kg' | 't'
  currency: 'INR' | 'USD' | 'EUR'
  reportingPeriod: '7d' | '30d' | '12m'
  distanceUnit: DistanceUnit
  temperatureUnit: TemperatureUnit
}

export interface NotificationSettings {
  energyAlerts: boolean
  carbonAlerts: boolean
  machineAlerts: boolean
  predictionAlerts: boolean
  weeklySummary: boolean
}

export interface AppearanceSettings {
  theme: 'light' | 'dark'
  density: 'comfortable' | 'compact'
  animations: boolean
}

export interface AccountSettings {
  name: string
  email: string
  company: string
  role: string
}

export interface DashboardSettings {
  refreshIntervalSec: number
  defaultView: 'overview' | 'energy' | 'carbon' | 'machines'
}

export type DistanceUnit = 'm' | 'ft'
export type TemperatureUnit = 'C' | 'F'
