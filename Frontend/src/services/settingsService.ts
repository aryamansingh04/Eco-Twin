import type { EditorSettings, AnalyticsSettings, NotificationSettings, AppearanceSettings, AccountSettings, DashboardSettings } from '../types'
import { loadJSON, saveJSON } from './storageService'
import {
  DEFAULT_EDITOR_SETTINGS, DEFAULT_ANALYTICS_SETTINGS, DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_APPEARANCE_SETTINGS, DEFAULT_ACCOUNT_SETTINGS, DEFAULT_DASHBOARD_SETTINGS,
} from '../data/mockSettings'

export interface AllSettings {
  editor: EditorSettings
  analytics: AnalyticsSettings
  notifications: NotificationSettings
  appearance: AppearanceSettings
  account: AccountSettings
  dashboard: DashboardSettings
}

// Shallow-merges stored settings over the current defaults, so adding a
// new settings field later doesn't leave existing users with `undefined`
// for it — their old localStorage blob just lacks the new key.
function loadWithDefaults<T extends object>(key: string, fallback: T): T {
  const stored = loadJSON<Partial<T>>(key, {})
  return { ...fallback, ...stored }
}

export function loadSettings(): AllSettings {
  return {
    editor: loadWithDefaults('settings:editor', DEFAULT_EDITOR_SETTINGS),
    analytics: loadWithDefaults('settings:analytics', DEFAULT_ANALYTICS_SETTINGS),
    notifications: loadWithDefaults('settings:notifications', DEFAULT_NOTIFICATION_SETTINGS),
    appearance: loadWithDefaults('settings:appearance', DEFAULT_APPEARANCE_SETTINGS),
    account: loadWithDefaults('settings:account', DEFAULT_ACCOUNT_SETTINGS),
    dashboard: loadWithDefaults('settings:dashboard', DEFAULT_DASHBOARD_SETTINGS),
  }
}

export function saveSettings(settings: AllSettings): void {
  saveJSON('settings:editor', settings.editor)
  saveJSON('settings:analytics', settings.analytics)
  saveJSON('settings:notifications', settings.notifications)
  saveJSON('settings:appearance', settings.appearance)
  saveJSON('settings:account', settings.account)
  saveJSON('settings:dashboard', settings.dashboard)
}
