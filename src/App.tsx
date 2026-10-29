import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import WagonDetail from './pages/WagonDetail'
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
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="wagons" element={<Navigate to="/wagons/WGN-8492" replace />} />
            <Route path="wagons/:id" element={<WagonDetail />} />
            <Route path="rakes" element={<Navigate to="/dashboard" replace />} />
            <Route path="cameras" element={<Navigate to="/dashboard" replace />} />
            <Route path="reports" element={<Reports />} />
            <Route path="ask-ai" element={<AskAI />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
