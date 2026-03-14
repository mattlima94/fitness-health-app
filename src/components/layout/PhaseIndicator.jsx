import { getPhase } from '../../lib/constants'
import { useStore } from '../../lib/store'

export default function PhaseIndicator() {
  const currentWeek = useStore((s) => s.currentWeek)
  const phase = getPhase(currentWeek)

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider"
      style={{ border: `1.5px solid ${phase.accent}`, color: phase.accent }}
    >
      PHASE {phase.id} — {phase.name.toUpperCase()}
    </span>
  )
}
