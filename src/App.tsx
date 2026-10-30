import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import Corporate from './pages/Corporate'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Wagons from './pages/Wagons'
import WagonDetail from './pages/WagonDetail'
import Rakes from './pages/Rakes'
import Cameras from './pages/Cameras'
import Reports from './pages/Reports'
import AskAI from './pages/AskAI'
import Settings from './pages/Settings'
import { Layout } from './components/layout/Layout'

// Set dark mode by default
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', 'dark')
  document.documentElement.style.colorScheme = 'dark'
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Corporate & Operations Portal */}
          <Route path="/" element={<Corporate />} />
          <Route path="/login" element={<Login />} />

          {/* Authenticated Control Room Operations Shell */}
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
          </Route>
          <Route path="/wagons" element={<Layout />}>
            <Route index element={<Wagons />} />
            <Route path=":id" element={<WagonDetail />} />
          </Route>
          <Route path="/rakes" element={<Layout />}>
            <Route index element={<Rakes />} />
          </Route>
          <Route path="/cameras" element={<Layout />}>
            <Route index element={<Cameras />} />
          </Route>
          <Route path="/reports" element={<Layout />}>
            <Route index element={<Reports />} />
          </Route>
          <Route path="/ask-ai" element={<Layout />}>
            <Route index element={<AskAI />} />
          </Route>
          <Route path="/settings" element={<Layout />}>
            <Route index element={<Settings />} />
          </Route>

          {/* Catch-all redirect to corporate portal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
