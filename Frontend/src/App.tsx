import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Sidebar } from './components/layout/Sidebar'
import { useAuthStore } from './store/useAuthStore'
import { useTelemetryStore } from './store/useTelemetryStore'
import { useSettingsStore } from './store/useSettingsStore'

import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { FactorySetupPage } from './pages/FactorySetupPage'
import { OverviewPage } from './pages/OverviewPage'
import { FactoryPage } from './pages/FactoryPage'
import { FactoryEditorPage } from './pages/FactoryEditorPage'
import { MachinesPage } from './pages/MachinesPage'
import { MachineDetailPage } from './pages/MachineDetailPage'
import { EnergyPage } from './pages/EnergyPage'
import { CarbonPage } from './pages/CarbonPage'
import { PredictionsPage } from './pages/PredictionsPage'
import { ReportsPage } from './pages/ReportsPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProductionPlannerPage } from './pages/ProductionPlannerPage'

function AppShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      <Sidebar />
      <Outlet />
    </div>
  )
}

// Gate for everything that requires a signed-in user with a factory
// already set up (the normal operating app). Also owns telemetry polling
// — it runs for every authenticated route (dashboard pages AND the
// editor), not just the dashboard shell, so the editor's live status dots
// and the dashboard's status panel are always looking at the same feed.
function RequireAuth() {
  const user = useAuthStore((s) => s.user)
  const hasCompletedFactorySetup = useAuthStore((s) => s.hasCompletedFactorySetup)
  const startPolling = useTelemetryStore((s) => s.startPolling)
  const stopPolling = useTelemetryStore((s) => s.stopPolling)
  const refreshIntervalSec = useSettingsStore((s) => s.dashboard.refreshIntervalSec)

  useEffect(() => {
    if (!user || !hasCompletedFactorySetup) return
    startPolling(refreshIntervalSec)
    return () => stopPolling()
  }, [user, hasCompletedFactorySetup, startPolling, stopPolling, refreshIntervalSec])

  if (!user) return <Navigate to="/" replace />
  if (!hasCompletedFactorySetup) return <Navigate to="/factory-setup" replace />
  return <Outlet />
}

// Gate for landing/login/signup: a returning authenticated user should not
// see the marketing page or auth forms again — send them straight in.
function RequireGuest() {
  const user = useAuthStore((s) => s.user)
  const hasCompletedFactorySetup = useAuthStore((s) => s.hasCompletedFactorySetup)
  if (user && hasCompletedFactorySetup) return <Navigate to="/dashboard" replace />
  if (user && !hasCompletedFactorySetup) return <Navigate to="/factory-setup" replace />
  return <Outlet />
}

function RequireFactorySetupPending() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  const hydrated = useAuthStore((s) => s.hydrated)
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (!hydrated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-brand" size={24} />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RequireGuest />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<RequireFactorySetupPending />}>
          <Route path="/factory-setup" element={<FactorySetupPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="/factory/editor" element={<FactoryEditorPage />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<OverviewPage />} />
            <Route path="/factory" element={<FactoryPage />} />
            <Route path="/machines" element={<MachinesPage />} />
            <Route path="/machines/:id" element={<MachineDetailPage />} />
            <Route path="/energy" element={<EnergyPage />} />
            <Route path="/carbon" element={<CarbonPage />} />
            <Route path="/predictions" element={<PredictionsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/production-planner" element={<ProductionPlannerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
