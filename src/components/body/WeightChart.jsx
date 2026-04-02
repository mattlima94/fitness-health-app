import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'

export default function WeightChart({ metrics, glp1Doses = [], phase }) {
  const weightData = metrics
    .filter(m => m.weight_lbs)
    .map(m => ({ date: m.date, weight: Number(m.weight_lbs) }))
    .reverse()
    .slice(-30)

  // GLP-1 dose dates for reference lines
  const doseDates = new Set(glp1Doses.map(d => d.dose_date))

  if (weightData.length < 2) {
    return (
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-[13px] font-semibold tracking-widest uppercase mb-2" style={{ opacity: 0.5 }}>
          Weight Trend
        </div>
        <div className="text-xs text-center py-8" style={{ opacity: 0.3 }}>
          Log at least 2 measurements to see your trend
        </div>
      </div>
    )
  }

  // Find dose dates that fall within the chart range
  const chartDates = weightData.map(d => d.date)
  const doseMarkers = [...doseDates].filter(d => chartDates.includes(d) || (d >= chartDates[0] && d <= chartDates[chartDates.length - 1]))

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] font-semibold tracking-widest uppercase" style={{ opacity: 0.5 }}>
          Weight Trend
        </div>
        {doseMarkers.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#CE93D8' }} />
            <span className="text-[10px]" style={{ opacity: 0.3 }}>GLP-1 dose</span>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={weightData}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            tickFormatter={(d) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={['dataMin - 2', 'dataMax + 2']}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
            itemStyle={{ color: phase.accent }}
            labelFormatter={(d) => {
              const label = new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              return doseDates.has(d) ? `${label} (GLP-1 dose)` : label
            }}
          />
          {doseMarkers.map((d) => (
            <ReferenceLine
              key={d}
              x={d}
              stroke="#CE93D8"
              strokeDasharray="3 3"
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          ))}
          <Line
            type="monotone"
            dataKey="weight"
            stroke={phase.accent}
            strokeWidth={2}
            dot={{ r: 3, fill: phase.accent }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
