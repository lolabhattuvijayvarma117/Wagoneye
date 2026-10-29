import * as RadixTooltip from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={300}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            sideOffset={6}
            className="z-50 px-2 py-1 rounded-sm text-xs text-[var(--color-n-800)] bg-[var(--color-n-150)] shadow-[var(--shadow-float)] select-none"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {content}
            <RadixTooltip.Arrow className="fill-[var(--color-n-150)]" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
