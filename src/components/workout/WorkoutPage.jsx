import { useState } from 'react'
import { useStore } from '../../lib/store'
import { getPhase, WORKOUT_TYPES } from '../../lib/constants'
import { WORKOUT_DATA } from '../../lib/workoutData'
import PhaseIndicator from '../layout/PhaseIndicator'
import DayDetail from './DayDetail'
import WeekPicker from './WeekPicker'
import RestTimer from './RestTimer'

export default function WorkoutPage() {
  const currentWeek = useStore((s) => s.currentWeek)
  const completedExercises = useStore((s) => s.completedExercises)
  const weekPickerOpen = useStore((s) => s.weekPickerOpen)
  const showTimer = useStore((s) => s.showTimer)
  const [selectedDay, setSelectedDay] = useState(null)
  const phase = getPhase(currentWeek)
  const weekData = WORKOUT_DATA[currentWeek] || []

  const dayCompletion = (dayIdx) => {
    const exercises = weekData[dayIdx]?.exercises || []
    const done = exercises.filter((_, i) => completedExercises[`${currentWeek}-${dayIdx}-${i}`]).length
    return { done, total: exercises.length, pct: exercises.length ? Math.round((done / exercises.length) * 100) : 0 }
  }

  if (selectedDay !== null) {
    return (
      <DayDetail
        week={currentWeek}
        dayIndex={selectedDay}
        dayData={weekData[selectedDay]}
        onBack={() => setSelectedDay(null)}
      />
    )
  }

  return (
    <div className="px-4 pt-6 fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[13px] font-semibold tracking-widest uppercase mb-1" style={{ opacity: 0.5 }}>
            Week {currentWeek}
          </div>
          <h1 className="text-2xl font-extrabold">Workout Plan</h1>
        </div>
        <button
          onClick={() => useStore.setState({ weekPickerOpen: !weekPickerOpen })}
          className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-transparent"
          style={{ borderColor: phase.accent, color: phase.accent }}
        >
          Wk {currentWeek}
        </button>
      </div>

      <PhaseIndicator />

      {weekPickerOpen && <WeekPicker />}

      <div className="mt-4">
        {weekData.map((day, idx) => {
          const comp = dayCompletion(idx)
          const typeInfo = WORKOUT_TYPES[day.type]
          const isComplete = comp.pct === 100

          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className="flex items-center gap-4 w-full text-left p-5 mb-3 rounded-2xl transition-all duration-200"
              style={{
                background: isComplete ? `rgba(${phase.id === 1 ? '102,187,106' : phase.id === 2 ? '66,165,245' : phase.id === 3 ? '255,152,0' : '171,71,188'},0.08)` : 'rgba(255,255,255,0.035)',
                border: isComplete ? `1px solid color-mix(in srgb, ${phase.accent} 40%, transparent)` : '1px solid rgba(255,255,255,0.06)',
                color: '#e0e0ec',
              }}
            >
              <div
                className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-lg font-extrabold shrink-0"
                style={{
                  background: isComplete ? phase.accent : 'rgba(255,255,255,0.06)',
                  color: isComplete ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              >
                {day.day}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-sm">Day {day.day}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}>
                    {typeInfo.label}
                  </span>
                </div>
                <div className="text-xs mb-2" style={{ opacity: 0.5 }}>
                  {day.label} · {day.exercises.length} exercises
                </div>
                <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${comp.pct}%`, background: phase.accent }}
                  />
                </div>
                <div className="text-[10px] mt-1" style={{ opacity: 0.3 }}>
                  {comp.done}/{comp.total} complete
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {showTimer && <RestTimer />}
    </div>
  )
}
