import { useState } from 'react'
import { useStore } from '../../lib/store'
import { getPhase } from '../../lib/constants'
import WeightChart from './WeightChart'
import GLP1Section from './GLP1Section'
import BodyCompositionForm from './BodyCompositionForm'

export default function BodyPage() {
  const currentWeek = useStore((s) => s.currentWeek)
  const metrics = useStore((s) => s.metrics)
  const glp1Doses = useStore((s) => s.glp1Doses)
  const addMetric = useStore((s) => s.addMetric)
  const showToast = useStore((s) => s.showToast)
  const phase = getPhase(currentWeek)

  const [weight, setWeight] = useState('')
  const [waist, setWaist] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!weight && !waist) return
    await addMetric({
      weight: weight ? parseFloat(weight) : null,
      waist: waist ? parseFloat(waist) : null,
    })
    setWeight('')
    setWaist('')
    showToast('Measurement saved!')
  }

  const latestWeight = metrics.find(m => m.weight_lbs)
  const latestWaist = metrics.find(m => m.waist_inches)
  const latestBodyFat = metrics.find(m => m.body_fat_pct)

  return (
    <div className="px-4 pt-6 fade-in">
      <h1 className="text-2xl font-extrabold mb-5">Body</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ opacity: 0.4 }}>Weight</div>
          <div className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-mono)' }}>
            {latestWeight?.weight_lbs || '—'}
          </div>
          <div className="text-[10px]" style={{ opacity: 0.3 }}>lbs</div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ opacity: 0.4 }}>Waist</div>
          <div className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-mono)' }}>
            {latestWaist?.waist_inches || '—'}
          </div>
          <div className="text-[10px]" style={{ opacity: 0.3 }}>inches</div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ opacity: 0.4 }}>Body Fat</div>
          <div className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-mono)' }}>
            {latestBodyFat?.body_fat_pct || '—'}
          </div>
          <div className="text-[10px]" style={{ opacity: 0.3 }}>%</div>
        </div>
      </div>

      {/* Weight Chart with GLP-1 markers */}
      <WeightChart metrics={metrics} glp1Doses={glp1Doses} phase={phase} />

      {/* GLP-1 Tracker */}
      <div className="mt-4">
        <GLP1Section />
      </div>

      {/* Manual Entry */}
      <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[13px] font-semibold tracking-widest uppercase mb-3" style={{ opacity: 0.5 }}>
          Log Measurement
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ opacity: 0.4 }}>Weight (lbs)</label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="240.0"
                className="w-full py-3 px-3.5 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ opacity: 0.4 }}>Waist (in)</label>
              <input
                type="number"
                step="0.1"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="38.0"
                className="w-full py-3 px-3.5 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3.5 rounded-[14px] border-none text-white text-sm font-bold tracking-wider"
            style={{ background: phase.accent }}
          >
            Save
          </button>
        </form>
      </div>

      {/* Body Composition (expandable) */}
      <BodyCompositionForm />
    </div>
  )
}
