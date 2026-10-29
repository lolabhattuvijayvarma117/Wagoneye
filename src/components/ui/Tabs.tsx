import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/lib/cn'

export const Tabs = RadixTabs.Root

export function TabsList({ className, ...props }: RadixTabs.TabsListProps) {
  return (
    <RadixTabs.List
      className={cn(
        'flex items-center gap-1 border-b border-[var(--color-n-200)] px-4',
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: RadixTabs.TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'flex items-center justify-center px-3 py-2 text-sm text-[var(--color-n-500)] border-b-2 border-transparent -mb-px',
        'hover:text-[var(--color-n-700)] transition-colors duration-[120ms]',
        'data-[state=active]:text-[var(--color-accent)] data-[state=active]:border-[var(--color-accent)]',
        'focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]',
        className
      )}
      {...props}
    />
  )
}

export const TabsContent = RadixTabs.Content
