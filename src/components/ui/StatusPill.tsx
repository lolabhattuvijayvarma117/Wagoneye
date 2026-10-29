import { cn } from '@/lib/cn'

export type StatusVariant = 'ok' | 'warn' | 'alert' | 'idle' | 'live'

const variantConfig: Record<StatusVariant, { bg: string; text: string; dot: string; label: string }> = {
  ok:    { bg: 'rgba(88,163,96,0.15)',  text: 'var(--color-status-ok)',    dot: 'var(--color-status-ok)',    label: 'OK' },
  warn:  { bg: 'rgba(200,170,50,0.15)', text: 'var(--color-status-warn)',  dot: 'var(--color-status-warn)',  label: 'WARN' },
  alert: { bg: 'rgba(200,90,60,0.15)', text: 'var(--color-status-alert)', dot: 'var(--color-status-alert)', label: 'ALERT' },
  idle:  { bg: 'rgba(90,107,138,0.15)',text: 'var(--color-status-idle)',  dot: 'var(--color-status-idle)',  label: 'IDLE' },
  live:  { bg: 'rgba(80,180,100,0.15)',text: 'var(--color-status-live)',  dot: 'var(--color-status-live)',  label: 'LIVE' },
}

interface StatusPillProps {
  status: StatusVariant
  label?: string
  className?: string
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  const cfg = variantConfig[status]
  const displayLabel = label ?? cfg.label
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5', className)}
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: cfg.dot }}
        aria-hidden
      />
      <span
        className="text-[10px] font-medium leading-none tracking-widest uppercase"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {displayLabel}
      </span>
    </span>
  )
}
