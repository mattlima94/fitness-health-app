import { useStore } from '../../lib/store'
import { getPhase, PHASES } from '../../lib/constants'

export default function WeekPicker() {
  const currentWeek = useStore((s) => s.currentWeek)
  const setCurrentWeek = useStore((s) => s.setCurrentWeek)

  return (
    <div className="mt-3 mb-2">
      {PHASES.map((phase) => (
        <div key={phase.id} className="mb-3">
          <div className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: phase.accent }}>
            Phase {phase.id}: {phase.name}
          </div>
          <div className="grid grid-cols-8 gap-1">
            {Array.from({ length: phase.weeks[1] - phase.weeks[0] + 1 }, (_, i) => {
              const week = phase.weeks[0] + i
              const isCurrent = week === currentWeek
              return (
                <button
                  key={week}
                  onClick={() => setCurrentWeek(week)}
                  className="py-1.5 rounded-md text-[11px] font-bold transition-all duration-150"
                  style={{
                    background: isCurrent ? phase.accent : 'rgba(255,255,255,0.02)',
                    border: isCurrent ? `2px solid ${phase.accent}` : '1px solid rgba(255,255,255,0.06)',
                    color: isCurrent ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {week}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
