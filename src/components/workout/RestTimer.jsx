import { useEffect } from 'react'
import { useStore } from '../../lib/store'
import { getPhase } from '../../lib/constants'

export default function RestTimer() {
  const timerSeconds = useStore((s) => s.timerSeconds)
  const timerRunning = useStore((s) => s.timerRunning)
  const tickTimer = useStore((s) => s.tickTimer)
  const stopTimer = useStore((s) => s.stopTimer)
  const currentWeek = useStore((s) => s.currentWeek)
  const phase = getPhase(currentWeek)

  useEffect(() => {
    if (!timerRunning) return
    const interval = setInterval(tickTimer, 1000)
    return () => clearInterval(interval)
  }, [timerRunning, tickTimer])

  const mins = Math.floor(timerSeconds / 60)
  const secs = timerSeconds % 60
  const display = `${mins}:${secs.toString().padStart(2, '0')}`

  return (
    <div className="fixed bottom-20 left-0 right-0 z-[100] px-4 max-w-[480px] mx-auto">
      <div className="rounded-2xl p-5" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -4px 30px rgba(0,0,0,0.5)' }}>
        <div className="text-center mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '48px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: phase.accent }}>
          {display}
        </div>
        <div className="flex gap-3">
          <button
            onClick={stopTimer}
            className="flex-1 py-3 rounded-xl border-none text-white font-bold"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            Dismiss
          </button>
          <button
            onClick={() => useStore.setState({ timerRunning: !timerRunning })}
            className="flex-1 py-3 rounded-xl border-none text-white font-bold"
            style={{ background: phase.accent }}
          >
            {timerRunning ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>
    </div>
  )
}
