import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // Profile
      currentWeek: 1,
      programStartDate: null, // ISO date string

      // Workout completion - keyed as "week-dayIdx-exIdx"
      completedExercises: {},

      // Body metrics - array of { date, week, weight, waist, notes }
      metrics: [],

      // GLP-1 dose log - array of { date, week, dose, medication, site, sideEffects, notes }
      // Mateus is on Mounjaro (tirzepatide) 7.5 mg SQ weekly as of April 2026.
      glp1Logs: [],

      // UI state
      activeTab: 'today',
      selectedDay: null, // dayIndex for workout detail
      showTimer: false,
      timerDuration: 60,
      weekPickerOpen: false,

      // Actions
      setCurrentWeek: (week) => set({ currentWeek: Math.max(1, Math.min(52, week)) }),
      setStartDate: (date) => set({ programStartDate: date }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelectedDay: (day) => set({ selectedDay: day }),

      toggleExercise: (week, dayIdx, exIdx) => set((state) => {
        const key = `${week}-${dayIdx}-${exIdx}`;
        const updated = { ...state.completedExercises };
        if (updated[key]) {
          delete updated[key];
        } else {
          updated[key] = new Date().toISOString();
        }
        return { completedExercises: updated };
      }),

      isExerciseCompleted: (week, dayIdx, exIdx) => {
        return !!get().completedExercises[`${week}-${dayIdx}-${exIdx}`];
      },

      getDayProgress: (week, dayIdx, totalExercises) => {
        let done = 0;
        for (let i = 0; i < totalExercises; i++) {
          if (get().completedExercises[`${week}-${dayIdx}-${i}`]) done++;
        }
        return totalExercises > 0 ? done / totalExercises : 0;
      },

      getWeekProgress: (week, plan) => {
        if (!plan || !plan[week]) return 0;
        let done = 0, total = 0;
        plan[week].forEach((day, dayIdx) => {
          total += day.exercises.length;
          day.exercises.forEach((_, exIdx) => {
            if (get().completedExercises[`${week}-${dayIdx}-${exIdx}`]) done++;
          });
        });
        return total > 0 ? done / total : 0;
      },

      // Streak calculation - consecutive weeks with >= 2/3 days having progress
      getStreak: (plan) => {
        const state = get();
        let streak = 0;
        for (let w = state.currentWeek; w >= 1; w--) {
          if (!plan || !plan[w]) break;
          let daysWithProgress = 0;
          plan[w].forEach((day, dayIdx) => {
            const hasAny = day.exercises.some((_, exIdx) =>
              state.completedExercises[`${w}-${dayIdx}-${exIdx}`]
            );
            if (hasAny) daysWithProgress++;
          });
          if (daysWithProgress >= 2) streak++;
          else if (w < state.currentWeek) break; // allow current week to be incomplete
          else break;
        }
        return streak;
      },

      addMetric: (metric) => set((state) => ({
        metrics: [...state.metrics, { ...metric, date: metric.date || new Date().toISOString().split('T')[0] }]
      })),

      getLatestMetric: () => {
        const metrics = get().metrics;
        return metrics.length > 0 ? metrics[metrics.length - 1] : null;
      },

      getWeightTrend: (count = 20) => {
        return get().metrics.filter(m => m.weight).slice(-count);
      },

      // ── GLP-1 dose tracking ───────────────────────────────────────
      addGlp1Log: (log) => set((state) => ({
        glp1Logs: [
          ...state.glp1Logs,
          { ...log, date: log.date || new Date().toISOString().split('T')[0] },
        ],
      })),

      deleteGlp1Log: (date) => set((state) => ({
        glp1Logs: state.glp1Logs.filter((l) => l.date !== date),
      })),

      getLatestGlp1Log: () => {
        const logs = get().glp1Logs;
        if (logs.length === 0) return null;
        // Sort by date descending, return newest
        return [...logs].sort((a, b) => b.date.localeCompare(a.date))[0];
      },

      getDaysSinceLastGlp1: () => {
        const latest = get().getLatestGlp1Log();
        if (!latest) return null;
        const last = new Date(latest.date);
        const today = new Date();
        const diffMs = today.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0);
        return Math.round(diffMs / (1000 * 60 * 60 * 24));
      },

      // Timer
      toggleTimer: () => set((s) => ({ showTimer: !s.showTimer })),
      setTimerDuration: (d) => set({ timerDuration: d }),

      // Week picker
      toggleWeekPicker: () => set((s) => ({ weekPickerOpen: !s.weekPickerOpen })),
    }),
    {
      name: 'fitness-store',
      partialize: (state) => ({
        currentWeek: state.currentWeek,
        programStartDate: state.programStartDate,
        completedExercises: state.completedExercises,
        metrics: state.metrics,
        glp1Logs: state.glp1Logs,
      }),
    }
  )
);
