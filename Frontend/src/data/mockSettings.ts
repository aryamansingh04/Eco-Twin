import type { EditorSettings, AnalyticsSettings, NotificationSettings, AppearanceSettings, AccountSettings, DashboardSettings } from '../types'

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  gridEnabled: true,
  snapToGrid: true,
  gridSize: 1,
  showCoordinates: true,
  showConnectionLabels: false,
  showMachineLabels: true,
}

export const DEFAULT_ANALYTICS_SETTINGS: AnalyticsSettings = {
  emissionFactor: 0.72,
  energyUnit: 'kWh',
  carbonUnit: 'kg',
  currency: 'INR',
  reportingPeriod: '30d',
  distanceUnit: 'm',
  temperatureUnit: 'C',
}

export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  refreshIntervalSec: 15,
  defaultView: 'overview',
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  energyAlerts: true,
  carbonAlerts: true,
  machineAlerts: true,
  predictionAlerts: false,
  weeklySummary: true,
}

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: 'light',
  density: 'comfortable',
  animations: true,
}

export const DEFAULT_ACCOUNT_SETTINGS: AccountSettings = {
  name: 'Admin User',
  email: 'admin@vitmanufacturing.com',
  company: 'VIT Manufacturing',
  role: 'Plant Manager',
}
