import { Check, Circle } from 'lucide-react';
import { useStore } from '../../lib/store';
import { showToast } from '../layout/Toast';

export default function ExerciseItem({
  exercise,
  week,
  dayIndex,
  exerciseIndex,
}) {
  const toggleExercise = useStore((s) => s.toggleExercise);
  const isCompleted = useStore((s) =>
    s.completedExercises[`${week}-${dayIndex}-${exerciseIndex}`]
  );

  const handleToggle = () => {
    toggleExercise(week, dayIndex, exerciseIndex);
    const message = isCompleted ? 'Exercise unchecked' : 'Exercise completed ✓';
    showToast(message, 'success');
  };

  return (
    <button
      onClick={handleToggle}
      className={`w-full p-3 rounded-lg flex items-start gap-3 transition-all text-white ${
        isCompleted
          ? 'bg-white/10 opacity-60'
          : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-0.5">
        {isCompleted ? (
          <div className="w-5 h-5 rounded-full bg-[var(--phase-accent)] flex items-center justify-center">
            <Check size={14} className="text-black font-bold" />
          </div>
        ) : (
          <Circle
            size={20}
            className="text-white/60"
            strokeWidth={1.5}
          />
        )}
      </div>

      {/* Exercise Details */}
      <div className="text-left flex-1 min-w-0">
        <p
          className={`font-semibold text-sm ${
            isCompleted ? 'line-through text-[var(--color-text-muted)]' : ''
          }`}
        >
          {exercise.name}
        </p>
        <p
          className={`text-xs mt-0.5 ${
            isCompleted
              ? 'text-white/40'
              : 'text-white/60'
          }`}
        >
          {exercise.detail}
        </p>
      </div>

      {/* Duration */}
      <div className="flex-shrink-0 text-right">
        <p
          className={`text-xs font-mono font-semibold ${
            isCompleted ? 'text-white/40' : 'text-white'
          }`}
        >
          {exercise.duration}
        </p>
      </div>
    </button>
  );
}
