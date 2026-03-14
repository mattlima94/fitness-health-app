import { useStore } from '../../lib/store'
import { PHASES, MILESTONES, PHASE_FOCUS, getPhase } from '../../lib/constants'

export default function InsightsPage() {
  const currentWeek = useStore((s) => s.currentWeek)
  const currentPhase = getPhase(currentWeek)

  return (
    <div className="px-4 pt-6 fade-in">
      <h1 className="text-2xl font-extrabold mb-5">Insights</h1>

      {/* Phase Overview */}
      {PHASES.map((phase) => {
        const isCurrent = phase.id === currentPhase.id
        const isPast = phase.weeks[1] < currentWeek
        const milestones = MILESTONES[phase.id] || []

        return (
          <div
            key={phase.id}
            className="rounded-2xl p-5 mb-3"
            style={{
              background: isCurrent ? `rgba(${phase.id === 1 ? '102,187,106' : phase.id === 2 ? '66,165,245' : phase.id === 3 ? '255,152,0' : '171,71,188'},0.08)` : 'rgba(255,255,255,0.035)',
              border: isCurrent ? `1px solid ${phase.accent}40` : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider"
                  style={{
                    background: isCurrent ? phase.accent : 'transparent',
                    border: `1.5px solid ${phase.accent}`,
                    color: isCurrent ? '#fff' : phase.accent,
                  }}
                >
                  PHASE {phase.id}
                </span>
                <span className="text-sm font-bold">{phase.name}</span>
              </div>
              <span className="text-[10px]" style={{ opacity: 0.4 }}>
                Wk {phase.weeks[0]}-{phase.weeks[1]}
              </span>
            </div>

            <p className="text-xs mb-3 leading-relaxed" style={{ opacity: 0.6 }}>
              {PHASE_FOCUS[phase.id]}
            </p>

            <div className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ opacity: 0.4 }}>
              Milestones
            </div>
            {milestones.map((ms, i) => (
              <div key={i} className="flex items-start gap-2 mb-1.5">
                <div
                  className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center shrink-0 mt-px"
                  style={{
                    border: isPast ? `1.5px solid ${phase.accent}` : '1.5px solid rgba(255,255,255,0.15)',
                    background: isPast ? phase.accent : 'transparent',
                  }}
                >
                  {isPast && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-xs" style={{ opacity: 0.6, lineHeight: 1.5 }}>{ms}</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
