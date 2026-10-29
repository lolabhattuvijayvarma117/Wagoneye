import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
  loading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[var(--color-accent)] text-[var(--color-accent-on)] hover:bg-[var(--color-accent-dim)] active:scale-[0.97]',
  secondary: 'bg-[var(--color-n-150)] text-[var(--color-n-700)] border border-[var(--color-n-200)] hover:bg-[var(--color-n-200)] active:scale-[0.97]',
  ghost:     'bg-transparent text-[var(--color-n-600)] hover:bg-[var(--color-n-150)] active:scale-[0.97]',
  danger:    'bg-transparent text-[var(--color-status-alert)] border border-[var(--color-status-alert)] hover:bg-[rgba(200,90,60,0.1)] active:scale-[0.97]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-8 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', children, loading, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-all duration-[120ms]',
        'focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2',
        'disabled:opacity-40 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden />
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
  size?: Size
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, children, size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-[var(--color-n-500)]',
        'hover:bg-[var(--color-n-150)] hover:text-[var(--color-n-700)]',
        'active:scale-[0.97] transition-all duration-[120ms]',
        'focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2',
        'disabled:opacity-40 disabled:pointer-events-none',
        size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
)
IconButton.displayName = 'IconButton'
