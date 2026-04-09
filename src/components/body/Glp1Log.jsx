import { useState } from 'react';
import { Syringe, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getPhaseColor } from '../../lib/constants';
import { showToast } from '../layout/Toast';

// Mounjaro ships in 2.5 / 5 / 7.5 / 10 / 12.5 / 15 mg pens.
const DOSE_OPTIONS = [2.5, 5, 7.5, 10, 12.5, 15];
const SITE_OPTIONS = [
  'L Abdomen',
  'R Abdomen',
  'L Thigh',
  'R Thigh',
  'L Upper Arm',
  'R Upper Arm',
];
const DEFAULT_MEDICATION = 'Mounjaro';
const DEFAULT_DOSE = 7.5;
const WEEKLY_CYCLE_DAYS = 7;

export default function Glp1Log() {
  const glp1Logs = useStore((s) => s.glp1Logs);
  const addGlp1Log = useStore((s) => s.addGlp1Log);
  const deleteGlp1Log = useStore((s) => s.deleteGlp1Log);
  const getLatestGlp1Log = useStore((s) => s.getLatestGlp1Log);
  const getDaysSinceLastGlp1 = useStore((s) => s.getDaysSinceLastGlp1);
  const currentWeek = useStore((s) => s.currentWeek);

  const latest = getLatestGlp1Log();
  const daysSince = getDaysSinceLastGlp1();
  const phaseColor = getPhaseColor(currentWeek);

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [dose, setDose] = useState(latest?.dose ?? DEFAULT_DOSE);
  const [site, setSite] = useState(SITE_OPTIONS[0]);
  const [sideEffects, setSideEffects] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!dose) {
      showToast('Please select a dose', 'error');
      return;
    }
    addGlp1Log({
      date,
      week: currentWeek,
      dose: parseFloat(dose),
      medication: DEFAULT_MEDICATION,
      site,
      sideEffects: sideEffects || null,
      notes: notes || null,
    });
    showToast('GLP-1 dose logged', 'success');
    setDate(today);
    setSideEffects('');
    setNotes('');
  };

  const handleDelete = (logDate) => {
    deleteGlp1Log(logDate);
    showToast('Dose removed', 'success');
  };

  // Next-dose math: Mounjaro is a once-weekly injection.
  let nextDoseLabel = null;
  let nextDoseClass = 'text-gray-400';
  if (latest && daysSince !== null) {
    const daysUntil = WEEKLY_CYCLE_DAYS - daysSince;
    if (daysUntil > 0) {
      nextDoseLabel = `Next dose in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
    } else if (daysUntil === 0) {
      nextDoseLabel = 'Next dose today';
      nextDoseClass = 'text-yellow-400 font-semibold';
    } else {
      nextDoseLabel = `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} overdue`;
      nextDoseClass = 'text-red-400 font-semibold';
    }
  }

  const sortedLogs = [...glp1Logs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-4 space-y-4">
      {/* Log Form */}
      <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Syringe size={18} style={{ color: phaseColor }} />
          <h2 className="text-lg font-semibold text-white">Log GLP-1 Dose</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Dose ({DEFAULT_MEDICATION}, mg)
            </label>
            <div className="grid grid-cols-6 gap-1">
              {DOSE_OPTIONS.map((d) => {
                const active = parseFloat(dose) === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDose(d)}
                    className={`py-2 rounded-lg text-sm font-mono font-semibold border transition-colors ${
                      active
                        ? 'border-transparent text-black'
                        : 'border-white/10 text-white bg-white/5 hover:bg-white/10'
                    }`}
                    style={active ? { backgroundColor: phaseColor } : undefined}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Injection Site</label>
            <select
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm appearance-none"
            >
              {SITE_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-[#0a0a14]">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Side Effects (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. mild nausea, fatigue day 2..."
              value={sideEffects}
              onChange={(e) => setSideEffects(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Notes (optional)</label>
            <input
              type="text"
              placeholder="Any other details..."
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
            Log Dose
          </button>
        </form>
      </div>

      {/* Latest Dose Card */}
      {latest && (
        <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
          <h3 className="text-xs text-gray-400 uppercase font-semibold mb-3">
            Latest Dose
          </h3>
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-gray-300">{latest.medication}</span>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-white">
                  {latest.dose}
                </div>
                <div className="text-xs text-gray-400">mg</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-gray-300 text-sm">Days since</span>
              <span className="font-mono font-semibold text-white">
                {daysSince}
              </span>
            </div>

            {nextDoseLabel && (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Schedule</span>
                <span className={`text-sm font-mono ${nextDoseClass}`}>
                  {nextDoseLabel}
                </span>
              </div>
            )}

            {latest.site && (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Last site</span>
                <span className="text-sm text-white">{latest.site}</span>
              </div>
            )}

            <div className="text-xs text-gray-500 pt-2">
              {new Date(latest.date).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      {sortedLogs.length > 0 && (
        <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-4">Dose History</h3>
          <div className="space-y-3">
            {sortedLogs.map((log, idx) => (
              <div
                key={`${log.date}-${idx}`}
                className="flex items-start justify-between text-sm border-t border-white/10 pt-3 first:border-0 first:pt-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-white font-semibold">
                    {log.dose} mg · {log.medication}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(log.date).toLocaleDateString()} · Week {log.week}
                  </div>
                  {log.site && (
                    <div className="text-xs text-gray-400">Site: {log.site}</div>
                  )}
                  {log.sideEffects && (
                    <div className="text-xs text-yellow-400/80 mt-1">
                      {log.sideEffects}
                    </div>
                  )}
                  {log.notes && (
                    <div className="text-xs text-gray-400 mt-1">{log.notes}</div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(log.date)}
                  className="ml-2 p-1 text-gray-500 hover:text-red-400 transition-colors"
                  aria-label="Delete dose"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
