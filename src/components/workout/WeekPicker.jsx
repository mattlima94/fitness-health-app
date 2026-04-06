import { X } from 'lucide-react';
import { useStore } from '../../lib/store';
import { PHASES } from '../../lib/constants';

export default function WeekPicker() {
  const currentWeek = useStore((s) => s.currentWeek);
  const setCurrentWeek = useStore((s) => s.setCurrentWeek);
  const toggleWeekPicker = useStore((s) => s.toggleWeekPicker);
  const completedExercises = useStore((s) => s.completedExercises);

  // Check if a week has any progress
  const hasProgress = (week) => {
    for (let d = 0; d < 3; d++) {
      for (let e = 0; e < 10; e++) {
        if (completedExercises[`${week}-${d}-${e}`]) {
          return true;
        }
      }
    }
    return false;
  };

  const handleSelectWeek = (week) => {
    setCurrentWeek(week);
    toggleWeekPicker();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end backdrop-blur-md"
      onClick={toggleWeekPicker}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-white/5 border-t border-white/10 rounded-t-3xl p-6 animate-slide-up text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Select Week</h2>
          <button
            onClick={toggleWeekPicker}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Weeks Grid */}
        <div className="grid grid-cols-8 gap-2 max-h-96 overflow-y-auto pr-2">
          {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => {
            const phase = PHASES.find(
              (p) => week >= p.weeks[0] && week <= p.weeks[1]
            );
            const isActive = week === currentWeek;
            const hasProgresss = hasProgress(week);
            const phaseAccent = phase?.accent || '#999';

            return (
              <button
                key={week}
                onClick={() => handleSelectWeek(week)}
                className={`aspect-square flex items-center justify-center rounded-lg font-bold text-sm relative transition-all ${
                  isActive
                    ? 'text-black shadow-lg scale-110'
                    : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: isActive ? phaseAccent : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? '#000' : 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {week}
                {/* Completion indicator */}
                {hasProgresss && !isActive && (
                  <div
                    className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: phaseAccent }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Phase Legend */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
          {PHASES.map((phase) => (
            <div key={phase.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: phase.accent }}
              />
              <span className="text-xs text-white/60">
                P{phase.id}: {phase.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
