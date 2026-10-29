import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

export function Layout() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1280
    }
    return false
  })
  const [mobileOpen, setMobileOpen] = useState(false)

  // Auto-collapse rail on screen resize below 1280px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--color-n-0)] text-[var(--color-n-600)] overflow-hidden">
      {/* Topbar: 48px sticky */}
      <Topbar onMenuToggle={() => setMobileOpen(prev => !prev)} />

      {/* Main Container: Sidebar + Outlet */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <div
          className={`
            fixed md:static inset-y-12 left-0 z-40
            transform transition-transform duration-200 ease-in-out
            md:translate-x-0
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(prev => !prev)}
            onClose={() => setMobileOpen(false)}
          />
        </div>

        {/* Scrollable Viewport */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[var(--color-n-0)] p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
