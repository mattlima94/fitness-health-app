import { useState } from 'react'
import { useStore } from '../../lib/store'
import { getPhase } from '../../lib/constants'

export default function SettingsPage() {
  const currentWeek = useStore((s) => s.currentWeek)
  const setCurrentWeek = useStore((s) => s.setCurrentWeek)
  const showToast = useStore((s) => s.showToast)
  const phase = getPhase(currentWeek)
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

      {/* Current Week */}
      <div className="rounded-2xl p-5 mb-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[13px] font-semibold tracking-widest uppercase mb-3" style={{ opacity: 0.5 }}>
          Current Week
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
          Phase 1 — March 2026
        </div>
      </div>
    </div>
  )
}
