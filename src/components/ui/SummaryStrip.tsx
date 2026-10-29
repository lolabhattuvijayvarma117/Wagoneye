import { useEffect, useRef, useState, Fragment } from 'react'
import { cn } from '@/lib/cn'

interface StatItem {
  label: string
  value: number
  unit?: string
  delta?: number    // positive = up, negative = down
  deltaWindow?: string  // e.g. "vs yesterday"
  suffix?: string   // e.g. "%"
}

function useCountUp(target: number, duration = 600) {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef<number>()
  const startRef = useRef<number>()

  useEffect(() => {
    startRef.current = undefined
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      setCurrent(Math.round(target * progress))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return current
}

function StatCell({ item }: { item: StatItem }) {
  const animated = useCountUp(item.value)
  const up = (item.delta ?? 0) > 0

  return (
    <div className="flex flex-col gap-0.5 min-w-[120px]">
      <span className="text-[11px] text-[var(--color-n-400)] uppercase tracking-wider leading-none">
        {item.label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span
          className="leading-none"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 500, color: 'var(--color-n-800)', fontVariantNumeric: 'tabular-nums' }}
        >
          {animated.toLocaleString()}{item.suffix}
        </span>
        {item.delta !== undefined && item.delta !== 0 && (
          <span
            className="text-[11px] leading-none"
            style={{
              fontFamily: 'var(--font-mono)',
              color: up ? 'var(--color-status-ok)' : 'var(--color-status-warn)',
            }}
          >
            {up ? '▲' : '▼'}{Math.abs(item.delta)}%
          </span>
        )}
      </div>
      {item.deltaWindow && (
        <span className="text-[10px] text-[var(--color-n-400)]">{item.deltaWindow}</span>
      )}
    </div>
  )
}

interface SummaryStripProps {
  items: StatItem[]
  className?: string
}

export function SummaryStrip({ items, className }: SummaryStripProps) {
  return (
    <div
      className={cn(
        'h-16 flex items-center gap-8 px-5',
        'bg-[var(--color-n-100)] border-b border-[var(--color-n-200)]',
        'overflow-x-auto shrink-0',
        className
      )}
    >
      {items.map((item, i) => (
        <Fragment key={item.label}>
          <StatCell item={item} />
          {i < items.length - 1 && (
            <div className="w-px h-8 bg-[var(--color-n-200)] shrink-0" />
          )}
        </Fragment>
      ))}
    </div>
  )
}
