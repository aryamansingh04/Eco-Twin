import type { MachineType } from '../types'

export interface PaletteItem {
  type: MachineType
  name: string
  category: 'Machines' | 'Material Handling' | 'Facility / Environment'
  description: string
  defaults: {
    powerKw: number
    operatingHours: number
    utilization: number
    heatOutput: number
    // Starting values only — production capability belongs to the
    // individual machine once placed, and is freely editable afterward in
    // the inspector. This is NOT a type→rate mapping used anywhere else;
    // it exists purely to seed a sensible initial value at creation time.
    productionRate: number
    productionUnit: string
  }
}

// One canonical list drives the palette — search/filter just filters this
// array. Defaults are the starting operational values for a freshly placed
// machine of that type (reasonable, not random).
export const PALETTE_ITEMS: PaletteItem[] = [
  { type: 'CNC', name: 'CNC Machine', category: 'Machines', description: 'Computer-controlled milling/cutting unit', defaults: { powerKw: 20, operatingHours: 10, utilization: 0.65, heatOutput: 10, productionRate: 30, productionUnit: 'units/hour' } },
  { type: 'Press', name: 'Hydraulic Press', category: 'Machines', description: 'Forming/stamping press with hydraulic ram', defaults: { powerKw: 30, operatingHours: 8, utilization: 0.6, heatOutput: 18, productionRate: 20, productionUnit: 'units/hour' } },
  { type: 'Robot Arm', name: 'Robot Arm', category: 'Machines', description: 'Articulated arm for pick/place or assembly', defaults: { powerKw: 6, operatingHours: 14, utilization: 0.7, heatOutput: 3, productionRate: 55, productionUnit: 'units/hour' } },
  { type: 'Welding', name: 'Welding Station', category: 'Machines', description: 'Fixture + torch for joining components', defaults: { powerKw: 14, operatingHours: 8, utilization: 0.5, heatOutput: 16, productionRate: 18, productionUnit: 'units/hour' } },
  { type: 'Compressor', name: 'Air Compressor', category: 'Machines', description: 'Compressed-air supply for pneumatic tools', defaults: { powerKw: 15, operatingHours: 20, utilization: 0.75, heatOutput: 8, productionRate: 0, productionUnit: 'units/hour' } },
  { type: 'Packaging', name: 'Packaging Machine', category: 'Machines', description: 'Wraps and packages finished units', defaults: { powerKw: 9, operatingHours: 12, utilization: 0.65, heatOutput: 4, productionRate: 40, productionUnit: 'units/hour' } },
  { type: 'Conveyor', name: 'Conveyor Belt', category: 'Material Handling', description: 'Moves material between stations', defaults: { powerKw: 4, operatingHours: 16, utilization: 0.8, heatOutput: 1, productionRate: 0, productionUnit: 'units/hour' } },
  { type: 'HVAC', name: 'HVAC / Industrial AC', category: 'Facility / Environment', description: 'Climate control for the factory floor', defaults: { powerKw: 40, operatingHours: 20, utilization: 0.6, heatOutput: -30, productionRate: 0, productionUnit: 'units/hour' } },
]

export const PALETTE_CATEGORIES: PaletteItem['category'][] = ['Machines', 'Material Handling', 'Facility / Environment']
