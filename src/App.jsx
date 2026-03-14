import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './lib/store'
import BottomNav from './components/layout/BottomNav'
import Toast from './components/layout/Toast'
import TodayPage from './components/today/TodayPage'
import WorkoutPage from './components/workout/WorkoutPage'
import BodyPage from './components/body/BodyPage'
import InsightsPage from './components/insights/InsightsPage'
import SettingsPage from './components/settings/SettingsPage'

export default function App() {
  const loadData = useStore((s) => s.loadData)
  const loading = useStore((s) => s.loading)

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-muted text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<TodayPage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/body" element={<BodyPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
      <Toast />
    </>
  )
}
