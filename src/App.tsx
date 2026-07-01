import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Contas from './pages/Contas'
import Relatorios from './pages/Relatorios'
import Config from './pages/Config'
import Login from './pages/Login'
import { api } from './lib/api'
import type { Profile } from './types'

export default function App() {
  const [user, setUser] = useState<Profile | null>(null)
  const [checking, setChecking] = useState(true)

  const refreshUser = async () => {
    try {
      setUser(await api.getSessionUser())
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => { refreshUser() }, [])

  if (checking) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bubu-base">
        <div className="w-12 h-12 rounded-2xl bg-bubu-gold flex items-center justify-center animate-pulse">
          <span className="text-bubu-base font-extrabold text-xl">B</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={refreshUser} />
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/contas" element={<Contas />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/config" element={<Config onSignOut={() => setUser(null)} />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
