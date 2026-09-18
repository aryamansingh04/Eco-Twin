import { useState } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useNavigate } from 'react-router-dom'
import {
  Save, BarChart3, Undo2, Redo2, X, Loader2, Check, Grid3x3, Magnet,
  Copy, Trash2, Video, RotateCw,
} from 'lucide-react'
import { useFactoryStore } from '../../store/useFactoryStore'
import { useSettingsStore } from '../../store/useSettingsStore'

const CAMERA_VIEWS: Record<string, { position: [number, number, number] }> = {
  Iso: { position: [26, 22, 26] },
  Top: { position: [0, 42, 0.01] },
  Front: { position: [0, 8, 34] },
}

function IconBtn({ icon: Icon, label, onClick, disabled, active }: { icon: typeof Save; label: string; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? 'bg-brand text-white' : 'text-ink-muted hover:bg-surface hover:text-ink'
      }`}
    >
      <Icon size={15} />
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-line mx-1" />
}

export function EditorTopBar({
  factoryName,
  bridgeRef,
  controlsRef,
}: {
  factoryName: string
  bridgeRef: React.MutableRefObject<{ camera: THREE.Camera; gl: THREE.WebGLRenderer } | null>
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>
}) {
  const navigate = useNavigate()
  const saveLayout = useFactoryStore((s) => s.saveLayout)
  const isSaving = useFactoryStore((s) => s.isSaving)
  const undo = useFactoryStore((s) => s.undo)
  const redo = useFactoryStore((s) => s.redo)
  const canUndo = useFactoryStore((s) => s.past.length > 0)
  const canRedo = useFactoryStore((s) => s.future.length > 0)
  const selectedId = useFactoryStore((s) => s.selectedId)
  const deleteMachine = useFactoryStore((s) => s.deleteMachine)
  const duplicateMachine = useFactoryStore((s) => s.duplicateMachine)
  const rotateMachine = useFactoryStore((s) => s.rotateMachine)
  const machines = useFactoryStore((s) => s.machines)

  const editorSettings = useSettingsStore((s) => s.editor)
  const updateEditor = useSettingsStore((s) => s.updateEditor)

  const [justSaved, setJustSaved] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const handleSave = async () => {
    await saveLayout()
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1800)
  }

  const handleAnalyze = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      navigate('/recommendations')
    }, 900)
  }

  const setCameraView = (viewKey: keyof typeof CAMERA_VIEWS) => {
    const bridge = bridgeRef.current
    const controls = controlsRef.current
    if (!bridge || !controls) return
    const { position } = CAMERA_VIEWS[viewKey]
    bridge.camera.position.set(...position)
    controls.target.set(0, 0, 0)
    controls.update()
  }

  const rotateSelected = () => {
    if (!selectedId) return
    const m = machines.find((x) => x.id === selectedId)
    if (!m) return
    rotateMachine(selectedId, { y: (m.rotation.y + Math.PI / 4) % (Math.PI * 2) })
  }

  return (
    <div className="h-14 shrink-0 bg-white border-b border-line flex items-center justify-between px-4 overflow-x-auto">
      <div className="text-[13px] font-medium text-ink shrink-0 mr-4">
        {factoryName} <span className="text-ink-muted font-normal">/ Editor</span>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <IconBtn icon={Undo2} label="Undo" onClick={undo} disabled={!canUndo} />
        <IconBtn icon={Redo2} label="Redo" onClick={redo} disabled={!canRedo} />
        <Divider />
        <IconBtn icon={Copy} label="Duplicate Selected" onClick={() => selectedId && duplicateMachine(selectedId)} disabled={!selectedId} />
        <IconBtn icon={RotateCw} label="Rotate Selected 45°" onClick={rotateSelected} disabled={!selectedId} />
        <IconBtn icon={Trash2} label="Delete Selected" onClick={() => selectedId && deleteMachine(selectedId)} disabled={!selectedId} />
        <Divider />
        <IconBtn icon={Grid3x3} label="Toggle Grid" onClick={() => updateEditor({ gridEnabled: !editorSettings.gridEnabled })} active={editorSettings.gridEnabled} />
        <IconBtn icon={Magnet} label="Toggle Snap to Grid" onClick={() => updateEditor({ snapToGrid: !editorSettings.snapToGrid })} active={editorSettings.snapToGrid} />
        <select
          value={editorSettings.gridSize}
          onChange={(e) => updateEditor({ gridSize: Number(e.target.value) })}
          title="Grid Size"
          className="text-[11px] border border-line rounded-md px-1.5 py-1 bg-white text-ink-muted"
        >
          {[0.5, 1, 2, 5].map((g) => <option key={g} value={g}>{g}m grid</option>)}
        </select>
        <Divider />
        {(['Iso', 'Top', 'Front'] as const).map((v) => (
          <button key={v} onClick={() => setCameraView(v)} title={`${v} View`} className="px-2 h-8 flex items-center gap-1 rounded-md text-[11px] text-ink-muted hover:bg-surface hover:text-ink transition-colors">
            <Video size={13} /> {v}
          </button>
        ))}
        <Divider />

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-ink border border-line hover:bg-surface transition-colors"
        >
          {isSaving ? <Loader2 size={13} className="animate-spin" /> : justSaved ? <Check size={13} className="text-brand" /> : <Save size={13} />}
          {justSaved ? 'Saved' : 'Save Layout'}
        </button>

        <button
          onClick={handleAnalyze}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-white bg-brand hover:bg-brand/90 transition-colors"
        >
          {analyzing ? <Loader2 size={13} className="animate-spin" /> : <BarChart3 size={13} />}
          Analyze
        </button>

        <button
          onClick={() => navigate('/factory')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] text-ink-muted hover:text-ink hover:bg-surface transition-colors"
        >
          <X size={13} /> Exit Editor
        </button>
      </div>
    </div>
  )
}
