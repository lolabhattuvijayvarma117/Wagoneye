import { useState, useEffect } from 'react'
import { TrainFront, Search, Bell, ChevronDown, Menu } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { StatusPill } from '@/components/ui/StatusPill'
import { IconButton } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'

interface TopbarProps {
  onMenuToggle?: () => void
  onAlertsClick?: () => void
  unreadAlertCount?: number
}

const YARDS = [
  { id: 'yard-04', name: 'Yard 04 — North Berth', code: 'Y-04' },
  { id: 'yard-02', name: 'Yard 02 — South Pier', code: 'Y-02' },
  { id: 'yard-01', name: 'Yard 01 — Central Siding', code: 'Y-01' },
]

export default function Topbar({ onMenuToggle, onAlertsClick, unreadAlertCount = 3 }: TopbarProps) {
  const [selectedYard, setSelectedYard] = useState(YARDS[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [time, setTime] = useState({ local: '', utc: '' })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const local = now.toLocaleTimeString('en-GB', { hour12: false })
      const utc = now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false })
      setTime({ local, utc })
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header
      className="h-12 w-full flex items-center justify-between px-4 sticky top-0 z-50 shrink-0 bg-[var(--color-n-100)] border-b border-[var(--color-n-200)]"
      style={{ boxShadow: 'var(--shadow-inset)' }}
    >
      {/* Left: Brand + Yard Selector */}
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <IconButton label="Toggle menu" size="sm" onClick={onMenuToggle} className="md:hidden">
            <Menu size={16} />
          </IconButton>
        )}

        {/* Wordmark */}
        <a href="/" className="flex items-center gap-2 select-none hover:opacity-90 transition-opacity">
          <span className="p-1 rounded bg-[var(--color-n-150)] text-[var(--color-accent)] border border-[var(--color-n-200)]">
            <TrainFront size={16} />
          </span>
          <span
            className="text-xs font-semibold tracking-wider text-[var(--color-n-800)] uppercase leading-none"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            WAGONEYE
          </span>
        </a>

        <div className="h-4 w-px bg-[var(--color-n-200)] hidden sm:block" />

        {/* Yard Selector Dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-[var(--color-n-150)] text-[var(--color-n-700)] hover:bg-[var(--color-n-200)] border border-[var(--color-n-200)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
              aria-label="Select Yard"
            >
              <span className="font-medium text-[var(--color-n-700)] truncate max-w-[160px] sm:max-w-none">
                {selectedYard.name}
              </span>
              <ChevronDown size={12} className="text-[var(--color-n-400)] shrink-0" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[200px] bg-[var(--color-n-150)] rounded-md p-1 shadow-[var(--shadow-float)] border border-[var(--color-n-200)] text-xs text-[var(--color-n-700)]"
              sideOffset={4}
            >
              {YARDS.map(yard => (
                <DropdownMenu.Item
                  key={yard.id}
                  onClick={() => setSelectedYard(yard)}
                  className="px-2.5 py-1.5 rounded cursor-pointer hover:bg-[var(--color-n-200)] hover:text-[var(--color-n-800)] flex items-center justify-between outline-none"
                >
                  <span>{yard.name}</span>
                  <span className="text-[10px] text-[var(--color-n-400)] font-mono leading-none">
                    {yard.code}
                  </span>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Center: Global Search */}
      <div className="hidden lg:flex items-center max-w-sm w-full mx-4">
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-n-400)] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search wagon ID, train ID, event ID..."
            className="w-full h-7 pl-8 pr-3 text-xs bg-[var(--color-n-150)] text-[var(--color-n-700)] placeholder-[var(--color-n-400)] rounded border border-[var(--color-n-200)] focus:outline-none focus:border-[var(--color-accent)] focus:bg-[var(--color-n-50)] transition-colors"
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </div>
      </div>

      {/* Right: Telemetry Clock, System Status, Alerts */}
      <div className="flex items-center gap-3">
        {/* Dynamic Clocks — fixed width to prevent jumping */}
        <div
          className="hidden sm:flex items-center gap-2 text-[11px] text-[var(--color-n-500)] bg-[var(--color-n-150)] px-2 py-0.5 rounded border border-[var(--color-n-200)] tabular-nums shrink-0"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span className="text-[var(--color-n-700)] leading-none">{time.local || '--:--:--'}</span>
          <span className="text-[9px] text-[var(--color-n-400)] leading-none">LOC</span>
          <span className="text-[var(--color-n-300)] leading-none">|</span>
          <span className="text-[var(--color-n-600)] leading-none">{time.utc || '--:--:--'}</span>
          <span className="text-[9px] text-[var(--color-n-400)] leading-none">UTC</span>
        </div>

        {/* Live Status Pill */}
        <StatusPill status="live" label="LIVE" />

        {/* Alerts Bell */}
        <Tooltip content={unreadAlertCount > 0 ? `${unreadAlertCount} active operator alerts` : 'No alerts'}>
          <div className="relative">
            <IconButton
              label="Operator Alerts"
              size="sm"
              onClick={onAlertsClick}
              className="text-[var(--color-n-600)] hover:text-[var(--color-n-800)]"
            >
              <Bell size={15} />
            </IconButton>
            {unreadAlertCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-black leading-none"
                style={{
                  background: 'var(--color-status-warn)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {unreadAlertCount}
              </span>
            )}
          </div>
        </Tooltip>
      </div>
    </header>
  )
}
