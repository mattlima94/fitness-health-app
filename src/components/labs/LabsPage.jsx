import { useState } from 'react'
import { useStore } from '../../lib/store'
import { getPhase } from '../../lib/constants'

const LAB_CATEGORIES = [
  {
    name: 'Metabolic',
    color: '#FF9800',
    markers: [
      { biomarker: 'Fasting Glucose', unit: 'mg/dL', optMin: 70, optMax: 90 },
      { biomarker: 'HbA1c', unit: '%', optMin: 4.0, optMax: 5.4 },
      { biomarker: 'Fasting Insulin', unit: 'uIU/mL', optMin: 2, optMax: 8 },
      { biomarker: 'HOMA-IR', unit: '', optMin: 0.5, optMax: 1.5 },
    ],
  },
  {
    name: 'Lipids',
    color: '#42A5F5',
    markers: [
      { biomarker: 'Total Cholesterol', unit: 'mg/dL', optMin: 120, optMax: 200 },
      { biomarker: 'LDL Cholesterol', unit: 'mg/dL', optMin: 0, optMax: 100 },
      { biomarker: 'HDL Cholesterol', unit: 'mg/dL', optMin: 50, optMax: 100 },
      { biomarker: 'Triglycerides', unit: 'mg/dL', optMin: 0, optMax: 100 },
      { biomarker: 'ApoB', unit: 'mg/dL', optMin: 0, optMax: 80 },
    ],
  },
  {
    name: 'Hormones',
    color: '#AB47BC',
    markers: [
      { biomarker: 'Testosterone (Total)', unit: 'ng/dL', optMin: 500, optMax: 900 },
      { biomarker: 'Testosterone (Free)', unit: 'pg/mL', optMin: 10, optMax: 25 },
      { biomarker: 'DHEA-S', unit: 'mcg/dL', optMin: 200, optMax: 500 },
      { biomarker: 'Cortisol (AM)', unit: 'mcg/dL', optMin: 6, optMax: 18 },
      { biomarker: 'TSH', unit: 'mIU/L', optMin: 0.5, optMax: 2.5 },
      { biomarker: 'Free T3', unit: 'pg/mL', optMin: 3.0, optMax: 4.5 },
      { biomarker: 'Free T4', unit: 'ng/dL', optMin: 1.0, optMax: 1.8 },
    ],
  },
  {
    name: 'Inflammation',
    color: '#EF5350',
    markers: [
      { biomarker: 'hs-CRP', unit: 'mg/L', optMin: 0, optMax: 1.0 },
      { biomarker: 'Homocysteine', unit: 'umol/L', optMin: 5, optMax: 10 },
    ],
  },
  {
    name: 'Liver',
    color: '#66BB6A',
    markers: [
      { biomarker: 'ALT', unit: 'U/L', optMin: 7, optMax: 30 },
      { biomarker: 'AST', unit: 'U/L', optMin: 10, optMax: 30 },
      { biomarker: 'GGT', unit: 'U/L', optMin: 9, optMax: 40 },
    ],
  },
  {
    name: 'Kidney',
    color: '#26A69A',
    markers: [
      { biomarker: 'eGFR', unit: 'mL/min', optMin: 90, optMax: 120 },
      { biomarker: 'Creatinine', unit: 'mg/dL', optMin: 0.7, optMax: 1.2 },
      { biomarker: 'BUN', unit: 'mg/dL', optMin: 7, optMax: 20 },
    ],
  },
  {
    name: 'Vitamins & Minerals',
    color: '#FFA726',
    markers: [
      { biomarker: 'Vitamin D', unit: 'ng/mL', optMin: 40, optMax: 80 },
      { biomarker: 'Vitamin B12', unit: 'pg/mL', optMin: 500, optMax: 1000 },
      { biomarker: 'Ferritin', unit: 'ng/mL', optMin: 50, optMax: 200 },
      { biomarker: 'Magnesium (RBC)', unit: 'mg/dL', optMin: 5.0, optMax: 7.0 },
    ],
  },
  {
    name: 'Blood',
    color: '#EF5350',
    markers: [
      { biomarker: 'Hemoglobin', unit: 'g/dL', optMin: 14.0, optMax: 17.5 },
      { biomarker: 'Hematocrit', unit: '%', optMin: 40, optMax: 52 },
      { biomarker: 'RBC', unit: 'M/uL', optMin: 4.5, optMax: 5.5 },
      { biomarker: 'WBC', unit: 'K/uL', optMin: 4.0, optMax: 10.0 },
    ],
  },
]

export default function LabsPage() {
  const currentWeek = useStore((s) => s.currentWeek)
  const labResults = useStore((s) => s.labResults)
  const addLabResult = useStore((s) => s.addLabResult)
  const showToast = useStore((s) => s.showToast)
  const phase = getPhase(currentWeek)

  const [mode, setMode] = useState('view') // 'view' or 'entry'
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [values, setValues] = useState({})
  const [expandedCategory, setExpandedCategory] = useState(null)

  // Group results by test date
  const resultsByDate = {}
  labResults.forEach((r) => {
    if (!resultsByDate[r.test_date]) resultsByDate[r.test_date] = []
    resultsByDate[r.test_date].push(r)
  })
  const testDates = Object.keys(resultsByDate).sort().reverse()

  const getStatus = (value, optMin, optMax) => {
    const num = parseFloat(value)
    if (isNaN(num)) return null
    if (num >= optMin && num <= optMax) return 'optimal'
    return 'out_of_range'
  }

  const getStatusColor = (status) => {
    if (status === 'optimal') return '#66BB6A'
    if (status === 'out_of_range') return '#FF9800'
    return 'rgba(255,255,255,0.4)'
  }

  const handleSaveAll = async () => {
    const entries = Object.entries(values).filter(([, v]) => v !== '')
    if (entries.length === 0) return

    for (const [biomarker, value] of entries) {
      // Find the marker definition
      let markerDef = null
      let categoryName = ''
      for (const cat of LAB_CATEGORIES) {
        const found = cat.markers.find(m => m.biomarker === biomarker)
        if (found) {
          markerDef = found
          categoryName = cat.name
          break
        }
      }
      if (!markerDef) continue

      const numVal = parseFloat(value)
      const status = getStatus(value, markerDef.optMin, markerDef.optMax)

      await addLabResult({
        testDate,
        category: categoryName,
        biomarker,
        value,
        numericValue: isNaN(numVal) ? null : numVal,
        unit: markerDef.unit,
        referenceRange: `${markerDef.optMin}-${markerDef.optMax}`,
        optimalMin: markerDef.optMin,
        optimalMax: markerDef.optMax,
        status,
        direction: status === 'out_of_range' ? (numVal > markerDef.optMax ? 'above' : 'below') : null,
      })
    }

    setValues({})
    setMode('view')
    showToast(`${entries.length} lab results saved!`)
  }

  return (
    <div className="px-4 pt-6 fade-in">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-extrabold">Labs</h1>
        <button
          onClick={() => setMode(mode === 'view' ? 'entry' : 'view')}
          className="px-3 py-1.5 rounded-lg text-xs font-bold border bg-transparent"
          style={{ borderColor: phase.accent, color: phase.accent }}
        >
          {mode === 'view' ? 'Enter Results' : 'View Results'}
        </button>
      </div>

      {mode === 'entry' ? (
        <>
          {/* Date picker */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <label className="text-[10px] font-semibold uppercase tracking-wider block mb-2" style={{ opacity: 0.4 }}>Draw Date</label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', colorScheme: 'dark' }}
            />
          </div>

          {/* Category entry forms */}
          {LAB_CATEGORIES.map((cat) => (
            <div key={cat.name} className="rounded-2xl p-4 mb-3" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                <div className="text-[12px] font-bold tracking-wider uppercase" style={{ color: cat.color }}>
                  {cat.name}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {cat.markers.map((marker) => (
                  <div key={marker.biomarker}>
                    <label className="text-[10px] font-semibold block mb-1" style={{ opacity: 0.5 }}>
                      {marker.biomarker}
                      {marker.unit && <span style={{ opacity: 0.5 }}> ({marker.unit})</span>}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={values[marker.biomarker] || ''}
                      onChange={(e) => setValues({ ...values, [marker.biomarker]: e.target.value })}
                      placeholder={`${marker.optMin}-${marker.optMax}`}
                      className="w-full py-2 px-2.5 rounded-lg text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSaveAll}
            className="w-full py-3.5 rounded-[14px] border-none text-white text-sm font-bold tracking-wider mb-4"
            style={{ background: phase.accent }}
          >
            Save All Results
          </button>
        </>
      ) : (
        <>
          {testDates.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-3xl mb-3">🧪</div>
              <div className="text-sm font-bold mb-1">No Lab Results Yet</div>
              <div className="text-xs" style={{ opacity: 0.4 }}>
                After your Function Health draw, tap "Enter Results" to log your biomarkers
              </div>
            </div>
          ) : (
            testDates.map((date) => {
              const results = resultsByDate[date]
              const byCategory = {}
              results.forEach((r) => {
                if (!byCategory[r.category]) byCategory[r.category] = []
                byCategory[r.category].push(r)
              })

              return (
                <div key={date} className="mb-4">
                  <div className="text-[13px] font-bold mb-3" style={{ opacity: 0.6 }}>
                    {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>

                  {Object.entries(byCategory).map(([category, results]) => {
                    const catDef = LAB_CATEGORIES.find(c => c.name === category)
                    const isExpanded = expandedCategory === `${date}-${category}`
                    const outOfRange = results.filter(r => r.status === 'out_of_range').length

                    return (
                      <button
                        key={category}
                        onClick={() => setExpandedCategory(isExpanded ? null : `${date}-${category}`)}
                        className="w-full text-left rounded-2xl p-4 mb-2"
                        style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)', color: '#e0e0ec' }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: catDef?.color || '#fff' }} />
                            <span className="text-xs font-bold">{category}</span>
                            <span className="text-[10px]" style={{ opacity: 0.3 }}>{results.length} markers</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {outOfRange > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,152,0,0.15)', color: '#FFB74D' }}>
                                {outOfRange} flagged
                              </span>
                            )}
                            <svg
                              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                              style={{ opacity: 0.3, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            {results.map((r) => (
                              <div key={r.biomarker} className="flex items-center justify-between py-1.5">
                                <span className="text-xs" style={{ opacity: 0.6 }}>{r.biomarker}</span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs font-bold"
                                    style={{ fontFamily: 'var(--font-mono)', color: getStatusColor(r.status) }}
                                  >
                                    {r.value}
                                  </span>
                                  {r.unit && <span className="text-[10px]" style={{ opacity: 0.3 }}>{r.unit}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </>
      )}
    </div>
  )
}
