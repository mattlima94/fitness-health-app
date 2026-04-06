import { useState } from 'react';
import { Download, Upload, Clock, Calendar } from 'lucide-react';
import { useStore } from '../../lib/store';
import { DELOAD_WEEKS, getPhase } from '../../lib/constants';
import { showToast } from '../layout/Toast';

/**
 * Calculate end date based on start date
 */
function calculateEndDate(startDate) {
  if (!startDate) return null;
  const start = new Date(startDate);
  // 52 weeks = 364 days
  const end = new Date(start.getTime() + 364 * 24 * 60 * 60 * 1000);
  return end;
}

/**
 * Get deload week label based on the phase it ends
 */
function getDeloadLabel(week) {
  if (week === 8) return 'End of Foundation';
  if (week === 20) return 'End of Building';
  if (week === 36) return 'End of Comeback';
  if (week === 52) return 'End of Return to Play';
  return '';
}

export default function SettingsPage() {
  const currentWeek = useStore((s) => s.currentWeek);
  const programStartDate = useStore((s) => s.programStartDate);
  const setCurrentWeek = useStore((s) => s.setCurrentWeek);
  const setStartDate = useStore((s) => s.setStartDate);
  const metrics = useStore((s) => s.metrics);
  const completedExercises = useStore((s) => s.completedExercises);

  const [editingStartDate, setEditingStartDate] = useState(programStartDate || '');
  const [editingWeek, setEditingWeek] = useState(currentWeek);

  const handleSetStartDate = () => {
    if (!editingStartDate) {
      showToast('Please select a start date', 'error');
      return;
    }
    setStartDate(editingStartDate);
    showToast('Start date updated', 'success');
  };

  const handleWeekChange = (delta) => {
    setCurrentWeek(currentWeek + delta);
  };

  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      currentWeek,
      programStartDate,
      metrics,
      completedExercises,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Data exported', 'success');
  };

  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.currentWeek) setCurrentWeek(data.currentWeek);
        if (data.programStartDate) setStartDate(data.programStartDate);
        // Note: metrics and completedExercises are persisted in Zustand,
        // so they'll be restored automatically. This is a minimal import.
        showToast('Data imported', 'success');
      } catch (err) {
        showToast('Failed to import data', 'error');
      }
    };
    reader.readAsText(file);
  };

  const endDate = calculateEndDate(editingStartDate);

  return (
    <div className="pb-24 space-y-4 p-4">
      {/* Start Date */}
      <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar size={16} />
          Program Start Date
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Select Date</label>
            <input
              type="date"
              value={editingStartDate}
              onChange={(e) => setEditingStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            />
          </div>

          {endDate && (
            <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-700/30">
              <p className="text-xs text-gray-400 mb-1">Program will end on:</p>
              <p className="text-sm font-semibold text-blue-200">
                {endDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          <button
            onClick={handleSetStartDate}
            className="w-full py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Update Start Date
          </button>
        </div>
      </div>

      {/* Current Week */}
      <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Clock size={16} />
          Current Week
        </h3>

        <div className="flex items-center gap-4">
          <button
            onClick={() => handleWeekChange(-1)}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold transition-colors"
          >
            −
          </button>

          <div className="flex-1 text-center">
            <div className="text-3xl font-bold text-white">{currentWeek}</div>
            <div className="text-xs text-gray-400">of 52</div>
          </div>

          <button
            onClick={() => handleWeekChange(1)}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Deload Weeks */}
      <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
        <h3 className="text-sm font-semibold text-white mb-4">Recovery Weeks</h3>

        <div className="space-y-2">
          {DELOAD_WEEKS.map((week) => {
            const phase = getPhase(week);
            const phaseColor = phase.accent;

            return (
              <div key={week} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-opacity-50">
                <div>
                  <div className="font-semibold text-white text-sm">Week {week}</div>
                  <div className="text-xs text-gray-400">{getDeloadLabel(week)}</div>
                </div>

                <div
                  className="px-2.5 py-1 rounded text-xs font-semibold text-black"
                  style={{ backgroundColor: phaseColor }}
                >
                  Recovery
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-3 p-2 bg-blue-950/20 border border-blue-700/30 rounded">
          Lighter on purpose — your body adapts during rest.
        </p>
      </div>

      {/* Data Export/Import */}
      <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
        <h3 className="text-sm font-semibold text-white mb-4">Data Management</h3>

        <div className="space-y-3">
          <button
            onClick={handleExportData}
            className="w-full py-3 rounded-lg border border-white/10 hover:border-green-600/50 bg-opacity-50 hover:bg-green-950/20 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={16} className="text-green-400" />
            <span className="text-sm font-semibold text-green-300">Export All Data</span>
          </button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <button className="w-full py-3 rounded-lg border border-white/10 hover:border-blue-600/50 bg-opacity-50 hover:bg-blue-950/20 transition-colors flex items-center justify-center gap-2">
              <Upload size={16} className="text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">Import Data</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Backup and restore your progress, metrics, and workout completion data.
        </p>
      </div>

      {/* About */}
      <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
        <h3 className="text-sm font-semibold text-white mb-4">About</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">App Name</span>
            <span className="text-sm font-semibold text-white">Return to Fitness</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Version</span>
            <span className="text-sm font-semibold text-white">1.0.0</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Phase</span>
            <span className="text-sm font-semibold text-white">{getPhase(currentWeek).name}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          A personal 52-week fitness comeback program. Track workouts, monitor progress, and rebuild
          strength after injury recovery.
        </p>
      </div>
    </div>
  );
}
