import { useState } from 'react'
import { useStore } from '../../lib/store'
import { getPhase } from '../../lib/constants'

export default function GLP1Section() {
  const currentWeek = useStore((s) => s.currentWeek)
  const glp1Doses = useStore((s) => s.glp1Doses)
  const addGlp1Dose = useStore((s) => s.addGlp1Dose)
  const deleteGlp1Dose = useStore((s) => s.deleteGlp1Dose)
  const showToast = useStore((s) => s.showToast)
  const phase = getPhase(currentWeek)

  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dosage, setDosage] = useState('7.5')
  const [site, setSite] = useState('')
  const [notes, setNotes] = useState('')

  const lastDose = glp1Doses[0]
  const daysSinceLastDose = lastDose
    ? Math.floor((new Date() - new Date(lastDose.dose_date + 'T12:00:00')) / (1000 * 60 * 60 * 24))
    : null

  const isDueOrOverdue = daysSinceLastDose !== null && daysSinceLastDose >= 7

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addGlp1Dose({
      date,
      medication: 'Mounjaro',
      dosage: parseFloat(dosage),
      site: site || null,
      notes: notes || null,
    })
    setShowForm(false)
    setSite('')
    setNotes('')
    setDate(new Date().toISOString().split('T')[0])
    showToast('GLP-1 dose logged!')
  }

  return (
    <div className="rounded-2xl p-5 mb-4" style={{
      background: isDueOrOverdue ? 'rgba(255,152,0,0.06)' : 'rgba(255,255,255,0.035)',
      border: isDueOrOverdue ? '1px solid rgba(255,152,0,0.2)' : '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] font-semibold tracking-widest uppercase" style={{ opacity: 0.5 }}>
          GLP-1 Tracker
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(171,71,188,0.15)', color: '#CE93D8' }}>
          Mounjaro
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-4 mb-3">
        <div>
          <div className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-mono)' }}>
            {daysSinceLastDose !== null ? `${daysSinceLastDose}d` : '—'}
          </div>
          <div className="text-[10px]" style={{ opacity: 0.3 }}>since last dose</div>
        </div>
        <div>
          <div className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-mono)' }}>
            {lastDose ? `${lastDose.dosage_mg}mg` : '—'}
          </div>
          <div className="text-[10px]" style={{ opacity: 0.3 }}>current dose</div>
        </div>
        <div>
          <div className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-mono)' }}>
            {glp1Doses.length}
          </div>
          <div className="text-[10px]" style={{ opacity: 0.3 }}>total doses</div>
        </div>
      </div>

      {isDueOrOverdue && (
        <div className="text-xs px-3 py-2 rounded-lg mb-3" style={{ background: 'rgba(255,152,0,0.1)', color: '#FFB74D' }}>
          Dose due — {daysSinceLastDose} days since last injection
        </div>
      )}

      {/* Log Button / Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-[14px] border-none text-white text-sm font-bold tracking-wider"
          style={{ background: phase.accent }}
        >
          Log Dose
        </button>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ opacity: 0.4 }}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ opacity: 0.4 }}>Dosage (mg)</label>
              <select
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <option value="2.5">2.5 mg</option>
                <option value="5">5 mg</option>
                <option value="7.5">7.5 mg</option>
                <option value="10">10 mg</option>
                <option value="12.5">12.5 mg</option>
                <option value="15">15 mg</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ opacity: 0.4 }}>Injection Site</label>
            <div className="flex gap-2 flex-wrap">
              {['Left Abdomen', 'Right Abdomen', 'Left Thigh', 'Right Thigh'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSite(site === s ? '' : s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-transparent"
                  style={{
                    borderColor: site === s ? phase.accent : 'rgba(255,255,255,0.1)',
                    color: site === s ? phase.accent : 'rgba(255,255,255,0.5)',
                    background: site === s ? `${phase.accent}15` : 'transparent',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ opacity: 0.4 }}>Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Side effects, observations..."
              className="w-full py-2.5 px-3 rounded-xl text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 rounded-[14px] text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'none' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-[14px] border-none text-white text-sm font-bold"
              style={{ background: phase.accent }}
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Recent Doses */}
      {glp1Doses.length > 0 && !showForm && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ opacity: 0.3 }}>Recent Doses</div>
          {glp1Doses.slice(0, 4).map((dose) => (
            <div key={dose.id} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#CE93D8' }} />
                <span className="text-xs" style={{ opacity: 0.6 }}>
                  {new Date(dose.dose_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-mono)', opacity: 0.8 }}>
                  {dose.dosage_mg}mg
                </span>
              </div>
              {dose.injection_site && (
                <span className="text-[10px]" style={{ opacity: 0.3 }}>{dose.injection_site}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
