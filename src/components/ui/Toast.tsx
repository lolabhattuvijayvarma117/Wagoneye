import * as RadixToast from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

export type ToastVariant = 'default' | 'ok' | 'warn' | 'alert'

interface ToastProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  variant?: ToastVariant
  action?: ReactNode
}

const variantBorder: Record<ToastVariant, string> = {
  default: 'border-[var(--color-n-200)]',
  ok:      'border-[var(--color-status-ok)]',
  warn:    'border-[var(--color-status-warn)]',
  alert:   'border-[var(--color-status-alert)]',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <RadixToast.Provider swipeDirection="right">
      {children}
      <RadixToast.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[100vw]" />
    </RadixToast.Provider>
  )
}

export function Toast({ open, onOpenChange, title, description, variant = 'default', action }: ToastProps) {
  return (
    <RadixToast.Root
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        'bg-[var(--color-n-100)] rounded-md p-4 shadow-[var(--shadow-float)]',
        'border-l-[3px] border border-[var(--color-n-200)]',
        variantBorder[variant],
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0',
        'data-[state=closed]:slide-out-to-right-4 data-[state=open]:slide-in-from-right-4',
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <RadixToast.Title className="text-sm font-medium text-[var(--color-n-700)]">
            {title}
          </RadixToast.Title>
          {description && (
            <RadixToast.Description className="mt-1 text-xs text-[var(--color-n-500)]">
              {description}
            </RadixToast.Description>
          )}
          {action && <div className="mt-2">{action}</div>}
        </div>
        <RadixToast.Close asChild>
          <button
            aria-label="Close notification"
            className="text-[var(--color-n-400)] hover:text-[var(--color-n-600)] p-0.5 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </RadixToast.Close>
      </div>
    </RadixToast.Root>
  )
}
