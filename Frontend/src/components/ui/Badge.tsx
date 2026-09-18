import clsx from 'clsx'

type Tone = 'brand' | 'warn' | 'danger' | 'info' | 'neutral'

const TONE_CLASSES: Record<Tone, string> = {
  brand: 'bg-brand-soft text-brand',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface text-ink-muted border border-line',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium', TONE_CLASSES[tone])}>
      {children}
    </span>
  )
}
