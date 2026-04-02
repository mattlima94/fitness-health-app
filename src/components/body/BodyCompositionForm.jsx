import { useState } from 'react'
import { useStore } from '../../lib/store'
import { getPhase } from '../../lib/constants'

export default function BodyCompositionForm() {
  const currentWeek = useStore((s) => s.currentWeek)
  const addMetric = useStore((s) => s.addMetric)
  const showToast = useStore((s) => s.showToast)
  const phase = getPhase(currentWeek)

  const [expanded, setExpanded] = useState(false)
  const [bodyFat, setBodyFat] = useState('')
  const [muscleMass, setMuscleMass] = useState('')
  const [waterPct, setWaterPct] = useState('')
  const [visceralFat, setVisceralFat] = useState('')
  const [boneMass, setBoneMass] = useState('')
  const [bmr, setBmr] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!bodyFat && !muscleMass && !waterPct && !visceralFat && !boneMass && !bmr) return

    await addMetric({
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      muscleMass: muscleMass ? parseFloat(muscleMass) : null,
      waterPct: waterPct ? parseFloat(waterPct) : null,
      visceralFat: visceralFat ? parseInt(visceralFat) : null,
      boneMass: boneMass ? parseFloat(boneMass) : null,
      bmr: bmr ? parseInt(bmr) : null,
    })

    setBodyFat('')
    setMuscleMass('')
    setWaterPct('')
    setVisceralFat('')
    setBoneMass('')
    setBmr('')
    setExpanded(false)
    showToast('Body composition saved!')
  }

  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full bg-transparent border-none text-left"
        style={{ color: '#e0e0ec' }}
      >
        <div className="text-[13px] font-semibold tracking-widest uppercase" style={{ opacity: 0.5 }}>
          Body Composition
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity: 0.3, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { label: 'Body Fat %', value: bodyFat, set: setBodyFat, step: '0.1', placeholder: '25.0' },
              { label: 'Muscle Mass (lbs)', value: muscleMass, set: setMuscleMass, step: '0.1', placeholder: '150.0' },
              { label: 'Water %', value: waterPct, set: setWaterPct, step: '0.1', placeholder: '55.0' },
              { label: 'Visceral Fat', value: visceralFat, set: setVisceralFat, step: '1', placeholder: '12' },
              { label: 'Bone Mass (lbs)', value: boneMass, set: setBoneMass, step: '0.1', placeholder: '7.5' },
              { label: 'BMR (cal)', value: bmr, set: setBmr, step: '1', placeholder: '1800' },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ opacity: 0.4 }}>
                  {field.label}
                </label>
                <input
                  type="number"
                  step={field.step}
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full py-2.5 px-3 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-[14px] border-none text-white text-sm font-bold tracking-wider"
            style={{ background: phase.accent }}
          >
            Save Composition
          </button>
        </form>
      )}

      {!expanded && (
        <div className="text-xs mt-2" style={{ opacity: 0.3 }}>
          Tap to log bioimpedance scale data
        </div>
      )}
    </div>
  )
}
