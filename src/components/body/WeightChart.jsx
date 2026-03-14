import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

export default function WeightChart({ metrics, phase }) {
  const weightData = metrics
    .filter(m => m.weight_lbs)
    .map(m => ({ date: m.date, weight: Number(m.weight_lbs) }))
    .reverse()
    .slice(-30)

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

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-[13px] font-semibold tracking-widest uppercase mb-3" style={{ opacity: 0.5 }}>
        Weight Trend
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={weightData}>
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
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={phase.accent}
            strokeWidth={2}
            dot={{ r: 3, fill: phase.accent }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
