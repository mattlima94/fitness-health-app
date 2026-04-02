import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../lib/store'
import { getPhase } from '../../lib/constants'

export default function SettingsPage() {
  const currentWeek = useStore((s) => s.currentWeek)
  const setCurrentWeek = useStore((s) => s.setCurrentWeek)
  const signOut = useStore((s) => s.signOut)
  const showToast = useStore((s) => s.showToast)
  const phase = getPhase(currentWeek)
  const navigate = useNavigate()
  const [weekInput, setWeekInput] = useState(currentWeek.toString())

  const handleWeekChange = (e) => {
    e.preventDefault()
    const w = parseInt(weekInput)
    if (w >= 1 && w <= 52) {
      setCurrentWeek(w)
      showToast(`Switched to Week ${w}`)
    }
  }

  return (
    <div className="px-4 pt-6 fade-in">
      <h1 className="text-2xl font-extrabold mb-5">Settings</h1>

      {/* Quick Links */}
      <div className="rounded-2xl p-5 mb-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[13px] font-semibold tracking-widest uppercase mb-3" style={{ opacity: 0.5 }}>
          Pages
        </div>
        <button
          onClick={() => navigate('/insights')}
          className="flex items-center justify-between w-full py-3 bg-transparent border-none text-left"
          style={{ color: '#e0e0ec', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">💡</span>
            <span className="text-sm">Phase Insights & Milestones</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.3 }}>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Current Week */}
      <div className="rounded-2xl p-5 mb-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[13px] font-semibold tracking-widest uppercase mb-3" style={{ opacity: 0.5 }}>
          Current Week
        </div>
        <div className="text-xs mb-3" style={{ opacity: 0.4 }}>
          Auto-calculated from start date (Apr 6, 2026). Override below if needed.
        </div>
        <form onSubmit={handleWeekChange} className="flex gap-3">
          <input
            type="number"
            min="1"
            max="52"
            value={weekInput}
            onChange={(e) => setWeekInput(e.target.value)}
            className="flex-1 py-3 px-3.5 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl border-none text-white text-sm font-bold"
            style={{ background: phase.accent }}
          >
            Set
          </button>
        </form>
      </div>

      {/* Device Sync Status */}
      <div className="rounded-2xl p-5 mb-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[13px] font-semibold tracking-widest uppercase mb-3" style={{ opacity: 0.5 }}>
          Device Connections
        </div>
        {[
          { name: 'Omron WiFi Scale', status: 'Phase 2', icon: '⚖️' },
          { name: 'Omron BP Cuff', status: 'Phase 2-3', icon: '💓' },
          { name: 'Garmin Watch', status: 'Phase 3', icon: '⌚' },
          { name: 'Oura Ring', status: 'Phase 2', icon: '💍' },
          { name: 'NordicTrack / iFit', status: 'Phase 3', icon: '🏃' },
          { name: 'Function Health', status: 'Phase 4', icon: '🧪' },
        ].map((device, i) => (
          <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div className="flex items-center gap-2.5">
              <span className="text-base">{device.icon}</span>
              <span className="text-sm">{device.name}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', opacity: 0.5 }}>
              {device.status}
            </span>
          </div>
        ))}
      </div>

      {/* App Info */}
      <div className="rounded-2xl p-5 mb-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[13px] font-semibold tracking-widest uppercase mb-2" style={{ opacity: 0.5 }}>
          About
        </div>
        <div className="text-xs leading-relaxed" style={{ opacity: 0.5 }}>
          Return to Fitness — 52 Week Tracker<br />
          Built with React + Supabase + Vercel<br />
          Program start: April 6, 2026
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={signOut}
        className="w-full py-3.5 rounded-[14px] border-none text-sm font-bold tracking-wider mb-4"
        style={{ background: 'rgba(239,83,80,0.1)', color: '#EF5350' }}
      >
        Sign Out
      </button>
    </div>
  )
}
