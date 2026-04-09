import { useState } from 'react';
import { Check, Circle, Info } from 'lucide-react';
import { useStore } from '../../lib/store';
import { showToast } from '../layout/Toast';
import { getExerciseInfo } from '../../lib/exerciseLibrary';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const exerciseInfo = getExerciseInfo(exercise.name);

  // Prefer locally-bundled GIF (served from Vercel /public/exercises/)
  // and fall back to the static.exercisedb.dev CDN if the local file is
  // missing. If both fail we hide the media entirely.
  const initialSrc = exerciseInfo?.gif
    ? exerciseInfo.gif.replace(
        'https://static.exercisedb.dev/media/',
        '/exercises/'
      )
    : null;
  const [gifSrc, setGifSrc] = useState(initialSrc);
  const [gifFailed, setGifFailed] = useState(false);

  const handleGifError = () => {
    // First failure: swap local path for the CDN URL.
    if (gifSrc && gifSrc.startsWith('/exercises/') && exerciseInfo?.gif) {
      setGifSrc(exerciseInfo.gif);
      return;
    }
    // Second failure: give up and hide the image.
    setGifFailed(true);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    toggleExercise(week, dayIndex, exerciseIndex);
    const message = isCompleted ? 'Exercise unchecked' : 'Exercise completed ✓';
    showToast(message, 'success');
  };

  const handleNameClick = () => {
    if (exerciseInfo) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      className={`w-full rounded-lg transition-all text-white ${
        isCompleted
          ? 'bg-white/10 opacity-60'
          : 'bg-white/5 hover:bg-white/10'
      }`}
    >
      {/* Main Exercise Row */}
      <div className="p-3 flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className="flex-shrink-0 mt-0.5 flex-none cursor-pointer hover:opacity-80 transition-opacity"
        >
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
        </button>

        {/* Exercise Details */}
        <div className="text-left flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleNameClick}
              className={`font-semibold text-sm ${
                isCompleted ? 'line-through text-[var(--color-text-muted)]' : ''
              } ${exerciseInfo ? 'cursor-pointer hover:text-[var(--phase-accent)] transition-colors' : ''}`}
            >
              {exercise.name}
            </button>
            {exerciseInfo && (
              <Info
                size={14}
                className="flex-shrink-0 text-white/40 hover:text-white/60 transition-colors cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
              />
            )}
          </div>
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
      </div>

      {/* Expanded Form & Tutorial Section */}
      {isExpanded && exerciseInfo && (
        <div className="px-3 pb-3 pt-0 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Animated GIF Demo */}
          {gifSrc && !gifFailed && (
            <div className="mt-3 rounded-md overflow-hidden bg-white">
              <img
                src={gifSrc}
                alt={`${exercise.name} demonstration`}
                loading="lazy"
                onError={handleGifError}
                className="w-full h-auto object-contain max-h-64"
              />
            </div>
          )}

          {/* Form Description */}
          <p className="text-xs text-white/60 mt-3 leading-relaxed">
            {exerciseInfo.description}
          </p>
        </div>
      )}
    </div>
  );
}
