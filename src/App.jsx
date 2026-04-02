import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './lib/store'
import { supabase } from './lib/supabase'
import AuthGate from './components/auth/AuthGate'
import BottomNav from './components/layout/BottomNav'
import Toast from './components/layout/Toast'
import TodayPage from './components/today/TodayPage'
import WorkoutPage from './components/workout/WorkoutPage'
import BodyPage from './components/body/BodyPage'
import LabsPage from './components/labs/LabsPage'
import InsightsPage from './components/insights/InsightsPage'
import SettingsPage from './components/settings/SettingsPage'

export default function App() {
  const loadData = useStore((s) => s.loadData)
  const loading = useStore((s) => s.loading)
  const authenticated = useStore((s) => s.authenticated)

  useEffect(() => {
    loadData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        loadData()
      }
    })

    return () => subscription.unsubscribe()
  }, [loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return <AuthGate />
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/body" element={<BodyPage />} />
        <Route path="/labs" element={<LabsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
      <Toast />
    </>
  )
}
