import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { getPhase } from '../../lib/constants'

const tabs = [
  { path: '/', label: 'Today', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
  { path: '/workout', label: 'Workout', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { path: '/body', label: 'Body', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { path: '/labs', label: 'Labs', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' },
  { path: '/settings', label: 'More', icon: 'M4 6h16M4 12h16M4 18h16' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentWeek = useStore((s) => s.currentWeek)
  const phase = getPhase(currentWeek)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border" style={{ background: 'rgba(10,10,20,0.96)', backdropFilter: 'blur(20px)' }}>
      <div className="flex justify-center max-w-[480px] mx-auto" style={{ padding: '8px 0 max(12px, env(safe-area-inset-bottom))' }}>
        {tabs.map((tab) => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-5 py-1.5 bg-transparent border-none transition-colors duration-200"
              style={{ color: active ? phase.accent : 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
