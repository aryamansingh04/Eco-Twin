import type { Machine, Connection } from '../types'

// Canonical mock fleet. dailyEnergyKwh/dailyCarbonKg are intentionally NOT
// stored here — they're always derived via utils/calculations.ts from
// powerKw × operatingHours × utilization, so editing a machine in the
// editor immediately changes every downstream number in the app.
const DEFAULT_EF = 0.72

export const mockMachines: Machine[] = [
  { id: 'CNC-001', name: 'CNC Machine 01', type: 'CNC', powerKw: 20, operatingHours: 12, utilization: 0.8, heatOutput: 12, emissionFactor: DEFAULT_EF, productionRate: 30, productionUnit: 'units/hour', position: { x: -14, y: 0, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-1' },
  { id: 'CNC-002', name: 'CNC Machine 02', type: 'CNC', powerKw: 18, operatingHours: 11, utilization: 0.72, heatOutput: 10, emissionFactor: DEFAULT_EF, productionRate: 45, productionUnit: 'units/hour', position: { x: -8, y: 0, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-1' },
  { id: 'CNC-003', name: 'CNC Machine 03', type: 'CNC', powerKw: 18, operatingHours: 7, utilization: 0.41, heatOutput: 6, emissionFactor: DEFAULT_EF, productionRate: 28, productionUnit: 'units/hour', position: { x: -8, y: 0, z: -4 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-1' },
  { id: 'CNC-004', name: 'CNC Machine 04', type: 'CNC', powerKw: 24, operatingHours: 14, utilization: 0.91, heatOutput: 16, emissionFactor: DEFAULT_EF, productionRate: 38, productionUnit: 'units/hour', position: { x: -14, y: 0, z: -4 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-1' },
  { id: 'Press-001', name: 'Hydraulic Press 01', type: 'Press', powerKw: 30, operatingHours: 9, utilization: 0.65, heatOutput: 20, emissionFactor: DEFAULT_EF, productionRate: 20, productionUnit: 'units/hour', position: { x: 8, y: 0, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-2' },
  { id: 'Press-002', name: 'Hydraulic Press 02', type: 'Press', powerKw: 32, operatingHours: 10, utilization: 0.7, heatOutput: 22, emissionFactor: DEFAULT_EF, productionRate: 25, productionUnit: 'units/hour', position: { x: 14, y: 0, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-2' },
  { id: 'Robot-001', name: 'Robot Arm 01', type: 'Robot Arm', powerKw: 6, operatingHours: 16, utilization: 0.88, heatOutput: 3, emissionFactor: DEFAULT_EF, productionRate: 60, productionUnit: 'units/hour', position: { x: 8, y: 0, z: -4 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-2' },
  { id: 'Robot-002', name: 'Robot Arm 02', type: 'Robot Arm', powerKw: 6, operatingHours: 9, utilization: 0.5, heatOutput: 3, emissionFactor: DEFAULT_EF, productionRate: 50, productionUnit: 'units/hour', position: { x: 20, y: 0, z: 2 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-2' },
  { id: 'Weld-001', name: 'Welding Station 01', type: 'Welding', powerKw: 14, operatingHours: 5, utilization: 0.3, heatOutput: 18, emissionFactor: DEFAULT_EF, productionRate: 18, productionUnit: 'units/hour', position: { x: 14, y: 0, z: -4 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-2' },
  { id: 'Conveyor-001', name: 'Conveyor 01', type: 'Conveyor', powerKw: 4, operatingHours: 18, utilization: 0.95, heatOutput: 1, emissionFactor: DEFAULT_EF, productionRate: 0, productionUnit: 'units/hour', position: { x: -1, y: 0, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-2' },
  { id: 'Conveyor-002', name: 'Conveyor 02', type: 'Conveyor', powerKw: 4, operatingHours: 18, utilization: 0.9, heatOutput: 1, emissionFactor: DEFAULT_EF, productionRate: 0, productionUnit: 'units/hour', position: { x: -1, y: 0, z: -4 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-2' },
  { id: 'Conveyor-003', name: 'Conveyor 03', type: 'Conveyor', powerKw: 4, operatingHours: 10, utilization: 0.4, heatOutput: 1, emissionFactor: DEFAULT_EF, productionRate: 0, productionUnit: 'units/hour', position: { x: -20, y: 0, z: 2 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-1' },
  { id: 'HVAC-001', name: 'HVAC Unit 01', type: 'HVAC', powerKw: 40, operatingHours: 20, utilization: 0.6, heatOutput: -30, emissionFactor: DEFAULT_EF, productionRate: 0, productionUnit: 'units/hour', position: { x: -14, y: 0, z: 14 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-3' },
  { id: 'HVAC-002', name: 'HVAC Unit 02', type: 'HVAC', powerKw: 38, operatingHours: 20, utilization: 0.58, heatOutput: -28, emissionFactor: DEFAULT_EF, productionRate: 0, productionUnit: 'units/hour', position: { x: 0, y: 0, z: 14 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-3' },
  { id: 'HVAC-003', name: 'HVAC Unit 03', type: 'HVAC', powerKw: 44, operatingHours: 20, utilization: 0.67, heatOutput: -32, emissionFactor: DEFAULT_EF, productionRate: 0, productionUnit: 'units/hour', position: { x: 14, y: 0, z: 14 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-3' },
  { id: 'Compressor-001', name: 'Air Compressor 01', type: 'Compressor', powerKw: 15, operatingHours: 22, utilization: 0.82, heatOutput: 8, emissionFactor: DEFAULT_EF, productionRate: 0, productionUnit: 'units/hour', position: { x: -20, y: 0, z: 18 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-3' },
  { id: 'Pack-001', name: 'Packaging Line 01', type: 'Packaging', powerKw: 9, operatingHours: 15, utilization: 0.77, heatOutput: 4, emissionFactor: DEFAULT_EF, productionRate: 40, productionUnit: 'units/hour', position: { x: 20, y: 0, z: -4 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-2' },
  { id: 'Pack-002', name: 'Packaging Line 02', type: 'Packaging', powerKw: 9, operatingHours: 0, utilization: 0, heatOutput: 0, emissionFactor: DEFAULT_EF, productionRate: 40, productionUnit: 'units/hour', position: { x: 20, y: 0, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, zoneId: 'Z-2' },
]

export const mockConnections: Connection[] = [
  { id: 'C-1', fromMachineId: 'CNC-001', toMachineId: 'Conveyor-003', kind: 'material-flow' },
  { id: 'C-2', fromMachineId: 'CNC-002', toMachineId: 'Conveyor-002', kind: 'material-flow' },
  { id: 'C-3', fromMachineId: 'CNC-003', toMachineId: 'Conveyor-002', kind: 'material-flow' },
  { id: 'C-4', fromMachineId: 'CNC-004', toMachineId: 'Conveyor-003', kind: 'material-flow' },
  { id: 'C-5', fromMachineId: 'Conveyor-002', toMachineId: 'Press-001', kind: 'material-flow' },
  { id: 'C-6', fromMachineId: 'Press-001', toMachineId: 'Robot-001', kind: 'material-flow' },
  { id: 'C-7', fromMachineId: 'Press-002', toMachineId: 'Weld-001', kind: 'material-flow' },
  { id: 'C-8', fromMachineId: 'Robot-001', toMachineId: 'Conveyor-001', kind: 'material-flow' },
  { id: 'C-9', fromMachineId: 'Conveyor-001', toMachineId: 'Pack-001', kind: 'material-flow' },
  { id: 'C-10', fromMachineId: 'Weld-001', toMachineId: 'Robot-002', kind: 'material-flow' },
  { id: 'C-11', fromMachineId: 'Robot-002', toMachineId: 'Pack-002', kind: 'material-flow' },
]
