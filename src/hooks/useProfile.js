import { useStore } from '../lib/store';
import { getPhase } from '../lib/constants';

export function useProfile() {
  const currentWeek = useStore((s) => s.currentWeek);
  const programStartDate = useStore((s) => s.programStartDate);
  const setCurrentWeek = useStore((s) => s.setCurrentWeek);
  const setStartDate = useStore((s) => s.setStartDate);

  const phase = getPhase(currentWeek);

  const getWeekDates = (week) => {
    if (!programStartDate) return null;
    const start = new Date(programStartDate);
    start.setDate(start.getDate() + (week - 1) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  };

  const getTodayDayIndex = () => {
    const dayOfWeek = new Date().getDay(); // 0=Sun
    // A=Mon/Tue, B=Wed/Thu, C=Fri/Sat/Sun
    if (dayOfWeek >= 1 && dayOfWeek <= 2) return 0; // Day A
    if (dayOfWeek >= 3 && dayOfWeek <= 4) return 1; // Day B
    return 2; // Day C
  };

  return {
    currentWeek,
    programStartDate,
    phase,
    setCurrentWeek,
    setStartDate,
    getWeekDates,
    getTodayDayIndex,
  };
}
