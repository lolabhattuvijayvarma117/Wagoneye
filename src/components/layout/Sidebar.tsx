import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Boxes,
  TrainTrack,
  FileText,
  Bot,
  Camera,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { Tooltip } from '@/components/ui/Tooltip'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  onClose?: () => void
}

interface NavItem {
  name: string
  to: string
  icon: typeof LayoutDashboard
  shortcut?: string
}

const navItems: NavItem[] = [
  { name: 'Control Room', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Wagons', to: '/wagons', icon: Boxes },
  { name: 'Rakes', to: '/rakes', icon: TrainTrack },
  { name: 'Reports', to: '/reports', icon: FileText },
  { name: 'Ask AI', to: '/ask-ai', icon: Bot },
  { name: 'Cameras', to: '/cameras', icon: Camera },
  { name: 'Settings', to: '/settings', icon: Settings },
]

export default function Sidebar({ collapsed, onToggleCollapse, onClose }: SidebarProps) {
  return (
    <aside
      className={cn(
        'h-full flex flex-col justify-between select-none',
        'bg-[var(--color-n-100)] border-r border-[var(--color-n-200)]',
        'transition-[width] duration-200 ease-in-out',
        collapsed ? 'w-14' : 'w-[220px]'
      )}
    >
      {/* Navigation list */}
      <div className="flex-1 flex flex-col min-h-0 pt-2">
        {/* Mobile close button */}
        {onClose && (
          <div className="md:hidden flex justify-end px-3 pb-2 border-b border-[var(--color-n-200)]">
            <button
              onClick={onClose}
              className="p-1 rounded text-[var(--color-n-400)] hover:text-[var(--color-n-700)]"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const content = (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center h-9 px-2.5 rounded text-xs font-medium transition-colors duration-[120ms] group relative',
                    isActive
                      ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] font-semibold'
                      : 'text-[var(--color-n-500)] hover:bg-[var(--color-n-150)] hover:text-[var(--color-n-700)]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active accent bar indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[var(--color-accent)] rounded-r" />
                    )}

                    <Icon
                      size={16}
                      className={cn(
                        'shrink-0 transition-colors',
                        isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-n-400)] group-hover:text-[var(--color-n-600)]',
                        !collapsed && 'mr-3'
                      )}
                    />

                    {!collapsed && (
                      <span className="truncate tracking-wide">{item.name}</span>
                    )}
                  </>
                )}
              </NavLink>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.to} content={item.name} side="right">
                  {content}
                </Tooltip>
              )
            }

            return content
          })}
        </nav>
      </div>

      {/* Footer: Operator profile + Collapse toggle */}
      <div className="border-t border-[var(--color-n-200)] bg-[var(--color-n-50)] shrink-0 p-2 flex flex-col gap-2">
        {/* Operator Badge */}
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded bg-[var(--color-n-100)] border border-[var(--color-n-200)]">
            <div className="w-7 h-7 rounded bg-[var(--color-n-150)] border border-[var(--color-n-200)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
              <UserCheck size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-medium text-[var(--color-n-700)] truncate">
                  OP-8492
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-status-live)]" />
              </div>
              <div className="text-[10px] text-[var(--color-n-400)] font-sans truncate">
                Shift 01 • Berth 4
              </div>
            </div>
          </div>
        ) : (
          <Tooltip content="Operator: OP-8492 (Shift 01)" side="right">
            <div className="w-9 h-9 mx-auto rounded bg-[var(--color-n-100)] border border-[var(--color-n-200)] flex items-center justify-center text-[var(--color-accent)] cursor-default">
              <UserCheck size={14} />
            </div>
          </Tooltip>
        )}

        {/* Rail Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className={cn(
            'hidden md:flex items-center justify-center h-7 rounded text-[var(--color-n-400)] hover:text-[var(--color-n-700)] hover:bg-[var(--color-n-150)] transition-colors text-xs',
            collapsed ? 'w-9 mx-auto' : 'w-full gap-2 px-2'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <>
              <ChevronLeft size={14} />
              <span className="text-[11px] text-[var(--color-n-400)] font-mono uppercase tracking-wider">
                Collapse Rail
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
