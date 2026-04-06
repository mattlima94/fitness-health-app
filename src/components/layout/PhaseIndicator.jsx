import { useProfile } from '../../hooks/useProfile';
import { isDeloadWeek } from '../../lib/constants';

export default function PhaseIndicator() {
  const { currentWeek, phase } = useProfile();
  const isDeload = isDeloadWeek(currentWeek);

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
      {/* Accent dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: phase.accent }}
      />

      {/* Phase and week info */}
      <div className="flex-1 min-w-0">
        {isDeload ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              Recovery Week
            </span>
            <span className="text-xs text-white/60">
              Week {currentWeek}
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <div className="text-sm font-medium text-white">
              Phase {phase.id} — {phase.name}
            </div>
            <div className="text-xs text-white/60">
              Week {currentWeek}
            </div>
          </div>
        )}
      </div>

      {/* Visual indicator */}
      {isDeload && (
        <div className="px-2.5 py-1 rounded bg-white/10 flex-shrink-0">
          <span className="text-xs font-semibold text-white/80">
            Recover
          </span>
        </div>
      )}
    </div>
  );
}
