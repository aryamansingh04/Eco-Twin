import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Loader2 } from 'lucide-react'
import { EditorTopBar } from '../components/editor/EditorTopBar'
import { ComponentPalette } from '../components/editor/ComponentPalette'
import { PropertiesPanel } from '../components/editor/PropertiesPanel'
import { EditorStatusBar } from '../components/editor/EditorStatusBar'
import { Scene3D } from '../components/editor/Scene3D'
import { useFactoryStore } from '../store/useFactoryStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { screenPointToGround, buildMachineAtPoint } from '../components/editor/dropUtils'
import type { MachineType } from '../types'

// The editor breaks out of the standard sidebar+content shell entirely —
// it's a full-bleed workspace with its own light industrial background,
// closer to engineering CAD software than the rest of the dashboard.
export function FactoryEditorPage() {
  const hydrated = useFactoryStore((s) => s.hydrated)
  const hydrate = useFactoryStore((s) => s.hydrate)
  const factory = useFactoryStore((s) => s.factory)
  const machines = useFactoryStore((s) => s.machines)
  const addMachine = useFactoryStore((s) => s.addMachine)
  const selectedId = useFactoryStore((s) => s.selectedId)
  const deleteMachine = useFactoryStore((s) => s.deleteMachine)
  const duplicateMachine = useFactoryStore((s) => s.duplicateMachine)
  const rotateMachine = useFactoryStore((s) => s.rotateMachine)
  const undo = useFactoryStore((s) => s.undo)
  const redo = useFactoryStore((s) => s.redo)
  const editorSettings = useSettingsStore((s) => s.editor)

  const bridgeRef = useRef<{ camera: THREE.Camera; gl: THREE.WebGLRenderer } | null>(null)
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  // If we arrived here via "Locate in Factory" / "Open in Editor" with a
  // machine already selected, fly the camera to it once the scene is ready.
  const framedRef = useRef(false)
  useEffect(() => {
    if (!hydrated || !selectedId || framedRef.current) return
    const tryFrame = () => {
      const bridge = bridgeRef.current
      const controls = controlsRef.current
      const machine = machines.find((m) => m.id === selectedId)
      if (!bridge || !controls || !machine) {
        requestAnimationFrame(tryFrame)
        return
      }
      framedRef.current = true
      const { x, y, z } = machine.position
      bridge.camera.position.set(x + 10, y + 9, z + 10)
      controls.target.set(x, y, z)
      controls.update()
    }
    tryFrame()
  }, [hydrated, selectedId, machines])

  // Keyboard shortcuts: Delete/Backspace removes selection, R rotates,
  // Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo, Ctrl/Cmd+D duplicate.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        deleteMachine(selectedId)
      } else if (e.key.toLowerCase() === 'r' && selectedId) {
        const m = machines.find((x) => x.id === selectedId)
        if (m) rotateMachine(selectedId, { y: (m.rotation.y + Math.PI / 4) % (Math.PI * 2) })
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault()
        duplicateMachine(selectedId)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedId, machines, deleteMachine, rotateMachine, undo, redo, duplicateMachine])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/ecotwin-machine-type') as MachineType
    const bridge = bridgeRef.current
    if (!type || !bridge) return
    const point = screenPointToGround(e.clientX, e.clientY, bridge.gl, bridge.camera)
    if (!point) return
    const snapFn = (v: number) => (editorSettings.snapToGrid ? Math.round(v / editorSettings.gridSize) * editorSettings.gridSize : Math.round(v * 10) / 10)
    const machine = buildMachineAtPoint(type, point, machines, snapFn)
    addMachine(machine)
  }

  if (!hydrated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-brand" size={28} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <EditorTopBar factoryName={factory?.name ?? 'Factory'} bridgeRef={bridgeRef} controlsRef={controlsRef} />
      <div className="relative flex-1 flex overflow-hidden">
        <ComponentPalette />
        <div className="relative flex-1" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
          <Scene3D bridgeRef={bridgeRef} controlsRef={controlsRef} />
          <PropertiesPanel />
          <EditorStatusBar />
        </div>
      </div>
    </div>
  )
}
