import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useMetrics } from '../../hooks/useMetrics';
import { useWorkouts } from '../../hooks/useWorkouts';
import {
  PHASES,
  MILESTONES,
  PHASE_FOCUS,
  RED_FLAGS,
  DELOAD_WEEKS,
  getPhase,
  getPhaseColor,
} from '../../lib/constants';
import { WORKOUT_PLAN } from '../../lib/workoutData';

/**
 * Extract run duration from a week's workout plan
 * Looks for cardio exercise with "run" or "jog" or "Treadmill" in name
 */
function getRunDuration(weekNum) {
  const week = WORKOUT_PLAN[weekNum];
  if (!week) return 0;

  for (const day of week) {
    if (day.type === 'cardio' || day.type === 'long') {
      for (const ex of day.exercises) {
        const name = ex.name.toLowerCase();
        if (
          name.includes('run') ||
          name.includes('jog') ||
          name.includes('treadmill') ||
          name.includes('long')
        ) {
          // Parse duration string like "25 min" or "30 min"
          const match = ex.duration.match(/(\d+)/);
          if (match) {
            return parseInt(match[1], 10);
          }
        }
      }
    }
  }
  return 0;
}

/**
 * Interpolate weight for weeks without a metric
 */
function interpolateMetrics(metrics, currentWeek) {
  const data = [];

  for (let week = 1; week <= currentWeek; week++) {
    // Find metrics in this week
    const weekMetrics = metrics.filter((m) => m.week === week);
    const weight = weekMetrics.length > 0
      ? weekMetrics[weekMetrics.length - 1].weight
      : null;

    data.push({ week, weight });
  }

  // Interpolate missing weights
  let lastKnownWeight = null;
  let lastKnownIndex = -1;

  for (let i = 0; i < data.length; i++) {
    if (data[i].weight !== null) {
      lastKnownWeight = data[i].weight;
      lastKnownIndex = i;
    } else if (lastKnownWeight !== null) {
      // Look ahead for next known weight
      let nextKnownWeight = null;
      let nextKnownIndex = -1;
      for (let j = i + 1; j < data.length; j++) {
        if (data[j].weight !== null) {
          nextKnownWeight = data[j].weight;
          nextKnownIndex = j;
          break;
        }
      }

      // Interpolate
      if (nextKnownWeight !== null) {
        const range = nextKnownIndex - lastKnownIndex;
        const step = (nextKnownWeight - lastKnownWeight) / range;
        data[i].weight = lastKnownWeight + step * (i - lastKnownIndex);
      } else {
        data[i].weight = lastKnownWeight;
      }
    }
  }

  return data;
}

export default function InsightsPage() {
  const currentWeek = useStore((s) => s.currentWeek);
  const completedExercises = useStore((s) => s.completedExercises);
  const { metrics } = useMetrics();
  const { plan, getWeekProgress } = useWorkouts();

  // Build progress overlay chart data
  const progressData = [];

  for (let week = 1; week <= currentWeek; week++) {
    const completion = getWeekProgress(week, plan) * 100;
    const runDuration = getRunDuration(week);

    progressData.push({
      week,
      completion: Math.round(completion),
      runDuration,
    });
  }

  // Add weight data (interpolated)
  const weightData = interpolateMetrics(metrics, currentWeek);
  const chartData = progressData.map((p) => ({
    ...p,
    weight: weightData.find((w) => w.week === p.week)?.weight || null,
  }));

  const currentPhase = getPhase(currentWeek);
  const phaseColor = getPhaseColor(currentWeek);

  // Calculate completion % for each phase
  const getPhaseCompletion = (phaseId) => {
    const phase = PHASES.find((p) => p.id === phaseId);
    if (!phase) return 0;

    const weeks = phase.weeks;
    let completed = 0;
    let total = 0;

    for (let w = weeks[0]; w <= weeks[1]; w++) {
      if (w <= currentWeek) {
        completed += getWeekProgress(w, plan) * 100;
        total += 100;
      }
    }

    return total > 0 ? Math.round(completed / (weeks[1] - weeks[0] + 1)) : 0;
  };

  return (
    <div className="pb-24 space-y-4 p-4">
      {/* Progress Overlay Chart */}
      <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
        <h2 className="text-sm font-semibold text-white mb-4">Progress Overlay</h2>
        <p className="text-xs text-gray-400 mb-4">
          Weight, completion %, and planned run duration over time.
        </p>

        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: -10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="week"
              tick={{ fill: '#999', fontSize: 11 }}
              stroke="rgba(255,255,255,0.1)"
              label={{ value: 'Week', position: 'insideBottomRight', offset: -5, fill: '#999' }}
            />
            <YAxis
              yAxisId="left"
              domain={['dataMin - 2', 'dataMax + 2']}
              tick={{ fill: '#999', fontSize: 11 }}
              stroke="rgba(255,255,255,0.1)"
              label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft', fill: '#999' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fill: '#999', fontSize: 11 }}
              stroke="rgba(255,255,255,0.1)"
              label={{ value: '% / min', angle: 90, position: 'insideRight', fill: '#999' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(26, 26, 38, 0.95)',
                border: `1px solid ${phaseColor}`,
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value, name) => {
                if (name === 'Weight') return [`${value.toFixed(1)} lbs`, name];
                if (name === 'Completion %') return [`${value}%`, name];
                if (name === 'Run Duration') return [`${value} min`, name];
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
            />
            {/* Weight area (subtle background) */}
            {metrics.length > 0 && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                fill={phaseColor}
                stroke="transparent"
                fillOpacity={0.08}
                name="Weight"
                isAnimationActive={false}
              />
            )}
            {/* Completion line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="completion"
              stroke={phaseColor}
              strokeWidth={2.5}
              dot={{ fill: phaseColor, r: 4 }}
              activeDot={{ r: 6 }}
              name="Completion %"
              isAnimationActive={false}
            />
            {/* Run duration dashed line */}
            <Line
              yAxisId="right"
              type="stepAfter"
              dataKey="runDuration"
              stroke={phaseColor}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="Run Duration"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Phase Overview */}
      <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
        <h2 className="text-sm font-semibold text-white mb-4">Phases</h2>
        <div className="space-y-3">
          {PHASES.map((phase) => {
            const isCurrent = phase.id === currentPhase.id;
            const completion = getPhaseCompletion(phase.id);
            const phaseColor = phase.accent;

            return (
              <div
                key={phase.id}
                className="p-3 rounded-lg border transition-colors"
                style={{
                  borderColor: isCurrent ? phaseColor : 'rgba(255,255,255,0.1)',
                  backgroundColor: isCurrent ? `${phaseColor}15` : 'transparent',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {phase.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Weeks {phase.weeks[0]}–{phase.weeks[1]}
                    </p>
                  </div>
                  {isCurrent && (
                    <div
                      className="px-2 py-1 rounded text-xs font-semibold text-black"
                      style={{ backgroundColor: phaseColor }}
                    >
                      Now
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-300 mb-3">{PHASE_FOCUS[phase.id]}</p>

                {/* Milestones */}
                <div className="space-y-1">
                  {MILESTONES[phase.id].map((milestone, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle2
                        size={14}
                        className="text-gray-500 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-gray-300">{milestone}</span>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Progress</span>
                    <span className="text-xs font-semibold text-gray-300">{completion}%</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${completion}%`,
                        backgroundColor: phaseColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Red Flags */}
      <div className="rounded-2xl p-4 bg-surface border border-amber-600/30 bg-amber-950/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-amber-400" />
          <h2 className="text-sm font-semibold text-amber-100">Red Flags</h2>
        </div>
        <div className="space-y-2">
          {RED_FLAGS.map((flag, idx) => (
            <div
              key={idx}
              className="text-xs text-amber-100 flex items-start gap-2 p-2 rounded bg-amber-950/30 border border-amber-700/30"
            >
              <span className="text-amber-400 font-bold mt-0.5">•</span>
              <span>{flag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
