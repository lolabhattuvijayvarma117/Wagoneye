import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface KeyValueProps {
  label: string
  value: ReactNode
  mono?: boolean
  className?: string
}

export function KeyValue({ label, value, mono = false, className }: KeyValueProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-[11px] text-[var(--color-n-400)] uppercase tracking-wider leading-none">
        {label}
      </span>
      <span
        className={cn(
          'text-sm text-[var(--color-n-700)] leading-snug',
          mono && 'font-mono tabular-nums'
        )}
        style={mono ? { fontFamily: 'var(--font-mono)' } : undefined}
      >
        {value}
      </span>
    </div>
  )
}

export function KeyValueRow({ items }: { items: Array<{ label: string; value: ReactNode; mono?: boolean }> }) {
  return (
    <div className="flex items-start gap-6">
      {items.map(item => (
        <KeyValue key={item.label} {...item} />
      ))}
    </div>
  )
}
