import { useState } from 'react';
import { useStore } from '../../lib/store';
import { useProfile } from '../../hooks/useProfile';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useMetrics } from '../../hooks/useMetrics';
import { WORKOUT_PLAN } from '../../lib/workoutData';
import { isDeloadWeek, RED_FLAGS } from '../../lib/constants';
import { ChevronDown, ChevronUp, AlertTriangle, Flame } from 'lucide-react';
import TodayWorkout from './TodayWorkout';

export default function TodayPage() {
  const { currentWeek, phase, getTodayDayIndex } = useProfile();
  const { weekPlan, streak } = useWorkouts();
  const { latestMetric, weightChange } = useMetrics();
  const [showRedFlags, setShowRedFlags] = useState(false);

  const isDeload = isDeloadWeek(currentWeek);
  const todayDayIndex = getTodayDayIndex();
  const todayWorkout = weekPlan[todayDayIndex] || null;

  // Format date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-4 pt-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">
          {getGreeting()}, Mateus
        </h1>
        <p className="text-sm text-white/60">
          {dateStr} · Week {currentWeek}
        </p>
      </div>

      {/* Phase Indicator Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
        {/* Phase label and accent dot */}
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: phase.accent }}
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              Phase {phase.id} — {phase.name}
            </p>
          </div>
        </div>

        {/* Deload badge if applicable */}
        {isDeload && (
          <div className="flex items-center gap-2 px-3 py-2 bg-white/8 rounded-lg border border-white/10 w-fit">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: phase.accent }}
            />
            <span className="text-xs font-medium text-white">
              Recovery Week — lighter on purpose
            </span>
          </div>
        )}
      </div>

      {/* Today's Workout Card */}
      {todayWorkout ? (
        <TodayWorkout day={todayWorkout} dayIndex={todayDayIndex} />
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-sm text-white/60">
            No workout data for today
          </p>
        </div>
      )}

      {/* Streak Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Flame size={24} style={{ color: phase.accent }} />
          <div>
            <p className="text-2xl font-bold text-white">
              {streak}
            </p>
            <p className="text-xs text-white/60">
              {streak === 1 ? 'week' : 'weeks'} consistent
            </p>
          </div>
        </div>
        <p className="text-xs text-white/60 mt-3">
          Keep it going!
        </p>
      </div>

      {/* Latest Metric Card */}
      {latestMetric && latestMetric.weight ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/60 mb-2">Latest Check-in</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">
              {latestMetric.weight}
            </p>
            <p className="text-sm text-white/60">lbs</p>
          </div>
          {weightChange !== null && (
            <p className={`text-sm mt-2 ${
              weightChange < 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {weightChange < 0 ? '↓' : '↑'}{Math.abs(weightChange)} lbs
            </p>
          )}
          {latestMetric.date && (
            <p className="text-xs text-white/60 mt-2">
              Last logged: {new Date(latestMetric.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </p>
          )}
        </div>
      ) : null}

      {/* Red Flags Section */}
      <div className="space-y-2">
        <button
          onClick={() => setShowRedFlags(!showRedFlags)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/8 transition-colors"
        >
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0" />
          <span className="text-sm font-medium text-white flex-1 text-left">
            Red Flags to Watch
          </span>
          {showRedFlags ? (
            <ChevronUp size={18} className="text-white/40" />
          ) : (
            <ChevronDown size={18} className="text-white/40" />
          )}
        </button>

        {showRedFlags && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-2 animate-fade-in">
            {RED_FLAGS.map((flag, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-amber-400 text-sm flex-shrink-0">•</span>
                <p className="text-sm text-amber-100/90">{flag}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom spacing for nav bar */}
      <div className="h-4" />
    </div>
  );
}
