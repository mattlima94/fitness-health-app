import { useStore } from '../../lib/store';
import { useWorkouts } from '../../hooks/useWorkouts';
import { WORKOUT_TYPE_COLORS } from '../../lib/constants';
import { ArrowRight, Check } from 'lucide-react';

export default function TodayWorkout({ day, dayIndex }) {
  const setActiveTab = useStore((s) => s.setActiveTab);
  const setSelectedDay = useStore((s) => s.setSelectedDay);
  const currentWeek = useStore((s) => s.currentWeek);
  const { getDayProgress } = useWorkouts();

  // Calculate total duration and exercise count
  const exerciseCount = day.exercises.length;
  const totalDuration = day.exercises.reduce((sum, ex) => {
    const match = ex.duration.match(/(\d+)/);
    return sum + (match ? parseInt(match[0]) : 0);
  }, 0);

  // Get progress for today's workout
  const progress = getDayProgress(currentWeek, dayIndex, exerciseCount);
  const progressPercent = Math.round(progress * 100);
  const isCompleted = progressPercent === 100;

  // Get workout type color
  const workoutColor = WORKOUT_TYPE_COLORS[day.type] || '#fff';

  // Handle start workout button
  const handleStartWorkout = () => {
    setSelectedDay(dayIndex);
    setActiveTab('workout');
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 animate-fade-in">
      {/* Header with type badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Workout type badge */}
            <div
              className="px-2 py-1 rounded-md text-xs font-semibold text-white"
              style={{ backgroundColor: `${workoutColor}20`, color: workoutColor }}
            >
              {day.type.charAt(0).toUpperCase() + day.type.slice(1)}
            </div>
          </div>
          <h3 className="text-lg font-bold text-white">
            Day {day.day}
          </h3>
        </div>

        {/* Completed checkmark */}
        {isCompleted && (
          <div className="flex-shrink-0 flex items-center gap-1">
            <Check size={20} style={{ color: workoutColor }} />
            <span className="text-xs font-semibold text-white/70">
              Done
            </span>
          </div>
        )}
      </div>

      {/* Exercise count and duration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">
            {exerciseCount} exercises
          </span>
          <span className="text-white font-semibold">
            ~{totalDuration}m
          </span>
        </div>

        {/* Progress bar */}
        {!isCompleted && (
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                backgroundColor: workoutColor,
                width: `${progressPercent}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleStartWorkout}
        className="w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 group"
        style={{
          backgroundColor: `${workoutColor}20`,
          color: workoutColor,
          border: `1px solid ${workoutColor}40`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${workoutColor}30`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${workoutColor}20`;
        }}
      >
        <span>
          {isCompleted ? 'View Workout' : 'Start Workout'}
        </span>
        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Completion status text */}
      {isCompleted ? (
        <p className="text-xs text-white/60 text-center">
          All exercises completed! Great work.
        </p>
      ) : progressPercent > 0 ? (
        <p className="text-xs text-white/60 text-center">
          {progressPercent}% complete — finish strong
        </p>
      ) : null}
    </div>
  );
}
