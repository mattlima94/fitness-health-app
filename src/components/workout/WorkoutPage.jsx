import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useProfile } from '../../hooks/useProfile';
import { useWorkouts } from '../../hooks/useWorkouts';
import { isDeloadWeek, getPhaseColor } from '../../lib/constants';
import DayCard from './DayCard';
import RestTimer from './RestTimer';
import WeekPicker from './WeekPicker';
import { showToast } from '../layout/Toast';

export default function WorkoutPage() {
  const currentWeek = useStore((s) => s.currentWeek);
  const setCurrentWeek = useStore((s) => s.setCurrentWeek);
  const showTimer = useStore((s) => s.showTimer);
  const weekPickerOpen = useStore((s) => s.weekPickerOpen);
  const selectedDay = useStore((s) => s.selectedDay);
  const setSelectedDay = useStore((s) => s.setSelectedDay);

  const { getTodayDayIndex } = useProfile();
  const { weekPlan, weekProgress } = useWorkouts();

  // Initialize selectedDay to today when component mounts
  useEffect(() => {
    if (selectedDay === null) {
      setSelectedDay(getTodayDayIndex());
    }
  }, []);

  const handlePrevWeek = () => {
    setCurrentWeek(currentWeek - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeek(currentWeek + 1);
  };

  const weekProgressPercent = Math.round(weekProgress * 100);
  const isDeload = isDeloadWeek(currentWeek);
  const phaseColor = getPhaseColor(currentWeek);

  return (
    <div className="p-4">
      {/* Week Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevWeek}
          disabled={currentWeek === 1}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all text-white"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Week {currentWeek}</h1>
          <p className="text-white/60 text-sm">52-week program</p>
        </div>

        <button
          onClick={handleNextWeek}
          disabled={currentWeek === 52}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all text-white"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Week Picker Button */}
      <button
        onClick={() => useStore.setState({ weekPickerOpen: !weekPickerOpen })}
        className="w-full px-4 py-2 mb-4 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-white"
      >
        Week Picker
      </button>

      {/* Deload Banner */}
      {isDeload && (
        <div className="mb-4 p-4 rounded-xl bg-blue-500/15 border border-blue-500/30">
          <p className="text-blue-100 text-sm font-medium">
            ♻️ Recovery Week — lighter on purpose
          </p>
          <p className="text-blue-200/60 text-xs mt-1">
            Focus on mobility and active recovery
          </p>
        </div>
      )}

      {/* Week Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-white/60">
            WEEK PROGRESS
          </p>
          <p className="text-xs font-bold" style={{ color: phaseColor }}>
            {weekProgressPercent}%
          </p>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${weekProgressPercent}%`,
              backgroundColor: phaseColor,
            }}
          />
        </div>
      </div>

      {/* Day Cards */}
      <div className="space-y-3">
        {weekPlan.map((day, dayIndex) => (
          <DayCard
            key={dayIndex}
            day={day}
            dayIndex={dayIndex}
            week={currentWeek}
            weekData={weekPlan}
            isExpanded={selectedDay === dayIndex}
            onToggle={() =>
              setSelectedDay(selectedDay === dayIndex ? null : dayIndex)
            }
          />
        ))}
      </div>

      {/* Rest Timer Overlay */}
      {showTimer && <RestTimer />}

      {/* Week Picker Modal */}
      {weekPickerOpen && <WeekPicker />}
    </div>
  );
}
