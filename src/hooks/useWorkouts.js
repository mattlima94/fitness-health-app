import { useStore } from '../lib/store';
import { WORKOUT_PLAN } from '../lib/workoutData';

export function useWorkouts() {
  const currentWeek = useStore((s) => s.currentWeek);
  const completedExercises = useStore((s) => s.completedExercises);
  const toggleExercise = useStore((s) => s.toggleExercise);
  const getDayProgress = useStore((s) => s.getDayProgress);
  const getWeekProgress = useStore((s) => s.getWeekProgress);
  const getStreak = useStore((s) => s.getStreak);

  const weekPlan = WORKOUT_PLAN[currentWeek] || [];

  const isCompleted = (week, dayIdx, exIdx) => {
    return !!completedExercises[`${week}-${dayIdx}-${exIdx}`];
  };

  const weekProgress = getWeekProgress(currentWeek, WORKOUT_PLAN);
  const streak = getStreak(WORKOUT_PLAN);

  return {
    plan: WORKOUT_PLAN,
    weekPlan,
    currentWeek,
    isCompleted,
    toggleExercise,
    getDayProgress,
    getWeekProgress,
    weekProgress,
    streak,
  };
}
