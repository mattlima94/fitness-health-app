import { useStore } from '../../lib/store'
import { getPhase } from '../../lib/constants'
import RestTimer from './RestTimer'

export default function DayDetail({ week, dayIndex, dayData, onBack }) {
  const completedExercises = useStore((s) => s.completedExercises)
  const toggleExercise = useStore((s) => s.toggleExercise)
  const startTimer = useStore((s) => s.startTimer)
  const showTimer = useStore((s) => s.showTimer)
  const showToast = useStore((s) => s.showToast)
  const phase = getPhase(week)

  if (!dayData) return null

  const handleToggle = (exerciseIndex) => {
    const key = `${week}-${dayIndex}-${exerciseIndex}`
    const wasCompleted = completedExercises[key]
    toggleExercise(week, dayIndex, exerciseIndex)
    if (!wasCompleted) {
      showToast('Exercise completed!')
    }
  }

  return (
    <div className="px-4 pt-6 fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 bg-transparent border-none mb-4 text-sm font-semibold"
        style={{ color: phase.accent }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Week {week}
      </button>

      <h1 className="text-2xl font-extrabold mb-1">Day {dayData.day}</h1>
      <p className="text-xs mb-5" style={{ opacity: 0.5 }}>
        {dayData.label} · {dayData.type.charAt(0).toUpperCase() + dayData.type.slice(1)}
      </p>

      <div className="space-y-1.5">
        {dayData.exercises.map((exercise, idx) => {
          const key = `${week}-${dayIndex}-${idx}`
          const done = !!completedExercises[key]

          return (
            <button
              key={idx}
              onClick={() => handleToggle(idx)}
              className="flex items-start gap-3.5 w-full text-left p-3.5 rounded-[14px] transition-all duration-200"
              style={{
                background: done ? `rgba(${phase.id === 1 ? '102,187,106' : phase.id === 2 ? '66,165,245' : phase.id === 3 ? '255,152,0' : '171,71,188'},0.08)` : 'rgba(255,255,255,0.03)',
                border: done ? `1px solid color-mix(in srgb, ${phase.accent} 30%, transparent)` : '1px solid rgba(255,255,255,0.04)',
                color: '#e0e0ec',
              }}
            >
              <div
                className="w-7 h-7 rounded-lg shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200"
                style={{ background: done ? phase.accent : 'rgba(255,255,255,0.06)' }}
              >
                {done && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold mb-0.5" style={{ textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.5 : 1 }}>
                  {exercise.name}
                </div>
                <div className="text-xs leading-relaxed" style={{ opacity: 0.5 }}>{exercise.detail}</div>
                <div className="text-[11px] mt-1" style={{ opacity: 0.3 }}>{exercise.duration}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Rest Timer Button */}
      <div className="mt-6 mb-4">
        <button
          onClick={() => startTimer(60)}
          className="w-full py-3.5 rounded-[14px] border-none text-white text-sm font-bold tracking-wider transition-opacity"
          style={{ background: phase.accent }}
        >
          Start Rest Timer (60s)
        </button>
        <div className="flex gap-2 mt-2">
          {[30, 45, 90, 120].map((s) => (
            <button
              key={s}
              onClick={() => startTimer(s)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold border bg-transparent"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
            >
              {s}s
            </button>
          ))}
        </div>
      </div>

      {showTimer && <RestTimer />}
    </div>
  )
}
