// Convenience hook so pages outside the editor (Dashboard, Machines,
// Factory, Energy, Carbon...) read the SAME canonical store the editor
// writes to, instead of importing static mock arrays directly. This is
// what makes "change CNC-004's power in the editor" show up everywhere.
import { useEffect } from 'react'
import { useFactoryStore } from '../store/useFactoryStore'
import { useSettingsStore } from '../store/useSettingsStore'

export function useFactoryData() {
  const hydrated = useFactoryStore((s) => s.hydrated)
  const hydrate = useFactoryStore((s) => s.hydrate)
  const factory = useFactoryStore((s) => s.factory)
  const machines = useFactoryStore((s) => s.machines)
  const connections = useFactoryStore((s) => s.connections)
  const zones = useFactoryStore((s) => s.zones)
  const emissionFactor = useSettingsStore((s) => s.analytics.emissionFactor)

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  return { hydrated, factory, machines, connections, zones, emissionFactor }
}
