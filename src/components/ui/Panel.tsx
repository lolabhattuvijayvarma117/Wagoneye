import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-md bg-[var(--color-n-50)] shadow-[var(--shadow-panel)] flex flex-col overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  )
)
Panel.displayName = 'Panel'

interface PanelHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  icon?: ReactNode
  actions?: ReactNode
}

export function PanelHeader({ title, icon, actions, className, ...props }: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'h-10 flex items-center gap-2 px-4 bg-[var(--color-n-150)] shrink-0',
        'shadow-[inset_0_-1px_0_var(--color-n-200)]',
        className
      )}
      {...props}
    >
      {icon && (
        <span className="text-[var(--color-n-500)] shrink-0" aria-hidden>
          {icon}
        </span>
      )}
      <span className="text-sm font-medium text-[var(--color-n-700)] leading-none flex-1 tracking-tight">
        {title}
      </span>
      {actions && (
        <div className="flex items-center gap-1 ml-auto">
          {actions}
        </div>
      )}
    </div>
  )
}

/* Panel body states */
export function PanelBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex-1 p-4', className)} {...props}>
      {children}
    </div>
  )
}

export function PanelSkeleton() {
  return (
    <div className="p-4 flex flex-col gap-3">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="h-2 rounded-sm bg-[var(--color-n-150)] animate-pulse"
          style={{ width: `${[75, 55, 65][i - 1]}%` }}
        />
      ))}
    </div>
  )
}

export function PanelEmpty({ label = 'No data', sub = '' }: { label?: string; sub?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-1 p-8">
      <span className="text-sm text-[var(--color-n-500)]">{label}</span>
      {sub && <span className="text-xs text-[var(--color-n-400)]">{sub}</span>}
    </div>
  )
}

export function PanelError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex-1 flex items-center gap-3 p-4 border-l-[3px] border-[var(--color-status-alert)] m-4 rounded-sm">
      <span className="text-sm text-[var(--color-n-600)] flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-[var(--color-accent)] hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  )
}
