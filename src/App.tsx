import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WagonDetail from './pages/WagonDetail';
import Reports from './pages/Reports';
import AskAI from './pages/AskAI';
import Settings from './pages/Settings';
import { useEffect } from 'react';

function App() {
  // Simple dark mode setup
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wagons/:id" element={<WagonDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ask-ai" element={<AskAI />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
