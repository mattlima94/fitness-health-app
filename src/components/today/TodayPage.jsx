import { useStore } from '../../lib/store'
import { getPhase, PHASE_FOCUS, RED_FLAGS, WORKOUT_TYPES } from '../../lib/constants'
import { WORKOUT_DATA } from '../../lib/workoutData'
import PhaseIndicator from '../layout/PhaseIndicator'

export default function TodayPage() {
  const currentWeek = useStore((s) => s.currentWeek)
  const completedExercises = useStore((s) => s.completedExercises)
  const metrics = useStore((s) => s.metrics)
  const glp1Doses = useStore((s) => s.glp1Doses)
  const phase = getPhase(currentWeek)

  // GLP-1 status
  const lastDose = glp1Doses[0]
  const daysSinceLastDose = lastDose
    ? Math.floor((new Date() - new Date(lastDose.dose_date + 'T12:00:00')) / (1000 * 60 * 60 * 24))
    : null
  const glp1Due = daysSinceLastDose !== null && daysSinceLastDose >= 7

  const weekData = WORKOUT_DATA[currentWeek] || []

  // Calculate week completion
  let totalExercises = 0
  let doneExercises = 0
  weekData.forEach((day, di) => {
    day.exercises.forEach((_, ei) => {
      totalExercises++
      if (completedExercises[`${currentWeek}-${di}-${ei}`]) doneExercises++
    })
  })
  const weekPct = totalExercises ? Math.round((doneExercises / totalExercises) * 100) : 0

  // Latest weight
  const latestWeight = metrics.length > 0
    ? metrics.find(m => m.weight_lbs)?.weight_lbs
    : null

  // Progress ring params
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = `${(weekPct / 100) * circumference} ${circumference}`

  // Today's suggested workout (simple: Day A=Mon/Tue, B=Wed/Thu, C=Fri-Sun)
  const dayOfWeek = new Date().getDay()
  const suggestedDay = dayOfWeek <= 2 ? 0 : dayOfWeek <= 4 ? 1 : 2
  const todayWorkout = weekData[suggestedDay]
  const todayType = todayWorkout ? WORKOUT_TYPES[todayWorkout.type] : null

  const programPct = Math.round(((currentWeek - 1) / 51) * 100)

  return (
    <div className="px-4 pt-6 fade-in">
      {/* Header */}
      <div className="mb-5">
        <div className="text-[13px] font-semibold tracking-widest uppercase mb-1" style={{ opacity: 0.5 }}>
          Week {currentWeek} of 52
        </div>
        <h1 className="text-2xl font-extrabold mb-3">Return to Fitness</h1>
        <PhaseIndicator />
      </div>

      {/* Progress Ring + Stats */}
      <div className="rounded-2xl p-5 mb-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-5">
          <div className="relative">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle
                cx="48" cy="48" r={radius} fill="none"
                stroke={phase.accent} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                transform="rotate(-90 48 48)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-mono)' }}>{weekPct}%</span>
              <span className="text-[10px]" style={{ opacity: 0.4 }}>this week</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold mb-1">{doneExercises}/{totalExercises} exercises</div>
            <div className="h-1 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full" style={{ width: `${programPct}%`, background: phase.accent, transition: 'width 0.3s' }} />
            </div>
            <div className="text-[11px]" style={{ opacity: 0.4 }}>Program: {programPct}% complete</div>
            {latestWeight && (
              <div className="text-[11px] mt-1" style={{ opacity: 0.4 }}>
                Last weight: {latestWeight} lbs
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Workout Card */}
      {todayWorkout && (
        <div className="rounded-2xl p-5 mb-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[13px] font-semibold tracking-widest uppercase mb-2" style={{ opacity: 0.5 }}>
            Today's Workout
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{todayType?.icon}</span>
            <div>
              <div className="font-bold">Day {todayWorkout.day} — {todayType?.label}</div>
              <div className="text-xs" style={{ opacity: 0.5 }}>{todayWorkout.exercises.length} exercises</div>
            </div>
          </div>
          <div className="text-xs leading-relaxed" style={{ opacity: 0.5 }}>
            {todayWorkout.exercises.slice(0, 3).map(e => e.name).join(' · ')}
            {todayWorkout.exercises.length > 3 && ` + ${todayWorkout.exercises.length - 3} more`}
          </div>
        </div>
      )}

      {/* GLP-1 Status */}
      {lastDose && (
        <div className="rounded-2xl p-4 mb-3" style={{
          background: glp1Due ? 'rgba(255,152,0,0.06)' : 'rgba(171,71,188,0.06)',
          border: glp1Due ? '1px solid rgba(255,152,0,0.2)' : '1px solid rgba(171,71,188,0.15)',
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold tracking-widest uppercase" style={{ opacity: 0.5 }}>GLP-1</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(171,71,188,0.15)', color: '#CE93D8' }}>
                {lastDose.dosage_mg}mg
              </span>
            </div>
            <div className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: glp1Due ? '#FFB74D' : '#CE93D8' }}>
              {daysSinceLastDose}d ago
            </div>
          </div>
          {glp1Due && (
            <div className="text-xs mt-1.5" style={{ color: '#FFB74D' }}>
              Dose due — {daysSinceLastDose} days since last injection
            </div>
          )}
        </div>
      )}

      {/* Phase Focus */}
      <div className="rounded-2xl p-5 mb-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[13px] font-semibold tracking-widest uppercase mb-2" style={{ opacity: 0.5 }}>
          Phase {phase.id} Focus
        </div>
        <p className="text-sm leading-relaxed" style={{ opacity: 0.7 }}>
          {PHASE_FOCUS[phase.id]}
        </p>
      </div>

      {/* Red Flags */}
      <div className="rounded-2xl p-5 mb-3" style={{ background: 'rgba(239,83,80,0.06)', border: '1px solid rgba(239,83,80,0.15)' }}>
        <div className="text-[13px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#EF5350' }}>
          Stop If You Feel
        </div>
        {RED_FLAGS.map((flag, i) => (
          <div key={i} className="text-xs mb-1 pl-2" style={{ opacity: 0.6, lineHeight: 1.8, borderLeft: '2px solid rgba(239,83,80,0.3)' }}>
            {flag}
          </div>
        ))}
      </div>
    </div>
  )
}
