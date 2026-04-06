import { useStore } from '../lib/store';

export function useMetrics() {
  const metrics = useStore((s) => s.metrics);
  const addMetric = useStore((s) => s.addMetric);
  const getLatestMetric = useStore((s) => s.getLatestMetric);
  const getWeightTrend = useStore((s) => s.getWeightTrend);

  const latestMetric = getLatestMetric();
  const weightTrend = getWeightTrend(20);

  const getWeightChange = () => {
    if (metrics.length < 2) return null;
    const recent = [...metrics].filter(m => m.weight).slice(-2);
    if (recent.length < 2) return null;
    return (recent[1].weight - recent[0].weight).toFixed(1);
  };

  return {
    metrics,
    addMetric,
    latestMetric,
    weightTrend,
    weightChange: getWeightChange(),
  };
}
