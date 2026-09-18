// Settings store. Kept separate from useFactoryStore because settings are
// app-wide configuration, not factory data — but editor/dashboard
// components read straight from here so toggles take effect immediately.
import { create } from 'zustand'
import type { EditorSettings, AnalyticsSettings, NotificationSettings, AppearanceSettings, AccountSettings, DashboardSettings } from '../types'
import { loadSettings, saveSettings, type AllSettings } from '../services/settingsService'

interface SettingsState extends AllSettings {
  hydrate: () => void
  updateEditor: (patch: Partial<EditorSettings>) => void
  updateAnalytics: (patch: Partial<AnalyticsSettings>) => void
  updateNotifications: (patch: Partial<NotificationSettings>) => void
  updateAppearance: (patch: Partial<AppearanceSettings>) => void
  updateAccount: (patch: Partial<AccountSettings>) => void
  updateDashboard: (patch: Partial<DashboardSettings>) => void
}

function persist(get: () => SettingsState) {
  const { editor, analytics, notifications, appearance, account, dashboard } = get()
  saveSettings({ editor, analytics, notifications, appearance, account, dashboard })
}

const initial = loadSettings()

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...initial,
  hydrate: () => set(loadSettings()),
  updateEditor: (patch) => {
    set((s) => ({ editor: { ...s.editor, ...patch } }))
    persist(get)
  },
  updateAnalytics: (patch) => {
    set((s) => ({ analytics: { ...s.analytics, ...patch } }))
    persist(get)
  },
  updateNotifications: (patch) => {
    set((s) => ({ notifications: { ...s.notifications, ...patch } }))
    persist(get)
  },
  updateAppearance: (patch) => {
    set((s) => ({ appearance: { ...s.appearance, ...patch } }))
    persist(get)
  },
  updateAccount: (patch) => {
    set((s) => ({ account: { ...s.account, ...patch } }))
    persist(get)
  },
  updateDashboard: (patch) => {
    set((s) => ({ dashboard: { ...s.dashboard, ...patch } }))
    persist(get)
  },
}))
