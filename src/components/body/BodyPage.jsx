import { useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useMetrics } from '../../hooks/useMetrics';
import { useStore } from '../../lib/store';
import { getPhaseColor } from '../../lib/constants';
import { showToast } from '../layout/Toast';
import Glp1Log from './Glp1Log';

// Color used for GLP-1 dose markers on the weight chart.
// Amber to stand out against the phase-accent area fill.
const GLP1_MARKER_COLOR = '#FFB020';

export default function BodyPage() {
  const { metrics, addMetric, latestMetric, weightTrend } = useMetrics();
  const currentWeek = useStore((s) => s.currentWeek);
  const glp1Logs = useStore((s) => s.glp1Logs);

  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddMetric = (e) => {
    e.preventDefault();
    if (!weight) {
      showToast('Please enter your weight', 'error');
      return;
    }

    addMetric({
      week: currentWeek,
      weight: parseFloat(weight),
      waist: waist ? parseFloat(waist) : null,
      notes: notes || null,
    });

    showToast('Metric logged', 'success');
    setWeight('');
    setWaist('');
    setNotes('');
  };

  // Calculate weight change from previous
  const getWeightChange = () => {
    if (metrics.length < 2) return null;
    const recent = [...metrics].filter((m) => m.weight).slice(-2);
    if (recent.length < 2) return null;
    return recent[1].weight - recent[0].weight;
  };

  const weightChange = getWeightChange();
  const changeColor = weightChange && weightChange < 0 ? 'text-green-400' : 'text-red-400';

  // Prepare chart data — use epoch timestamps on the X axis so we can
  // overlay GLP-1 dose markers on arbitrary dates (they won't always
  // coincide with weight check-in dates).
  const chartData = weightTrend.map((m) => ({
    ts: new Date(m.date).getTime(),
    weight: m.weight,
    fullDate: m.date,
  }));

  // Filter doses to the visible range of the chart, then sort ascending.
  const chartMinTs = chartData.length > 0 ? chartData[0].ts : null;
  const chartMaxTs = chartData.length > 0 ? chartData[chartData.length - 1].ts : null;
  const doseMarkers =
    chartMinTs !== null
      ? [...glp1Logs]
          .map((log) => ({ ...log, ts: new Date(log.date).getTime() }))
          .filter((log) => log.ts >= chartMinTs && log.ts <= chartMaxTs)
          .sort((a, b) => a.ts - b.ts)
      : [];

  const formatTs = (ts) =>
    new Date(ts).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

  const phaseColor = getPhaseColor(currentWeek);

  return (
    <div className="pb-24">
      {/* Entry Form */}
      <div className="p-4 space-y-4">
        <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
          <h2 className="text-lg font-semibold mb-4 text-white">Log Metrics</h2>
          <form onSubmit={handleAddMetric} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-2">Weight (lbs)</label>
              <input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-right text-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Waist (inches, optional)</label>
              <input
                type="number"
                step="0.1"
                placeholder="—"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-right text-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">Notes (optional)</label>
              <input
                type="text"
                placeholder="How you felt..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg font-semibold transition-colors"
              style={{ backgroundColor: phaseColor, color: '#0a0a14' }}
            >
              Log
            </button>
          </form>
        </div>

        {/* Latest Metric Card */}
        {latestMetric && (
          <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
            <h3 className="text-xs text-gray-400 uppercase font-semibold mb-3">Latest</h3>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-gray-300">Weight</span>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-white">
                    {latestMetric.weight}
                  </div>
                  <div className="text-xs text-gray-400">lbs</div>
                </div>
              </div>

              {weightChange !== null && (
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-gray-300 text-sm">Change from previous</span>
                  <div className="flex items-center gap-1">
                    {weightChange < 0 ? (
                      <TrendingDown size={16} className="text-green-400" />
                    ) : (
                      <TrendingUp size={16} className="text-red-400" />
                    )}
                    <span className={`font-mono font-semibold ${changeColor}`}>
                      {weightChange > 0 ? '+' : ''}
                      {weightChange.toFixed(1)} lbs
                    </span>
                  </div>
                </div>
              )}

              {latestMetric.waist && (
                <div className="flex items-baseline justify-between">
                  <span className="text-gray-300">Waist</span>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold text-white">
                      {latestMetric.waist}
                    </div>
                    <div className="text-xs text-gray-400">inches</div>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 pt-2">
                {new Date(latestMetric.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weight Trend Chart */}
      {chartData.length > 1 && (
        <div className="px-4 space-y-4">
          <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Weight Trend</h3>
              {doseMarkers.length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <span
                    className="inline-block w-3 border-t border-dashed"
                    style={{ borderColor: GLP1_MARKER_COLOR }}
                  />
                  <span>GLP-1 dose</span>
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={phaseColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={phaseColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="ts"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={formatTs}
                  tick={{ fill: '#999', fontSize: 12 }}
                  stroke="rgba(255,255,255,0.1)"
                />
                <YAxis
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fill: '#999', fontSize: 12 }}
                  stroke="rgba(255,255,255,0.1)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(26, 26, 38, 0.95)',
                    border: `1px solid ${phaseColor}`,
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                  labelFormatter={(ts) => formatTs(ts)}
                  formatter={(value) => [`${value.toFixed(1)} lbs`, 'Weight']}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke={phaseColor}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                />
                {/* GLP-1 dose markers — vertical dashed lines labeled
                    with the dose in mg. Rendered AFTER <Area> so they
                    sit on top of the fill. */}
                {doseMarkers.map((log) => (
                  <ReferenceLine
                    key={`${log.date}-${log.dose}`}
                    x={log.ts}
                    stroke={GLP1_MARKER_COLOR}
                    strokeDasharray="4 3"
                    strokeOpacity={0.85}
                    ifOverflow="extendDomain"
                    label={{
                      value: `${log.dose}mg`,
                      position: 'top',
                      fill: GLP1_MARKER_COLOR,
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
            {doseMarkers.length === 0 && glp1Logs.length > 0 && (
              <p className="text-[10px] text-gray-500 mt-2 text-center">
                GLP-1 doses logged but fall outside the chart's weight-log range.
              </p>
            )}
          </div>
        </div>
      )}

      {/* History List */}
      {metrics.length > 0 && (
        <div className="px-4 mt-4">
          <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-4">History</h3>
            <div className="space-y-3">
              {[...metrics].filter((m) => m.weight).reverse().map((m, idx) => {
                const nextMetric = idx > 0 ? [...metrics].filter((x) => x.weight).reverse()[idx - 1] : null;
                const change = nextMetric ? m.weight - nextMetric.weight : null;
                const isDown = change && change < 0;

                return (
                  <div key={m.date} className="flex items-center justify-between text-sm border-t border-white/10 pt-3 first:border-0 first:pt-0">
                    <div>
                      <div className="text-white font-semibold">{m.weight} lbs</div>
                      <div className="text-xs text-gray-500">{new Date(m.date).toLocaleDateString()}</div>
                      {m.waist && <div className="text-xs text-gray-400">Waist: {m.waist}"</div>}
                    </div>
                    {change !== null && (
                      <div className="flex items-center gap-1">
                        {isDown ? (
                          <TrendingDown size={14} className="text-green-400" />
                        ) : (
                          <TrendingUp size={14} className="text-red-400" />
                        )}
                        <span className={`font-mono text-xs font-semibold ${isDown ? 'text-green-400' : 'text-red-400'}`}>
                          {change > 0 ? '+' : ''}
                          {change.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GLP-1 Dose Log */}
      <Glp1Log />
    </div>
  );
}
