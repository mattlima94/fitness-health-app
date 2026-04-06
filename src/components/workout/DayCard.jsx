import { ChevronDown } from 'lucide-react';
import { useStore } from '../../lib/store';
import { WORKOUT_TYPE_COLORS } from '../../lib/constants';
import ExerciseItem from './ExerciseItem';

export default function DayCard({
  day,
  dayIndex,
  week,
  weekData,
  isExpanded,
  onToggle,
}) {
  const getDayProgress = useStore((s) => s.getDayProgress);

  const progress = getDayProgress(week, dayIndex, day.exercises.length);
  const progressPercent = Math.round(progress * 100);
  const completedCount = Math.round(progress * day.exercises.length);

  const typeColor = WORKOUT_TYPE_COLORS[day.type] || '#999';

  return (
    <div className="rounded-2xl bg-white/5 overflow-hidden transition-all duration-300">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/10 transition-colors text-white"
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Day Badge */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-lg"
            style={{ backgroundColor: typeColor }}
          >
            {day.day}
          </div>

          {/* Day Info */}
          <div className="text-left flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Day {day.day}</h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                style={{ backgroundColor: typeColor + '40', color: typeColor }}
              >
                {day.type.charAt(0).toUpperCase() + day.type.slice(1)}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">{day.label}</p>
          </div>

          {/* Progress */}
          <div className="text-right">
            <p className="text-xs font-bold text-white/60">
              {completedCount}/{day.exercises.length}
            </p>
            <p className="text-xs text-white/40">{progressPercent}%</p>
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={20}
          className={`transition-transform duration-300 ml-2 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          style={{ color: typeColor }}
        />
      </button>

      {/* Exercises - Expandable */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-white/10 space-y-2 animate-fade-in">
          {day.exercises.map((exercise, exIndex) => (
            <ExerciseItem
              key={exIndex}
              exercise={exercise}
              week={week}
              dayIndex={dayIndex}
              exerciseIndex={exIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}
